import { describe, expect, it } from 'bun:test';
import { lpRedirectDestination } from './lp-redirects';

describe('lpRedirectDestination', () => {
	it('maps same-slug Unbounce paths to their goodparty.org pages', () => {
		for (const slug of [
			'voter-data',
			'sms-tools',
			'yard-signs',
			'serve',
			'e-book',
			'pro-lp',
			'pro-demo',
			'iva',
			'sticker-recipient',
		]) {
			expect(lpRedirectDestination('lp.goodparty.org', `/${slug}`)).toBe(`https://goodparty.org/${slug}`);
		}
	});

	it('maps renamed pages to their new slugs', () => {
		expect(lpRedirectDestination('lp.goodparty.org', '/pricing-page')).toBe('https://goodparty.org/pricing');
		expect(lpRedirectDestination('lp.goodparty.org', '/template-library')).toBe('https://goodparty.org/templates');
		expect(lpRedirectDestination('lp.goodparty.org', '/circle-community')).toBe('https://goodparty.org/community');
	});

	it('sends pages without a goodparty.org equivalent to the homepage', () => {
		expect(lpRedirectDestination('lp.goodparty.org', '/website-builder')).toBe('https://goodparty.org/');
	});

	it('normalizes trailing slashes before matching', () => {
		expect(lpRedirectDestination('lp.goodparty.org', '/pro-demo/')).toBe('https://goodparty.org/pro-demo');
		expect(lpRedirectDestination('lp.goodparty.org', '/iva/')).toBe('https://goodparty.org/iva');
	});

	it('sends unknown lp paths to the homepage', () => {
		expect(lpRedirectDestination('lp.goodparty.org', '/some-retired-page')).toBe('https://goodparty.org/');
		expect(lpRedirectDestination('lp.goodparty.org', '/')).toBe('https://goodparty.org/');
	});

	it('matches the host case-insensitively and ignores the port', () => {
		expect(lpRedirectDestination('LP.goodparty.org:443', '/voter-data')).toBe('https://goodparty.org/voter-data');
	});

	it('ignores every other host', () => {
		expect(lpRedirectDestination('goodparty.org', '/voter-data')).toBeNull();
		expect(lpRedirectDestination('www.goodparty.org', '/pro-demo')).toBeNull();
		expect(lpRedirectDestination('localhost:3009', '/pricing-page')).toBeNull();
		expect(lpRedirectDestination(null, '/pricing-page')).toBeNull();
	});
});
