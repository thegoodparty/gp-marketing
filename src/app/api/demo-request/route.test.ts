import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

/**
 * The proxy between the Demo Request block and the qualifier service. The block
 * posts PII here rather than to a content-configurable URL, so the one thing this
 * route must never do is forward anywhere other than the fixed qualifier address.
 */

const { POST } = await import('./route');

let calls: Array<{ url: string; body: Record<string, unknown>; headers: Record<string, string> }>;
let originalFetch: typeof globalThis.fetch;
let upstream: { ok: boolean; status: number; body: unknown };

const ANSWERS = {
	city: 'Traverse City',
	state: 'MI',
	office: 'council',
	goals: ['voter_data'],
	stage: 'ballot',
	first_name: 'Test',
	last_name: 'Candidate',
	email: 'candidate@example.com',
	phone: '(231) 555-0142',
	sms_consent: true,
};

beforeEach(() => {
	calls = [];
	upstream = { ok: true, status: 200, body: { outcome: 'pass', calendar_url: 'https://meetings.hubspot.com/example' } };
	originalFetch = globalThis.fetch;
	globalThis.fetch = (async (url: string, init?: { body?: string; headers?: Record<string, string> }) => {
		calls.push({ url: String(url), body: JSON.parse(init?.body ?? '{}') as Record<string, unknown>, headers: init?.headers ?? {} });
		return {
			ok: upstream.ok,
			status: upstream.status,
			json: async () => upstream.body,
		} as Response;
	}) as unknown as typeof globalThis.fetch;
});

afterEach(() => {
	globalThis.fetch = originalFetch;
});

async function post(body: unknown, headers: Record<string, string> = {}): Promise<Response> {
	const req = new Request('https://marketing.test/api/demo-request', {
		method: 'POST',
		headers: { 'content-type': 'application/json', ...headers },
		body: typeof body === 'string' ? body : JSON.stringify(body),
	});
	return POST(req as never);
}

describe('POST /api/demo-request', () => {
	test('forwards the answers to the fixed qualifier endpoint and returns its verdict', async () => {
		const res = await post(ANSWERS, { 'x-forwarded-for': '203.0.113.9, 10.0.0.1' });

		expect(res.status).toBe(200);
		expect(calls).toHaveLength(1);
		expect(calls[0]?.url).toBe('https://demo-qualifier-production.up.railway.app/qualify');
		expect(calls[0]?.body).toMatchObject(ANSWERS);
		expect(calls[0]?.headers['X-Forwarded-For']).toBe('203.0.113.9');
		expect(await res.json()).toMatchObject({ outcome: 'pass', calendar_url: 'https://meetings.hubspot.com/example' });
	});

	test('passes a qualifier validation message through with its 400 status', async () => {
		upstream = { ok: false, status: 400, body: { error: 'Please add your city and state.' } };

		const res = await post({ ...ANSWERS, city: '' });

		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: 'Please add your city and state.' });
	});

	test('hides upstream failures behind a generic 502', async () => {
		upstream = { ok: false, status: 500, body: { error: 'stack trace goes here' } };

		const res = await post(ANSWERS);

		expect(res.status).toBe(502);
		expect(await res.json()).toEqual({ error: 'Demo request failed' });
	});

	test('rejects a body that is not a JSON object without calling the qualifier', async () => {
		expect((await post('not json')).status).toBe(400);
		expect((await post([1, 2, 3])).status).toBe(400);
		expect(calls).toHaveLength(0);
	});
});
