import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { __resetElectionApiAuthForTests } from './electionApiAuth';
// Mocks next/cache on import so the NEXT_RUNTIME branch can be exercised without
// invoking the real unstable_cache (which hangs outside the Next runtime). Shared
// with the other files that mock next/cache; see the module for why.
import { lastCacheCall, resetNextCacheMock, unstable_cache } from '~/testing/nextCacheMock';

// Imported after the module mock so the dynamic import('next/cache') resolves to it.
const { fetchElectionApiJsonCached } = await import('./electionApiFetch');

const ELECTION_URL = 'https://election-api.goodparty.org/v1/positions/1';
const OK_BODY = { hello: 'world' };

const originalFetch = globalThis.fetch;
const ORIGINAL_MACHINE_SECRET = process.env['GP_MARKETING_MACHINE_SECRET'];
const ORIGINAL_RUNTIME = process.env['NEXT_RUNTIME'];

let fetchCalls: number;

beforeEach(() => {
	resetNextCacheMock();
	fetchCalls = 0;
	// Fail-soft auth path: unset secret so run() never touches Clerk.
	delete process.env['GP_MARKETING_MACHINE_SECRET'];
	__resetElectionApiAuthForTests({ warnedMissingSecret: true });
	globalThis.fetch = (async () => {
		fetchCalls += 1;
		return new Response(JSON.stringify(OK_BODY), {
			status: 200,
			headers: { 'content-type': 'application/json' },
		});
	}) as unknown as typeof fetch;
});

afterEach(() => {
	if (ORIGINAL_MACHINE_SECRET === undefined) {
		delete process.env['GP_MARKETING_MACHINE_SECRET'];
	} else {
		process.env['GP_MARKETING_MACHINE_SECRET'] = ORIGINAL_MACHINE_SECRET;
	}
	if (ORIGINAL_RUNTIME === undefined) {
		delete process.env['NEXT_RUNTIME'];
	} else {
		process.env['NEXT_RUNTIME'] = ORIGINAL_RUNTIME;
	}
	__resetElectionApiAuthForTests();
	globalThis.fetch = originalFetch;
});

describe('fetchElectionApiJsonCached', () => {
	test('inside the Next runtime, wraps run in unstable_cache keyed by url with 3600 revalidate and forwarded tags', async () => {
		process.env['NEXT_RUNTIME'] = 'nodejs';

		const result = await fetchElectionApiJsonCached(ELECTION_URL, ['person:abc']);

		expect(unstable_cache).toHaveBeenCalledTimes(1);
		expect(lastCacheCall.keyParts).toEqual(['election-api-json', ELECTION_URL]);
		expect(lastCacheCall.options?.revalidate).toBe(3600);
		expect(lastCacheCall.options?.tags).toEqual(['person:abc']);
		expect(result).toEqual({ status: 200, ok: true, json: OK_BODY });
	});

	test('inside the Next runtime without tags, omits the tags cache option', async () => {
		process.env['NEXT_RUNTIME'] = 'nodejs';

		await fetchElectionApiJsonCached(ELECTION_URL);

		expect(unstable_cache).toHaveBeenCalledTimes(1);
		expect(lastCacheCall.options && 'tags' in lastCacheCall.options).toBe(false);
		expect(lastCacheCall.options?.revalidate).toBe(3600);
	});

	test('outside the Next runtime, bypasses unstable_cache and fetches directly', async () => {
		delete process.env['NEXT_RUNTIME'];

		const result = await fetchElectionApiJsonCached(ELECTION_URL, ['person:abc']);

		expect(unstable_cache).not.toHaveBeenCalled();
		expect(fetchCalls).toBe(1);
		expect(result).toEqual({ status: 200, ok: true, json: OK_BODY });
	});
});
