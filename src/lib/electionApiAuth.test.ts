import { afterEach, beforeEach, describe, expect, mock, setSystemTime, spyOn, test } from 'bun:test';

import {
	__resetElectionApiAuthForTests,
	__setCreateTokenForTests,
	electionApiAuthHeaders,
	getElectionApiToken,
} from './electionApiAuth';

// mint() only reads `minted.expiration` to detect a failed mint (null => failure);
// the cache window is anchored to the requested TTL, not to this field. Any
// non-null value works here — its unit/magnitude is intentionally irrelevant.
const expirationInSeconds = (secondsFromNow: number): number =>
	Math.floor(Date.now() / 1000) + secondsFromNow;

const createToken = mock(
	async (): Promise<{ token: string | null; expiration: number | null }> => ({
		token: 'fresh-token',
		expiration: expirationInSeconds(600),
	}),
);

const ORIGINAL_SECRET = process.env['GP_MARKETING_MACHINE_SECRET'];

beforeEach(() => {
	createToken.mockClear();
	createToken.mockImplementation(async () => ({
		token: 'fresh-token',
		expiration: expirationInSeconds(600),
	}));
	process.env['GP_MARKETING_MACHINE_SECRET'] = 'test-machine-secret';
	__resetElectionApiAuthForTests();
	__setCreateTokenForTests(createToken);
});

afterEach(() => {
	if (ORIGINAL_SECRET === undefined) {
		delete process.env['GP_MARKETING_MACHINE_SECRET'];
	} else {
		process.env['GP_MARKETING_MACHINE_SECRET'] = ORIGINAL_SECRET;
	}
	__resetElectionApiAuthForTests();
});

describe('getElectionApiToken', () => {
	test('returns cached token when outside the renewal buffer', async () => {
		__resetElectionApiAuthForTests({
			cachedToken: 'cached-token',
			tokenExpiration: Date.now() + 120_000,
		});
		__setCreateTokenForTests(createToken);

		await expect(getElectionApiToken()).resolves.toBe('cached-token');
		expect(createToken).toHaveBeenCalledTimes(0);
	});

	test('remints when no token is cached', async () => {
		await expect(getElectionApiToken()).resolves.toBe('fresh-token');
		expect(createToken).toHaveBeenCalledTimes(1);
	});

	test('accepts a successful mint even when Clerk returns a null expiration', async () => {
		// `expiration` is nullable in Clerk's type and unused for timing, so a
		// non-null token must be treated as success — not discarded into cooldown.
		createToken.mockImplementation(async () => ({
			token: 'token-no-exp',
			expiration: null,
		}));

		await expect(getElectionApiToken()).resolves.toBe('token-no-exp');
		// Cached and reused: the TTL-derived window is valid despite null expiration.
		await expect(getElectionApiToken()).resolves.toBe('token-no-exp');
		expect(createToken).toHaveBeenCalledTimes(1);
	});

	test('remints when the cached token is fully expired', async () => {
		__resetElectionApiAuthForTests({
			cachedToken: 'stale-token',
			tokenExpiration: Date.now() - 1_000,
		});
		__setCreateTokenForTests(createToken);

		await expect(getElectionApiToken()).resolves.toBe('fresh-token');
		expect(createToken).toHaveBeenCalledTimes(1);
	});

	test('remints when the cached token is within the 30s renewal buffer', async () => {
		__resetElectionApiAuthForTests({
			cachedToken: 'near-expiry-token',
			tokenExpiration: Date.now() + 10_000,
		});
		__setCreateTokenForTests(createToken);

		await expect(getElectionApiToken()).resolves.toBe('fresh-token');
		expect(createToken).toHaveBeenCalledTimes(1);
	});

	test('dedupes concurrent calls into a single mint', async () => {
		let resolveMint!: (value: { token: string; expiration: number }) => void;
		createToken.mockImplementation(
			async () =>
				await new Promise<{ token: string; expiration: number }>(resolve => {
					resolveMint = resolve;
				}),
		);

		const first = getElectionApiToken();
		const second = getElectionApiToken();

		expect(createToken).toHaveBeenCalledTimes(1);

		resolveMint({ token: 'shared-token', expiration: expirationInSeconds(600) });
		await expect(Promise.all([first, second])).resolves.toEqual(['shared-token', 'shared-token']);
		expect(createToken).toHaveBeenCalledTimes(1);
	});

	test('missing machine secret returns null and logs once across two calls', async () => {
		delete process.env['GP_MARKETING_MACHINE_SECRET'];
		const errorSpy = spyOn(console, 'error').mockImplementation(() => undefined);

		await expect(getElectionApiToken()).resolves.toBeNull();
		await expect(getElectionApiToken()).resolves.toBeNull();

		expect(createToken).toHaveBeenCalledTimes(0);
		expect(errorSpy.mock.calls.filter(call => String(call[0]).includes('GP_MARKETING_MACHINE_SECRET'))).toHaveLength(
			1,
		);

		errorSpy.mockRestore();
	});

	test('mint failure returns the still-valid cached token', async () => {
		__resetElectionApiAuthForTests({
			cachedToken: 'still-valid',
			tokenExpiration: Date.now() + 10_000,
		});
		__setCreateTokenForTests(createToken);
		createToken.mockImplementation(async () => {
			throw new Error('Clerk unavailable');
		});
		const errorSpy = spyOn(console, 'error').mockImplementation(() => undefined);

		await expect(getElectionApiToken()).resolves.toBe('still-valid');
		expect(createToken).toHaveBeenCalledTimes(1);

		errorSpy.mockRestore();
	});

	test('mint failure enters a cooldown that skips further Clerk calls', async () => {
		createToken.mockImplementation(async () => {
			throw new Error('Clerk unavailable');
		});
		const errorSpy = spyOn(console, 'error').mockImplementation(() => undefined);

		await expect(getElectionApiToken()).resolves.toBeNull();
		await expect(getElectionApiToken()).resolves.toBeNull();

		expect(createToken).toHaveBeenCalledTimes(1);

		errorSpy.mockRestore();
	});

	test('cooldown still serves a usable cached token without reminting', async () => {
		__resetElectionApiAuthForTests({
			cachedToken: 'cached-during-cooldown',
			tokenExpiration: Date.now() + 10_000,
			mintCooldownUntil: Date.now() + 30_000,
		});
		__setCreateTokenForTests(createToken);

		await expect(getElectionApiToken()).resolves.toBe('cached-during-cooldown');
		expect(createToken).toHaveBeenCalledTimes(0);
	});

	test('renews on the requested TTL even when Clerk returns a huge expiration (regression: ms double-scale)', async () => {
		// Reproduces the prod bug: Clerk's `expiration` is milliseconds at runtime,
		// and the old code did `expiration * 1000`, pushing the cache window ~56k
		// years out so it never renewed and replayed one JWT long past its real
		// `exp`. The fix anchors the window to the 3600s TTL, so renewal must still
		// happen after ~3600s regardless of what `expiration` reports.
		createToken.mockImplementation(async () => ({
			token: 'ttl-anchored',
			expiration: Date.now() * 1000, // ms-shaped; catastrophic if re-scaled
		}));
		const start = Date.now();
		try {
			setSystemTime(start);
			await expect(getElectionApiToken()).resolves.toBe('ttl-anchored');
			expect(createToken).toHaveBeenCalledTimes(1);

			// Just past the 3600s TTL: the token must be re-minted, not replayed.
			setSystemTime(start + 3_600_001);
			await expect(getElectionApiToken()).resolves.toBe('ttl-anchored');
			expect(createToken).toHaveBeenCalledTimes(2);
		} finally {
			setSystemTime();
		}
	});

	test('reuses the cached token across the full TTL, not just 10 minutes', async () => {
		// Guards the #1 change (TTL 600 -> 3600): a token minted now must still be
		// served ~50 minutes later without re-minting, which is what collapses the
		// fleet-wide mint volume that was tripping Clerk's M2M quota.
		const start = Date.now();
		try {
			setSystemTime(start);
			await expect(getElectionApiToken()).resolves.toBe('fresh-token');
			expect(createToken).toHaveBeenCalledTimes(1);

			// 50 minutes in — old 600s TTL would have re-minted ~5 times by now.
			setSystemTime(start + 50 * 60_000);
			await expect(getElectionApiToken()).resolves.toBe('fresh-token');
			expect(createToken).toHaveBeenCalledTimes(1);
		} finally {
			setSystemTime();
		}
	});

	test('mint failures back off exponentially, so a Clerk outage is not a retry storm', async () => {
		// #3: cooldown escalates 30s -> 60s (jitter only shortens by <=1/4, so the
		// first window is <=30s and the second is >=45s — a clean, non-flaky gap).
		createToken.mockImplementation(async () => {
			throw new Error('Clerk throttled');
		});
		const errorSpy = spyOn(console, 'error').mockImplementation(() => undefined);
		const start = Date.now();
		try {
			setSystemTime(start);
			// Failure #1 -> cooldown ends within (start, start+30s].
			await expect(getElectionApiToken()).resolves.toBeNull();
			expect(createToken).toHaveBeenCalledTimes(1);

			// Still inside the first cooldown: no new Clerk call.
			setSystemTime(start + 20_000);
			await expect(getElectionApiToken()).resolves.toBeNull();
			expect(createToken).toHaveBeenCalledTimes(1);

			// Past the max first cooldown (30s): failure #2 escalates toward ~60s.
			setSystemTime(start + 31_000);
			await expect(getElectionApiToken()).resolves.toBeNull();
			expect(createToken).toHaveBeenCalledTimes(2);

			// 40s after failure #2: a flat 30s policy would have retried, but the
			// escalated (>=45s) window must still suppress the Clerk call.
			setSystemTime(start + 71_000);
			await expect(getElectionApiToken()).resolves.toBeNull();
			expect(createToken).toHaveBeenCalledTimes(2);
		} finally {
			setSystemTime();
			errorSpy.mockRestore();
		}
	});
});

describe('token pooling across isolates (L2 Data Cache)', () => {
	const ORIGINAL_RUNTIME = process.env['NEXT_RUNTIME'];

	afterEach(() => {
		if (ORIGINAL_RUNTIME === undefined) {
			delete process.env['NEXT_RUNTIME'];
		} else {
			process.env['NEXT_RUNTIME'] = ORIGINAL_RUNTIME;
		}
	});

	test('inside the Next runtime, mints through unstable_cache keyed for fleet-wide reuse', async () => {
		let capturedKey: unknown;
		let capturedOptions: { revalidate?: number } | undefined;
		const unstable_cache = mock(
			(fn: (...args: unknown[]) => unknown, key: unknown, options: { revalidate?: number }) => {
				capturedKey = key;
				capturedOptions = options;
				return (...args: unknown[]) => fn(...args);
			},
		);
		mock.module('next/cache', () => ({ unstable_cache }));
		process.env['NEXT_RUNTIME'] = 'nodejs';

		await expect(getElectionApiToken()).resolves.toBe('fresh-token');

		expect(unstable_cache).toHaveBeenCalledTimes(1);
		// Single fixed key => one shared entry for the whole fleet.
		expect(capturedKey).toEqual(['election-api-m2m-token']);
		// Revalidate strictly inside the 3600s TTL so an edge read still has margin.
		expect(capturedOptions?.revalidate).toBe(3300);
	});

	test('outside the Next runtime, mints directly without touching the Data Cache', async () => {
		delete process.env['NEXT_RUNTIME'];
		const unstable_cache = mock((fn: (...args: unknown[]) => unknown) => fn);
		mock.module('next/cache', () => ({ unstable_cache }));

		await expect(getElectionApiToken()).resolves.toBe('fresh-token');

		expect(unstable_cache).not.toHaveBeenCalled();
		expect(createToken).toHaveBeenCalledTimes(1);
	});
});

describe('electionApiAuthHeaders', () => {
	test('returns Authorization when a token is available', async () => {
		await expect(electionApiAuthHeaders()).resolves.toEqual({
			Authorization: 'Bearer fresh-token',
		});
	});

	test('returns an empty object when no token is available', async () => {
		delete process.env['GP_MARKETING_MACHINE_SECRET'];
		const errorSpy = spyOn(console, 'error').mockImplementation(() => undefined);

		await expect(electionApiAuthHeaders()).resolves.toEqual({});

		errorSpy.mockRestore();
	});
});
