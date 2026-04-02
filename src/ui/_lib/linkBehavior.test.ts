import { isExternalToEcosystem } from './linkBehavior';

describe('isExternalToEcosystem', () => {
	it('treats empty or whitespace href as internal', () => {
		expect(isExternalToEcosystem(undefined)).toBe(false);
		expect(isExternalToEcosystem(null as unknown as string)).toBe(false);
		expect(isExternalToEcosystem(42 as unknown as string)).toBe(false);
		expect(isExternalToEcosystem('')).toBe(false);
		expect(isExternalToEcosystem('   ')).toBe(false);
	});

	it('treats hash-only hrefs as internal', () => {
		expect(isExternalToEcosystem('#section')).toBe(false);
	});

	it('treats root-relative hrefs as internal', () => {
		expect(isExternalToEcosystem('/')).toBe(false);
		expect(isExternalToEcosystem('/pricing')).toBe(false);
	});

	it('treats goodparty ecosystem hosts as internal', () => {
		expect(isExternalToEcosystem('https://goodparty.org')).toBe(false);
		expect(isExternalToEcosystem('https://www.goodparty.org/about')).toBe(false);
		expect(isExternalToEcosystem('https://app.goodparty.org/dashboard')).toBe(false);
	});

	it('treats non-ecosystem hosts as external', () => {
		expect(isExternalToEcosystem('https://x.com/goodparty')).toBe(true);
		expect(isExternalToEcosystem('https://docs.google.com/some-doc')).toBe(true);
	});

	it('treats malformed URLs as external for safety', () => {
		expect(isExternalToEcosystem('http://[')).toBe(true);
	});

	it('treats mailto and tel as internal (no off-site navigation)', () => {
		expect(isExternalToEcosystem('mailto:foo@example.com')).toBe(false);
		expect(isExternalToEcosystem('tel:+15551234567')).toBe(false);
		expect(isExternalToEcosystem('sms:+15551234567')).toBe(false);
	});

	it('treats goodparty subdomains as internal', () => {
		expect(isExternalToEcosystem('https://staging.goodparty.org/path')).toBe(false);
	});

	it('treats other sites subdomains as external', () => {
		expect(isExternalToEcosystem('https://app.example.com/dashboard')).toBe(true);
	});
});

