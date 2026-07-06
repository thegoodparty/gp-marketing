import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import { NextRequest } from 'next/server';

const originalFetch = globalThis.fetch;
const originalEnv = process.env['HUBSPOT_ALLOWED_FORM_IDS'];

mock.module('next/headers', () => ({
	cookies: async () => ({
		get: () => undefined,
	}),
}));

beforeEach(() => {
	delete process.env['HUBSPOT_ALLOWED_FORM_IDS'];
});

afterEach(() => {
	globalThis.fetch = originalFetch;
	if (originalEnv === undefined) {
		delete process.env['HUBSPOT_ALLOWED_FORM_IDS'];
	} else {
		process.env['HUBSPOT_ALLOWED_FORM_IDS'] = originalEnv;
	}
});

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
		expect(await response.json()).toEqual({ error: 'Missing or disallowed formId' });
	});

	test('returns 400 for disallowed formId when allowlist is set', async () => {
		process.env['HUBSPOT_ALLOWED_FORM_IDS'] = 'allowed-form-id';
		const { POST } = await import('./route');
		const response = await POST(
			createRequest({
				formId: 'other-form-id',
				email: 'user@example.com',
				firstname: 'Jane',
				lastname: 'Doe',
			}),
		);
		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({ error: 'Missing or disallowed formId' });
	});

	test('accepts any formId when allowlist is empty', async () => {
		globalThis.fetch = mock(async () => new Response(JSON.stringify({ inlineMessage: 'ok' }), { status: 200 })) as typeof fetch;

		const { POST } = await import('./route');
		const response = await POST(
			createRequest({
				formId: 'any-form-id',
				email: 'user@example.com',
				firstname: 'Jane',
				lastname: 'Doe',
			}),
		);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ ok: true });
	});

	test('forwards allowed formId to HubSpot', async () => {
		process.env['HUBSPOT_ALLOWED_FORM_IDS'] = 'allowed-form-id';
		const fetchMock = mock(async (input: RequestInfo | URL) => {
			const url = String(input);
			expect(url).toContain('/allowed-form-id');
			return new Response(JSON.stringify({ inlineMessage: 'ok' }), { status: 200 });
		});
		globalThis.fetch = fetchMock as typeof fetch;

		const { POST } = await import('./route');
		const response = await POST(
			createRequest({
				formId: 'allowed-form-id',
				email: 'user@example.com',
				firstname: 'Jane',
				lastname: 'Doe',
			}),
		);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ ok: true });
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});
