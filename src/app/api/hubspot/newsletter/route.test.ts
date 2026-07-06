import { afterEach, describe, expect, mock, test } from 'bun:test';
import { NextRequest } from 'next/server';

const originalFetch = globalThis.fetch;

mock.module('next/headers', () => ({
	cookies: async () => ({
		get: () => undefined,
	}),
}));

afterEach(() => {
	globalThis.fetch = originalFetch;
});

const VALID_FORM_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

function createRequest(body: Record<string, unknown>) {
	return new NextRequest('http://localhost/api/hubspot/newsletter', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
}

describe('POST /api/hubspot/newsletter', () => {
	test('returns 400 for missing formId', async () => {
		const { POST } = await import('./route');
		const response = await POST(
			createRequest({ email: 'user@example.com', firstname: 'Jane', lastname: 'Doe' }),
		);
		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({ error: 'Missing formId' });
	});

	test('returns 400 for invalid formId', async () => {
		const { POST } = await import('./route');
		const response = await POST(
			createRequest({ formId: '../../v1/other-endpoint', email: 'user@example.com' }),
		);
		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({ error: 'Invalid formId' });
	});

	test('returns 400 for invalid email', async () => {
		const { POST } = await import('./route');
		const response = await POST(
			createRequest({ formId: VALID_FORM_ID, email: 'not-an-email', firstname: 'Jane', lastname: 'Doe' }),
		);
		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({ error: 'A valid email is required' });
	});

	test('forwards submission to HubSpot', async () => {
		const fetchMock = mock(async (input: RequestInfo | URL) => {
			const url = String(input);
			expect(url).toContain('/integration/submit/');
			expect(url).toContain(`/${VALID_FORM_ID}`);
			return new Response(JSON.stringify({ inlineMessage: 'ok' }), { status: 200 });
		});
		globalThis.fetch = fetchMock as typeof fetch;

		const { POST } = await import('./route');
		const response = await POST(
			createRequest({
				formId: VALID_FORM_ID,
				email: 'user@example.com',
				firstname: 'Jane',
				lastname: 'Doe',
			}),
		);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ ok: true });
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	test('forwards HubSpot 4xx error status and details', async () => {
		const hubspotError = { message: 'INVALID_EMAIL', status: 'error' };
		const fetchMock = mock(async () =>
			new Response(JSON.stringify(hubspotError), { status: 400 }),
		);
		globalThis.fetch = fetchMock as typeof fetch;

		const { POST } = await import('./route');
		const response = await POST(
			createRequest({ formId: VALID_FORM_ID, email: 'user@example.com' }),
		);
		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({
			error: 'HubSpot submission failed',
			details: hubspotError,
		});
	});

	test('returns generic 502 for HubSpot 5xx errors without details', async () => {
		const hubspotError = { message: 'Internal server error', traceId: 'abc-123' };
		const fetchMock = mock(async () =>
			new Response(JSON.stringify(hubspotError), { status: 503 }),
		);
		globalThis.fetch = fetchMock as typeof fetch;

		const { POST } = await import('./route');
		const response = await POST(
			createRequest({ formId: VALID_FORM_ID, email: 'user@example.com' }),
		);
		expect(response.status).toBe(502);
		expect(await response.json()).toEqual({ error: 'HubSpot submission failed' });
	});
});
