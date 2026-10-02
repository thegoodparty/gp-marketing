/**
 * The workflow_dispatch fire-and-forget seam, in its own module registry so it
 * can bind the route against a configured GITHUB_SITEMAP_DISPATCH_TOKEN — a
 * different env shape than route.test.ts uses, and `~/lib/env` binds at import,
 * so only one shape can be live per file (see route.unconfigured.test.ts, which
 * does the same thing for the secret-unset branch).
 *
 * Static sitemap files can't be busted by a cache tag, so this dispatch is what
 * turns a takedown/edit into a same-shard regeneration within minutes instead of
 * waiting for the next hourly cron run. The response must never depend on
 * GitHub's availability, which is what the rejected/non-204 cases below pin.
 */
import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from 'bun:test';
import { peopleShardForPersonId } from '~/lib/sitemap-entries';
import { resetNextCacheMock } from '~/testing/nextCacheMock';

const SECRET = 'test-revalidate-secret';
const TOKEN = 'test-github-dispatch-token';
const PERSON_ID = '74eee01a-1111-4222-8333-444444444444';

const realEnv = await import('~/lib/env');
mock.module('~/lib/env', () => ({
	...realEnv,
	personRevalidateSecret: SECRET,
	githubSitemapDispatchToken: TOKEN,
}));

const { POST } = await import('./route');

const DISPATCH_URL =
	'https://api.github.com/repos/thegoodparty/gp-marketing/actions/workflows/generate-people-sitemaps.yml/dispatches';

let originalFetch: typeof globalThis.fetch;
let calls: Array<{ url: string; init: { method?: string; headers?: Record<string, string>; body?: string } }>;
let dispatchResult: { kind: 'resolve'; status: number } | { kind: 'reject'; error: Error };

beforeEach(() => {
	resetNextCacheMock();
	calls = [];
	dispatchResult = { kind: 'resolve', status: 204 };
	originalFetch = globalThis.fetch;
	globalThis.fetch = (async (
		url: string,
		init?: { method?: string; headers?: Record<string, string>; body?: string },
	) => {
		calls.push({ url: String(url), init: init ?? {} });
		if (dispatchResult.kind === 'reject') throw dispatchResult.error;
		return { ok: dispatchResult.status === 204, status: dispatchResult.status } as Response;
	}) as unknown as typeof globalThis.fetch;
});

afterEach(() => {
	globalThis.fetch = originalFetch;
});

async function post(personId: string): Promise<Response> {
	const req = new Request('https://marketing.test/api/revalidate-person', {
		method: 'POST',
		headers: { 'content-type': 'application/json', 'x-revalidate-secret': SECRET },
		body: JSON.stringify({ personId }),
	});
	return POST(req as never);
}

describe('POST /api/revalidate-person — sitemap shard dispatch', () => {
	test('dispatches exactly one workflow_dispatch for the shard holding this person', async () => {
		const res = await post(PERSON_ID);

		expect(res.status).toBe(200);
		expect(calls).toHaveLength(1);
		const [call] = calls;
		expect(call?.url).toBe(DISPATCH_URL);
		expect(call?.init.method).toBe('POST');
		expect(call?.init.headers?.['Authorization']).toBe(`Bearer ${TOKEN}`);
		expect(call?.init.headers?.['Accept']).toBe('application/vnd.github+json');
		expect(JSON.parse(call?.init.body ?? '{}')).toEqual({
			ref: 'develop',
			inputs: { shard: String(peopleShardForPersonId(PERSON_ID)) },
		});
	});

	test('never echoes the token into the webhook response', async () => {
		const res = await post(PERSON_ID);

		expect(JSON.stringify(await res.json())).not.toContain(TOKEN);
	});

	test('does not change the response when the dispatch fetch rejects', async () => {
		dispatchResult = { kind: 'reject', error: new Error('network down') };
		const errorSpy = spyOn(console, 'error').mockImplementation(() => undefined);

		const res = await post(PERSON_ID);

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ revalidated: true, tag: `person:${PERSON_ID}` });

		// Flush the rejected dispatch promise's microtask queue. If the route
		// failed to attach `.catch` synchronously, this is where an unhandled
		// rejection would surface instead of the logged error below.
		await Promise.resolve();
		await Promise.resolve();

		expect(errorSpy).toHaveBeenCalled();
		errorSpy.mockRestore();
	});

	test('does not change the response when the dispatch responds non-204', async () => {
		dispatchResult = { kind: 'resolve', status: 500 };
		const errorSpy = spyOn(console, 'error').mockImplementation(() => undefined);

		const res = await post(PERSON_ID);

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ revalidated: true, tag: `person:${PERSON_ID}` });

		await Promise.resolve();
		await Promise.resolve();

		expect(errorSpy).toHaveBeenCalled();
		errorSpy.mockRestore();
	});
});
