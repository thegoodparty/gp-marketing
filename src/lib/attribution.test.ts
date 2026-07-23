import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import {
	ATTRIBUTION_PARAM_KEYS,
	captureAttributionFromSearch,
	decorateAppUrl,
	GP_ATTRIBUTION_COOKIE,
	isAppGoodPartyUrl,
	mergeAttribution,
	parseAttributionFromSearch,
	readGpAttributionCookie,
	serializeGpAttributionCookie,
	writeGpAttributionCookie,
} from './attribution';

type CookieDocument = { cookie: string };
type ProtocolWindow = { location: { protocol: string } };
type MutableGlobals = {
	document?: CookieDocument;
	window?: ProtocolWindow;
};

const testGlobal = globalThis as unknown as MutableGlobals;
const originalDocument = testGlobal.document;
const originalWindow = testGlobal.window;

function installBrowserGlobals() {
	testGlobal.document = { cookie: '' };
	testGlobal.window = { location: { protocol: 'https:' } };
}

function restoreBrowserGlobals() {
	testGlobal.document = originalDocument;
	testGlobal.window = originalWindow;
}

function getDocumentCookie(): string {
	return testGlobal.document?.cookie ?? '';
}

function setDocumentCookie(value: string) {
	if (!testGlobal.document) {
		throw new Error('document stub missing');
	}
	testGlobal.document.cookie = value;
}

describe('parseAttributionFromSearch', () => {
	test('captures only allowlisted params', () => {
		const parsed = parseAttributionFromSearch(
			'?fbclid=abc&gclid=def&utm_source=meta&utm_medium=cpc&utm_campaign=test&utm_content=ad1&utm_term=kw&foo=bar',
		);
		expect(parsed).toEqual({
			fbclid: 'abc',
			gclid: 'def',
			utm_source: 'meta',
			utm_medium: 'cpc',
			utm_campaign: 'test',
			utm_content: 'ad1',
			utm_term: 'kw',
		});
		expect(parsed).not.toHaveProperty('foo');
	});

	test('returns empty object when no attribution params', () => {
		expect(parseAttributionFromSearch('?foo=bar')).toEqual({});
	});
});

describe('mergeAttribution', () => {
	test('sets _ts when fbclid is newly captured', () => {
		const now = 1_700_000_000_000;
		const originalNow = Date.now;
		Date.now = () => now;
		try {
			const merged = mergeAttribution(null, { fbclid: 'abc' });
			expect(merged?._ts).toBe(now);
		} finally {
			Date.now = originalNow;
		}
	});

	test('retains existing fbclid and _ts when later URL has only utm params', () => {
		const existing = { fbclid: 'abc', _ts: 1_000, utm_source: 'meta' };
		const merged = mergeAttribution(existing, { utm_campaign: 'spring' });
		expect(merged).toEqual({
			fbclid: 'abc',
			_ts: 1_000,
			utm_source: 'meta',
			utm_campaign: 'spring',
		});
	});

	test('refreshes _ts when a new fbclid arrives', () => {
		const now = 2_000;
		const originalNow = Date.now;
		Date.now = () => now;
		try {
			const existing = { fbclid: 'old', _ts: 1_000 };
			const merged = mergeAttribution(existing, { fbclid: 'new' });
			expect(merged?.fbclid).toBe('new');
			expect(merged?._ts).toBe(now);
		} finally {
			Date.now = originalNow;
		}
	});

	test('keeps _ts when the same fbclid is captured again', () => {
		const existing = { fbclid: 'abc', _ts: 1_000, utm_source: 'meta' };
		const merged = mergeAttribution(existing, { fbclid: 'abc', utm_campaign: 'spring' });
		expect(merged?._ts).toBe(1_000);
	});

	test('returns existing when incoming has no attribution params', () => {
		const existing = { fbclid: 'abc', _ts: 1_000 };
		expect(mergeAttribution(existing, {})).toBe(existing);
	});
});

describe('readGpAttributionCookie', () => {
	test('parses valid cookie payload', () => {
		const payload = serializeGpAttributionCookie({ fbclid: 'abc', _ts: 123 });
		const cookie = `${GP_ATTRIBUTION_COOKIE}=${payload}`;
		expect(readGpAttributionCookie(cookie)).toEqual({ fbclid: 'abc', _ts: 123 });
	});

	test('returns null for malformed cookie JSON', () => {
		expect(readGpAttributionCookie(`${GP_ATTRIBUTION_COOKIE}=not-json`)).toBeNull();
	});

	test('returns null for array payload', () => {
		const payload = encodeURIComponent(JSON.stringify(['bad']));
		expect(readGpAttributionCookie(`${GP_ATTRIBUTION_COOKIE}=${payload}`)).toBeNull();
	});
});

describe('isAppGoodPartyUrl', () => {
	test('matches app host exactly', () => {
		expect(isAppGoodPartyUrl('https://app.goodparty.org/sign-up')).toBe(true);
		expect(isAppGoodPartyUrl('https://www.goodparty.org/sign-up')).toBe(false);
		expect(isAppGoodPartyUrl('https://evil-app.goodparty.org/sign-up')).toBe(false);
	});
});

describe('decorateAppUrl', () => {
	const attribution = {
		fbclid: 'abc',
		utm_source: 'meta',
		_ts: 1_700_000_000_000,
	};

	test('appends missing attribution params', () => {
		const decorated = decorateAppUrl('https://app.goodparty.org/sign-up', attribution);
		const url = new URL(decorated);
		expect(url.searchParams.get('fbclid')).toBe('abc');
		expect(url.searchParams.get('utm_source')).toBe('meta');
		expect(url.searchParams.has('_ts')).toBe(false);
	});

	test('does not overwrite existing destination params', () => {
		const decorated = decorateAppUrl(
			'https://app.goodparty.org/sign-up?fbclid=existing&utm_source=keep',
			attribution,
		);
		const url = new URL(decorated);
		expect(url.searchParams.get('fbclid')).toBe('existing');
		expect(url.searchParams.get('utm_source')).toBe('keep');
	});

	test('preserves fragments', () => {
		const decorated = decorateAppUrl('https://app.goodparty.org/sign-up#step-2', attribution);
		expect(decorated).toBe('https://app.goodparty.org/sign-up?fbclid=abc&utm_source=meta#step-2');
	});

	test('leaves non-app URLs unchanged', () => {
		const href = 'https://goodparty.org/free-campaign-support';
		expect(decorateAppUrl(href, attribution)).toBe(href);
	});

	test('returns href unchanged when attribution is null', () => {
		const href = 'https://app.goodparty.org/sign-up';
		expect(decorateAppUrl(href, null)).toBe(href);
	});
});

describe('captureAttributionFromSearch', () => {
	beforeEach(installBrowserGlobals);
	afterEach(restoreBrowserGlobals);

	test('writes cookie and returns merged data when incoming params are present', () => {
		const now = 1_700_000_000_000;
		const originalNow = Date.now;
		Date.now = () => now;
		try {
			const captured = captureAttributionFromSearch('?fbclid=abc&utm_source=meta', 'localhost');

			expect(captured).toEqual({ fbclid: 'abc', utm_source: 'meta', _ts: now });
			expect(getDocumentCookie()).toContain(`${GP_ATTRIBUTION_COOKIE}=`);
			expect(readGpAttributionCookie(getDocumentCookie())).toEqual(captured);
		} finally {
			Date.now = originalNow;
		}
	});

	test('returns existing cookie without writing when no incoming params', () => {
		const existing = { fbclid: 'abc', _ts: 1_000, utm_source: 'meta' };
		setDocumentCookie(`${GP_ATTRIBUTION_COOKIE}=${serializeGpAttributionCookie(existing)}`);
		const cookieBefore = getDocumentCookie();

		const captured = captureAttributionFromSearch('?foo=bar', 'localhost');

		expect(captured).toEqual(existing);
		expect(getDocumentCookie()).toBe(cookieBefore);
	});

	test('merges incoming params with existing cookie and writes updated value', () => {
		const existing = { fbclid: 'abc', _ts: 1_000, utm_source: 'meta' };
		setDocumentCookie(`${GP_ATTRIBUTION_COOKIE}=${serializeGpAttributionCookie(existing)}`);

		const captured = captureAttributionFromSearch('?utm_campaign=spring', 'localhost');

		expect(captured).toEqual({
			fbclid: 'abc',
			_ts: 1_000,
			utm_source: 'meta',
			utm_campaign: 'spring',
		});
		expect(readGpAttributionCookie(getDocumentCookie())).toEqual(captured);
	});
});

describe('writeGpAttributionCookie', () => {
	beforeEach(installBrowserGlobals);
	afterEach(restoreBrowserGlobals);

	test('writes host-only cookie on non-production hostname', () => {
		writeGpAttributionCookie({ fbclid: 'abc' }, 'localhost');

		const cookie = getDocumentCookie();
		expect(cookie).toContain(`${GP_ATTRIBUTION_COOKIE}=`);
		expect(cookie).toContain('path=/');
		expect(cookie).toContain('max-age=7776000');
		expect(cookie).toContain('SameSite=Lax');
		expect(cookie).not.toContain('domain=');
		expect(cookie).not.toContain('Secure');
	});

	test('writes domain-scoped Secure cookie on production hostname over https', () => {
		writeGpAttributionCookie({ fbclid: 'abc' }, 'www.goodparty.org');

		const cookie = getDocumentCookie();
		expect(cookie).toContain('domain=.goodparty.org');
		expect(cookie).toContain('Secure');
	});

	test('returns without writing when document is undefined', () => {
		testGlobal.document = undefined;

		expect(() => writeGpAttributionCookie({ fbclid: 'abc' }, 'localhost')).not.toThrow();
	});
});

describe('ATTRIBUTION_PARAM_KEYS', () => {
	test('includes expected keys only', () => {
		expect([...ATTRIBUTION_PARAM_KEYS]).toEqual([
			'fbclid',
			'gclid',
			'utm_source',
			'utm_medium',
			'utm_campaign',
			'utm_content',
			'utm_term',
		]);
	});
});
