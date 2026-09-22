import { afterEach, describe, expect, test } from 'bun:test';
import { isGoodPartyProductionHost, shouldNoIndexHost } from './crawlableHosts';

describe('isGoodPartyProductionHost', () => {
	test('accepts the apex and its subdomains', () => {
		expect(isGoodPartyProductionHost('goodparty.org')).toBe(true);
		expect(isGoodPartyProductionHost('www.goodparty.org')).toBe(true);
		expect(isGoodPartyProductionHost('go.goodparty.org')).toBe(true);
	});

	test('rejects preview hosts and lookalike domains', () => {
		expect(isGoodPartyProductionHost('gp-marketing-peach.vercel.app')).toBe(false);
		expect(isGoodPartyProductionHost('localhost')).toBe(false);
		// Not a subdomain of ours; the check must not be a bare substring match.
		expect(isGoodPartyProductionHost('goodparty.org.evil.com')).toBe(false);
		expect(isGoodPartyProductionHost('notgoodparty.org')).toBe(false);
	});
});

describe('shouldNoIndexHost', () => {
	const originalVercelEnv = process.env['VERCEL_ENV'];

	afterEach(() => {
		if (originalVercelEnv === undefined) delete process.env['VERCEL_ENV'];
		else process.env['VERCEL_ENV'] = originalVercelEnv;
	});

	// The regression this exists for. The preview environment deploys with
	// VERCEL_ENV=production, so the old env-only gate never fired and Googlebot
	// crawled gp-marketing-peach.vercel.app.
	test('noindexes a *.vercel.app host even when VERCEL_ENV says production', () => {
		process.env['VERCEL_ENV'] = 'production';

		expect(shouldNoIndexHost('gp-marketing-peach.vercel.app')).toBe(true);
	});

	// The catastrophic failure mode to guard: this must never noindex the live site.
	test('leaves the production hosts indexable', () => {
		process.env['VERCEL_ENV'] = 'production';

		expect(shouldNoIndexHost('goodparty.org')).toBe(false);
		expect(shouldNoIndexHost('www.goodparty.org')).toBe(false);
	});

	test('ignores case and a port suffix', () => {
		process.env['VERCEL_ENV'] = 'production';

		expect(shouldNoIndexHost('GoodParty.ORG')).toBe(false);
		expect(shouldNoIndexHost('goodparty.org:443')).toBe(false);
		expect(shouldNoIndexHost('localhost:3009')).toBe(true);
	});

	// Belt and braces: a branch preview served on a *.goodparty.org hostname would
	// pass the allowlist, so the env signal is still honored on top of it.
	test('still honors VERCEL_ENV=preview on an allowlisted host', () => {
		process.env['VERCEL_ENV'] = 'preview';

		expect(shouldNoIndexHost('deploy-preview.goodparty.org')).toBe(true);
	});

	// A host we cannot classify must fail towards "indexable", because the other
	// direction would risk deindexing production on a proxy quirk.
	test('a missing host is left indexable rather than guessed', () => {
		process.env['VERCEL_ENV'] = 'production';

		expect(shouldNoIndexHost(null)).toBe(false);
		expect(shouldNoIndexHost(undefined)).toBe(false);
		expect(shouldNoIndexHost('')).toBe(false);
	});
});
