import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import { __resetElectionApiAuthForTests } from './electionApiAuth';

// Faithful passthrough for next/cache so the NEXT_RUNTIME branch can be exercised
// without invoking the real unstable_cache (which hangs outside the Next runtime).
// It only captures the arguments and immediately runs the wrapped function, so it
// is harmless even if the module mock leaks to sibling files — and those never set
// NEXT_RUNTIME, so they bypass this branch entirely.
let capturedKeyParts: unknown;
let capturedOptions: { revalidate?: number; tags?: readonly string[] } | undefined;
const unstable_cache = mock(
	(
		fn: (...args: unknown[]) => unknown,
		keyParts: unknown,
		options: { revalidate?: number; tags?: readonly string[] },
	) => {
		capturedKeyParts = keyParts;
		capturedOptions = options;
		return (...args: unknown[]) => fn(...args);
	},
);
mock.module('next/cache', () => ({ unstable_cache }));

// Imported after the module mock so the dynamic import('next/cache') resolves to it.
const { fetchElectionApiJsonCached } = await import('./electionApiFetch');

const ELECTION_URL = 'https://election-api.goodparty.org/v1/positions/1';
const OK_BODY = { hello: 'world' };

const originalFetch = globalThis.fetch;
const ORIGINAL_MACHINE_SECRET = process.env['GP_MARKETING_MACHINE_SECRET'];
const ORIGINAL_RUNTIME = process.env['NEXT_RUNTIME'];

let fetchCalls: number;

beforeEach(() => {
	unstable_cache.mockClear();
	capturedKeyParts = undefined;
	capturedOptions = undefined;
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
		expect(capturedKeyParts).toEqual(['election-api-json', ELECTION_URL]);
		expect(capturedOptions?.revalidate).toBe(3600);
		expect(capturedOptions?.tags).toEqual(['person:abc']);
		expect(result).toEqual({ status: 200, ok: true, json: OK_BODY });
	});

	test('inside the Next runtime without tags, omits the tags cache option', async () => {
		process.env['NEXT_RUNTIME'] = 'nodejs';

		await fetchElectionApiJsonCached(ELECTION_URL);

		expect(unstable_cache).toHaveBeenCalledTimes(1);
		expect(capturedOptions && 'tags' in capturedOptions).toBe(false);
		expect(capturedOptions?.revalidate).toBe(3600);
	});

	test('outside the Next runtime, bypasses unstable_cache and fetches directly', async () => {
		delete process.env['NEXT_RUNTIME'];

		const result = await fetchElectionApiJsonCached(ELECTION_URL, ['person:abc']);

		expect(unstable_cache).not.toHaveBeenCalled();
		expect(fetchCalls).toBe(1);
		expect(result).toEqual({ status: 200, ok: true, json: OK_BODY });
	});
});
