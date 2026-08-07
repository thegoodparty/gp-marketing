import { expect, test } from '@playwright/test';

/**
 * End-to-end check of the gp-api → marketing cache-bust seam against a real
 * deployment. The unit/integration coverage in
 * src/app/api/revalidate-person/route.test.ts proves the handler's logic; this
 * proves the deployed thing is reachable, configured, and that the secret in the
 * marketing deployment matches the one gp-api sends.
 *
 * That last part is the failure this is really for: gp-api treats revalidation
 * as best-effort and never retries or surfaces an error to the user, so a secret
 * mismatch between AWS (GP_API_* bundle) and Vercel looks exactly like success
 * from the product side while every public profile silently serves stale content
 * until its hourly window elapses.
 *
 * Run against an environment:
 *   E2E_BASE_URL=https://gp-marketing-git-develop-good-party.vercel.app \
 *   MARKETING_REVALIDATE_SECRET=<same value gp-api sends> \
 *   bunx playwright test e2e/revalidate-person.spec.ts
 *
 * Without the secret the authenticated case is skipped, so the rejection cases
 * still run anywhere.
 */

const BASE = (process.env['E2E_BASE_URL'] ?? 'https://goodparty.org').replace(/\/+$/, '');
const ENDPOINT = `${BASE}/api/revalidate-person`;
const SECRET = process.env['MARKETING_REVALIDATE_SECRET'];

// Any well-formed uuid works: the handler busts a cache tag, and busting a tag
// nothing is cached under is a no-op. Using a fixed nonexistent id keeps the
// test from touching a real person's page.
const PROBE_PERSON_ID = '00000000-0000-4000-8000-000000000000';

test.describe('POST /api/revalidate-person', () => {
	test('is deployed and configured, not returning 503', async ({ request }) => {
		const res = await request.post(ENDPOINT, {
			headers: { 'x-revalidate-secret': 'definitely-not-the-secret' },
			data: { personId: PROBE_PERSON_ID },
		});

		// 503 means MARKETING_REVALIDATE_SECRET is missing from this deployment,
		// which is the one outcome that can't be distinguished from a stale page
		// by looking at the product side.
		expect(res.status(), 'MARKETING_REVALIDATE_SECRET is not set on this deployment').not.toBe(
			503,
		);
		expect(res.status()).toBe(401);
	});

	test('rejects a request with no secret', async ({ request }) => {
		const res = await request.post(ENDPOINT, { data: { personId: PROBE_PERSON_ID } });

		expect(res.status()).toBe(401);
	});

	test('accepts the secret gp-api sends and reports the busted tag', async ({ request }) => {
		test.skip(!SECRET, 'Set MARKETING_REVALIDATE_SECRET to the value gp-api sends');

		const res = await request.post(ENDPOINT, {
			headers: { 'x-revalidate-secret': SECRET as string },
			data: { personId: PROBE_PERSON_ID },
		});

		expect(
			res.status(),
			'401 here means the marketing deployment and gp-api hold different secrets',
		).toBe(200);
		expect(await res.json()).toEqual({
			revalidated: true,
			tag: `person:${PROBE_PERSON_ID}`,
		});
	});

	test('rejects a personId that is not a uuid', async ({ request }) => {
		test.skip(!SECRET, 'Set MARKETING_REVALIDATE_SECRET to the value gp-api sends');

		const res = await request.post(ENDPOINT, {
			headers: { 'x-revalidate-secret': SECRET as string },
			data: { personId: 'allen-slagle' },
		});

		expect(res.status()).toBe(400);
	});
});
