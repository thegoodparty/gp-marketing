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
/** Requests to Google's siteverify, which are form-encoded rather than JSON. */
let verifyCalls: URLSearchParams[];
/** Google's siteverify answer; `null` stands for Google being unreachable. */
let verifyBody: Record<string, unknown> | null;
let originalFetch: typeof globalThis.fetch;
/** gp-api's response body; `null` stands for a 2xx that cannot be parsed. */
let upstreamBody: Record<string, unknown> | null;

const CLAIM_REQUEST_ID = 'clr_01HZY8QK5M';

beforeEach(() => {
	calls = [];
	verifyCalls = [];
	verifyBody = { success: true };
	upstreamBody = { id: CLAIM_REQUEST_ID, personId: PERSON_ID, createdAt: '2026-08-24T00:00:00.000Z' };
	originalFetch = globalThis.fetch;
	globalThis.fetch = (async (url: string, init?: { body?: string }) => {
		if (String(url).startsWith('https://www.google.com/recaptcha/')) {
			verifyCalls.push(new URLSearchParams(init?.body ?? ''));
			if (verifyBody === null) throw new Error('network down');
			const answer = verifyBody;
			return { ok: true, status: 200, json: async () => answer } as Response;
		}
		calls.push({ url: String(url), body: JSON.parse(init?.body ?? '{}') as Record<string, unknown> });
		return {
			ok: true,
			status: 200,
			json: async () => {
				if (upstreamBody === null) throw new Error('unreadable body');
				return upstreamBody;
			},
		} as Response;
	}) as unknown as typeof globalThis.fetch;
});

afterEach(() => {
	globalThis.fetch = originalFetch;
	delete process.env['RECAPTCHA_SECRET_KEY'];
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

	/**
	 * The client needs the stored-lead id to put on the success event, and this
	 * route is the only place it can come from: the browser never talks to gp-api
	 * directly. Returning a bare `{ ok: true }` — as this did before — leaves the
	 * event with nothing to tie it to the row it came from.
	 */
	test('hands back the stored-lead id so the success event can carry it', async () => {
		const res = await post({ personId: PERSON_ID, email: EMAIL, source: 'notify' });

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ ok: true, claimRequestId: CLAIM_REQUEST_ID });
	});

	/**
	 * By this point gp-api has committed the lead, so an unreadable body costs the
	 * analytics join and nothing else. Failing here would turn a stored lead into
	 * an error on the visitor's screen.
	 */
	test('still succeeds when the upstream body cannot be parsed', async () => {
		upstreamBody = null;

		const res = await post({ personId: PERSON_ID, email: EMAIL, source: 'notify' });

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ ok: true, claimRequestId: null });
	});

	test('omits an id that is not a usable string', async () => {
		upstreamBody = { id: '', personId: PERSON_ID };

		const res = await post({ personId: PERSON_ID, email: EMAIL, source: 'notify' });

		expect(await res.json()).toEqual({ ok: true, claimRequestId: null });
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

/**
 * The voter form's "I'm not a robot" box. Off until the secret is set in
 * Vercel, so previews and local dev keep working without Google keys.
 */
describe('the reCAPTCHA check', () => {
	const SECRET = 'test-secret';

	test('is skipped while no secret is configured', async () => {
		const res = await post({ personId: PERSON_ID, email: EMAIL, source: 'notify' });

		expect(res.status).toBe(200);
		expect(verifyCalls).toHaveLength(0);
	});

	test('asks Google about the token and forwards the request when it passes', async () => {
		process.env['RECAPTCHA_SECRET_KEY'] = SECRET;

		const res = await post({ personId: PERSON_ID, email: EMAIL, source: 'notify', recaptchaToken: 'tok' });

		expect(res.status).toBe(200);
		expect(verifyCalls.map(p => [p.get('secret'), p.get('response')])).toEqual([[SECRET, 'tok']]);
		expect(calls).toHaveLength(1);
		// The token is ours to check, not gp-api's.
		expect(calls[0]?.body).not.toHaveProperty('recaptchaToken');
	});

	test('rejects a request with no token without asking Google or calling gp-api', async () => {
		process.env['RECAPTCHA_SECRET_KEY'] = SECRET;

		const res = await post({ personId: PERSON_ID, email: EMAIL, source: 'notify' });

		expect(res.status).toBe(400);
		expect(verifyCalls).toHaveLength(0);
		expect(calls).toHaveLength(0);
	});

	test('rejects a token Google does not accept', async () => {
		process.env['RECAPTCHA_SECRET_KEY'] = SECRET;
		verifyBody = { success: false, 'error-codes': ['timeout-or-duplicate'] };

		const res = await post({ personId: PERSON_ID, email: EMAIL, source: 'notify', recaptchaToken: 'used' });

		expect(res.status).toBe(400);
		expect(calls).toHaveLength(0);
	});

	test('fails closed when Google cannot be reached', async () => {
		process.env['RECAPTCHA_SECRET_KEY'] = SECRET;
		verifyBody = null;

		const res = await post({ personId: PERSON_ID, email: EMAIL, source: 'notify', recaptchaToken: 'tok' });

		expect(res.status).toBe(400);
		expect(calls).toHaveLength(0);
	});
});
