import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

/**
 * The proxy half of the claim-request seam. Both public claim forms POST here
 * and this route forwards to gp-api's `POST /v1/public-person-profiles/claim-request`.
 *
 * The field that matters most is `source`: gp-api counts only `notify`
 * submissions into the subject's HubSpot `candidate_profile_requests`, so if
 * this route drops or mangles it, either the counter stops moving or owners'
 * own claims start counting as other people's interest. Neither surfaces an
 * error anywhere.
 *
 * See packages/gp-api/src/personProfiles/controllers/public-person-profiles.controller.ts
 * in the omni repo for the receiving end.
 */

const PERSON_ID = '74eee01a-1111-4222-8333-444444444444';
const EMAIL = 'visitor@example.com';

const { POST } = await import('./route');

let calls: Array<{ url: string; body: Record<string, unknown> }>;
let originalFetch: typeof globalThis.fetch;

beforeEach(() => {
	calls = [];
	originalFetch = globalThis.fetch;
	globalThis.fetch = (async (url: string, init?: { body?: string }) => {
		calls.push({ url: String(url), body: JSON.parse(init?.body ?? '{}') as Record<string, unknown> });
		return { ok: true, status: 200 } as Response;
	}) as unknown as typeof globalThis.fetch;
});

afterEach(() => {
	globalThis.fetch = originalFetch;
});

async function post(body: unknown): Promise<Response> {
	const req = new Request('https://marketing.test/api/people/claim-request', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
	});
	// The handler only uses the standard Request surface (json()).
	return POST(req as never);
}

describe('POST /api/people/claim-request', () => {
	test('forwards the notify discriminator, which is what drives the counter', async () => {
		const res = await post({ personId: PERSON_ID, email: EMAIL, firstname: 'Voter', source: 'notify' });

		expect(res.status).toBe(200);
		expect(calls).toHaveLength(1);
		expect(calls[0]?.url).toContain('/v1/public-person-profiles/claim-request');
		expect(calls[0]?.body).toMatchObject({
			personId: PERSON_ID,
			requesterEmail: EMAIL,
			requesterName: 'Voter',
			source: 'notify',
		});
	});

	test('forwards the owner discriminator', async () => {
		await post({ personId: PERSON_ID, email: EMAIL, source: 'owner' });

		expect(calls[0]?.body['source']).toBe('owner');
	});

	test('omits source when the caller sends none, rather than guessing one', async () => {
		// Nothing else on the site posts here, but an unattributed submission must
		// not be attributed by default: gp-api leaves it out of the count instead.
		await post({ personId: PERSON_ID, email: EMAIL });

		expect(calls[0]?.body).not.toHaveProperty('source');
	});

	test('drops an unrecognised source instead of losing the lead to a 400', async () => {
		// gp-api validates the enum strictly, so forwarding junk would reject the
		// whole submission. The lead is worth more than the attribution.
		const res = await post({ personId: PERSON_ID, email: EMAIL, source: 'somewhere-else' });

		expect(res.status).toBe(200);
		expect(calls[0]?.body).not.toHaveProperty('source');
		expect(calls[0]?.body['requesterEmail']).toBe(EMAIL);
	});

	test('still records an absent opt-in as no consent', async () => {
		await post({ personId: PERSON_ID, email: EMAIL, source: 'owner' });

		expect(calls[0]?.body['marketingConsent']).toBe(false);
	});

	test('rejects a bad personId before calling gp-api', async () => {
		const res = await post({ personId: 'nope', email: EMAIL, source: 'notify' });

		expect(res.status).toBe(400);
		expect(calls).toHaveLength(0);
	});

	test('rejects a bad email before calling gp-api', async () => {
		const res = await post({ personId: PERSON_ID, email: 'not-an-email', source: 'notify' });

		expect(res.status).toBe(400);
		expect(calls).toHaveLength(0);
	});
});
