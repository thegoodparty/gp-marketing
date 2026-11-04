import { describe, expect, test } from 'bun:test';

import {
	PLEDGE_COPY_FLAG_KEY,
	PLEDGE_COPY_WINDOW_KEY,
	PLEDGE_MODAL_CTA_COPY,
	amplitudeCookieName,
	pickPledgeCopyVariant,
	pledgeCopyHeadScript,
} from './pledgeCopyTest';

const COOKIE = 'AMP_abcdefghij';

/** The cookie as the middleware bootstraps it and the Browser SDK writes it: base64 of URI-encoded JSON. */
const ampCookie = (deviceId: string, extra: Record<string, unknown> = {}) => btoa(encodeURIComponent(JSON.stringify({ deviceId, ...extra })));

describe('pickPledgeCopyVariant', () => {
	test('gives a device the same arm every time', () => {
		const header = `other=1; ${COOKIE}=${ampCookie('device-123')}`;
		const first = pickPledgeCopyVariant(header, COOKIE, PLEDGE_COPY_FLAG_KEY);
		expect(first).not.toBeNull();
		for (let i = 0; i < 5; i++) expect(pickPledgeCopyVariant(header, COOKIE, PLEDGE_COPY_FLAG_KEY)).toBe(first);
	});

	test('reads the cookie the Browser SDK rewrites with its session fields', () => {
		const plain = pickPledgeCopyVariant(`${COOKIE}=${ampCookie('device-123')}`, COOKIE, PLEDGE_COPY_FLAG_KEY);
		const rewritten = pickPledgeCopyVariant(
			`${COOKIE}=${ampCookie('device-123', { sessionId: 1792500000000, optOut: false })}`,
			COOKIE,
			PLEDGE_COPY_FLAG_KEY,
		);
		expect(rewritten).toBe(plain);
	});

	test('reads a URL-encoded cookie value the same as a raw one', () => {
		const raw = ampCookie('device-with-padding-x');
		expect(raw).toContain('=');
		expect(pickPledgeCopyVariant(`${COOKIE}=${encodeURIComponent(raw)}`, COOKIE, PLEDGE_COPY_FLAG_KEY)).toBe(
			pickPledgeCopyVariant(`${COOKIE}=${raw}`, COOKIE, PLEDGE_COPY_FLAG_KEY),
		);
	});

	test('leaves a visitor with no Amplitude cookie, or an unreadable one, out of the test', () => {
		expect(pickPledgeCopyVariant('', COOKIE, PLEDGE_COPY_FLAG_KEY)).toBeNull();
		expect(pickPledgeCopyVariant('AMP_other=abc', COOKIE, PLEDGE_COPY_FLAG_KEY)).toBeNull();
		expect(pickPledgeCopyVariant(`${COOKIE}=not-base64!`, COOKIE, PLEDGE_COPY_FLAG_KEY)).toBeNull();
		expect(pickPledgeCopyVariant(`${COOKIE}=${btoa(encodeURIComponent('{}'))}`, COOKIE, PLEDGE_COPY_FLAG_KEY)).toBeNull();
	});

	test('splits devices about evenly across the three arms', () => {
		const counts: Record<string, number> = { control: 0, b3: 0, alt: 0 };
		const total = 6000;
		for (let i = 0; i < total; i++) {
			const arm = pickPledgeCopyVariant(`${COOKIE}=${ampCookie(crypto.randomUUID())}`, COOKIE, PLEDGE_COPY_FLAG_KEY);
			if (arm) counts[arm] = (counts[arm] ?? 0) + 1;
		}
		for (const count of Object.values(counts)) {
			expect(count / total).toBeGreaterThan(0.3);
			expect(count / total).toBeLessThan(0.37);
		}
	});
});

describe('amplitudeCookieName', () => {
	test('matches the name the middleware and the Browser SDK use', () => {
		expect(amplitudeCookieName('abcdefghijklmnop')).toBe('AMP_abcdefghij');
		expect(amplitudeCookieName('short')).toBeNull();
		expect(amplitudeCookieName(undefined)).toBeNull();
	});
});

/**
 * The head script inlines the picker's source, so it has to run on its own
 * with nothing from this module in scope.
 */
describe('pledgeCopyHeadScript', () => {
	const run = (cookie: string) => {
		const styles: string[] = [];
		const win: Record<string, unknown> = {};
		const doc = {
			cookie,
			createElement: () => ({ textContent: '' }),
			head: { appendChild: (el: { textContent: string }) => styles.push(el.textContent) },
		};
		// The script is a string the page runs as-is, so running it as a string is the point of the test.
		// eslint-disable-next-line @typescript-eslint/no-implied-eval
		new Function('window', 'document', pledgeCopyHeadScript(COOKIE))(win, doc);
		return { variant: win[PLEDGE_COPY_WINDOW_KEY], styles };
	};

	test('stores the same arm the picker gives and shows it in place of control', () => {
		let sawRewrite = false;
		for (let i = 0; i < 30; i++) {
			const cookie = `${COOKIE}=${ampCookie(`device-${i}`)}`;
			const { variant, styles } = run(cookie);
			expect(variant).toBe(pickPledgeCopyVariant(cookie, COOKIE, PLEDGE_COPY_FLAG_KEY));
			if (variant === 'control') {
				expect(styles).toEqual([]);
			} else {
				sawRewrite = true;
				expect(styles).toEqual([`[data-pledge-copy="control"]{display:none!important}[data-pledge-copy="${variant}"]{display:contents!important}`]);
			}
		}
		expect(sawRewrite).toBe(true);
	});

	test('stores null and adds no style for a visitor with no cookie', () => {
		expect(run('')).toEqual({ variant: null, styles: [] });
	});
});

describe('PLEDGE_MODAL_CTA_COPY', () => {
	test('names the place when the page knows it and falls back to "your" when it does not', () => {
		expect(PLEDGE_MODAL_CTA_COPY.b3.prompt('Austin')).toBe("Want a real choice in Austin's next election?");
		expect(PLEDGE_MODAL_CTA_COPY.b3.prompt(null)).toBe('Want a real choice in your next election?');
	});
});
