import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from 'bun:test';

import {
	__resetElectionApiAuthForTests,
	__setCreateTokenForTests,
	electionApiAuthHeaders,
	getElectionApiToken,
} from './electionApiAuth';

const createToken = mock(
	async (): Promise<{ token: string | null; expiration: number | null }> => ({
		token: 'fresh-token',
		expiration: Date.now() + 600_000,
	}),
);

const ORIGINAL_SECRET = process.env['GP_MARKETING_MACHINE_SECRET'];

beforeEach(() => {
	createToken.mockClear();
	createToken.mockImplementation(async () => ({
		token: 'fresh-token',
		expiration: Date.now() + 600_000,
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

		resolveMint({ token: 'shared-token', expiration: Date.now() + 600_000 });
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
