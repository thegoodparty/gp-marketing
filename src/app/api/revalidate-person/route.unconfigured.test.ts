/**
 * The 503 "not configured" branch, which cannot be covered from route.test.ts.
 *
 * `~/lib/env` reads process.env at module scope and the route binds the secret at
 * import, so a single file can only ever exercise one side of the guard. This file
 * gets its own module registry, so it can bind the same route against an absent
 * secret.
 *
 * The mock spreads the real exports rather than returning a bare object: other
 * modules pulled in through this import graph read other env values, and replacing
 * the whole module with a single key would strand them on undefined.
 *
 * Worth guarding because the failure mode is silent. If the branch is ever dropped,
 * a deployment missing MARKETING_REVALIDATE_SECRET stops announcing itself and
 * instead compares against an undefined secret — which is a 500 at best, and at
 * worst degrades into accepting whatever the caller sent.
 */
import { describe, expect, mock, test } from 'bun:test';

const realEnv = await import('~/lib/env');
mock.module('~/lib/env', () => ({ ...realEnv, personRevalidateSecret: undefined }));

const { POST } = await import('./route');

const PERSON_ID = '74eee01a-1111-4222-8333-444444444444';

async function post(secret: string | null): Promise<Response> {
	const headers = new Headers({ 'content-type': 'application/json' });
	if (secret != null) headers.set('x-revalidate-secret', secret);
	const req = new Request('https://marketing.test/api/revalidate-person', {
		method: 'POST',
		headers,
		body: JSON.stringify({ personId: PERSON_ID }),
	});
	// The handler only touches the standard Request surface (headers + json()).
	return POST(req as never);
}

describe('POST /api/revalidate-person — secret not configured', () => {
	test('answers 503 rather than comparing against an absent secret', async () => {
		const res = await post('any-secret');

		expect(res.status).toBe(503);
	});

	// The guard has to precede the header check: an unconfigured deployment is a
	// deployment problem, and reporting it as 401 would send whoever is debugging
	// it hunting for a secret mismatch that doesn't exist.
	test('reports the misconfiguration even when no secret is sent', async () => {
		const res = await post(null);

		expect(res.status).toBe(503);
		expect(await res.json()).toMatchObject({
			error: expect.stringContaining('MARKETING_REVALIDATE_SECRET'),
		});
	});
});
