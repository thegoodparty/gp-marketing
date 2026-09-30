import { afterEach, describe, expect, mock, test } from 'bun:test';
import { createRedactor, jwtExpMs, mask } from './election-api-token-mint';

function jwt(payload: Record<string, unknown>): string {
	const b64url = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString('base64url');
	return `${b64url({ alg: 'none' })}.${b64url(payload)}.sig`;
}

describe('mask', () => {
	test('hides the middle of a long token', () => {
		const masked = mask('abcdefghijklmnopqrstuvwxyz');
		expect(masked).toContain('…');
		expect(masked).not.toContain('ijklmnop');
	});

	test('fully redacts a short value rather than exposing it', () => {
		expect(mask('short')).toBe('***');
	});
});

describe('createRedactor', () => {
	test('redacts every registered secret, and only registered secrets', () => {
		const { add, redact } = createRedactor();
		add('sk_live_abc123');
		expect(redact('token=sk_live_abc123 other=sk_live_other')).toBe('token=*** other=sk_live_other');
	});

	test('two registries do not share state', () => {
		const a = createRedactor();
		const b = createRedactor();
		a.add('only-in-a');
		expect(b.redact('contains only-in-a')).toBe('contains only-in-a');
	});

	test('ignores an empty-string secret instead of redacting everything', () => {
		const { add, redact } = createRedactor();
		add('');
		expect(redact('nothing special here')).toBe('nothing special here');
	});
});

describe('jwtExpMs', () => {
	test('reads the exp claim from a well-formed JWT', () => {
		const expSeconds = Math.floor(Date.now() / 1000) + 3600;
		expect(jwtExpMs(jwt({ exp: expSeconds }))).toBe(expSeconds * 1000);
	});

	test('throws on a value that is not a three-segment JWT', () => {
		expect(() => jwtExpMs('not-a-jwt')).toThrow(/not a JWT/);
	});

	test('throws when the exp claim is missing', () => {
		expect(() => jwtExpMs(jwt({ sub: 'machine' }))).toThrow(/no numeric `exp` claim/);
	});
});

describe('mintJwt', () => {
	afterEach(() => {
		mock.restore();
	});

	test('mints without any Vercel env set, passing the machine secret and ttl through to Clerk', async () => {
		for (const key of ['VERCEL_TOKEN', 'VERCEL_PROJECT_ID', 'VERCEL_TEAM_ID']) {
			delete process.env[key];
		}

		const createToken = mock(async (opts: { machineSecretKey: string; secondsUntilExpiration: number }) => {
			expect(opts.machineSecretKey).toBe('ak_test_secret');
			expect(opts.secondsUntilExpiration).toBe(3600);
			return { token: jwt({ exp: Math.floor(Date.now() / 1000) + 3600 }) };
		});
		mock.module('@clerk/backend', () => ({
			createClerkClient: () => ({ m2m: { createToken } }),
		}));

		const { mintJwt } = await import('./election-api-token-mint');
		const token = await mintJwt('ak_test_secret', 3600);
		expect(createToken).toHaveBeenCalledTimes(1);
		expect(jwtExpMs(token)).toBeGreaterThan(Date.now());
	});

	test('throws when Clerk returns no token string', async () => {
		mock.module('@clerk/backend', () => ({
			createClerkClient: () => ({ m2m: { createToken: async () => ({}) } }),
		}));

		const { mintJwt } = await import('./election-api-token-mint');
		await expect(mintJwt('ak_test_secret', 3600)).rejects.toThrow(/no `token` string/);
	});
});
