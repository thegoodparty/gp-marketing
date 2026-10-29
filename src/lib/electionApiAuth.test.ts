import { afterEach, beforeEach, describe, expect, spyOn, test } from 'bun:test';

import {
	__resetElectionApiAuthForTests,
	electionApiAuthHeaders,
	getElectionApiToken,
	getGpApiAuthMode,
	gpApiAuthHeaders,
} from './electionApiAuth';
import { fakeVercelOidcToken, saveVercelOidcEnv, setVercelRequestOidcToken } from '~/testing/vercelOidc';

const ORIGINAL_TOKEN = process.env['ELECTION_API_M2M_TOKEN'];

let restoreVercelOidcEnv: () => void;

beforeEach(() => {
	restoreVercelOidcEnv = saveVercelOidcEnv();
	process.env['ELECTION_API_M2M_TOKEN'] = 'static-jwt';
	__resetElectionApiAuthForTests();
});

afterEach(() => {
	if (ORIGINAL_TOKEN === undefined) {
		delete process.env['ELECTION_API_M2M_TOKEN'];
	} else {
		process.env['ELECTION_API_M2M_TOKEN'] = ORIGINAL_TOKEN;
	}
	restoreVercelOidcEnv();
	__resetElectionApiAuthForTests();
});

describe('getElectionApiToken', () => {
	test('returns the injected static token', () => {
		expect(getElectionApiToken()).toBe('static-jwt');
	});

	test('re-reads process.env so a rotated value is picked up without a restart', () => {
		// There is no cache: the value is read straight from the env on every call,
		// so rotating ELECTION_API_M2M_TOKEN (a new deploy/env update) takes effect
		// immediately rather than being pinned by a module-level cache.
		process.env['ELECTION_API_M2M_TOKEN'] = 'rotated-jwt';
		expect(getElectionApiToken()).toBe('rotated-jwt');
	});

	test('returns null and logs exactly once when the token is unset', () => {
		delete process.env['ELECTION_API_M2M_TOKEN'];
		const errorSpy = spyOn(console, 'error').mockImplementation(() => undefined);

		expect(getElectionApiToken()).toBeNull();
		expect(getElectionApiToken()).toBeNull();

		expect(
			errorSpy.mock.calls.filter((call) => String(call[0]).includes('ELECTION_API_M2M_TOKEN')),
		).toHaveLength(1);

		errorSpy.mockRestore();
	});
});

describe('electionApiAuthHeaders', () => {
	test('returns a Bearer Authorization header when the token is set', async () => {
		expect(await electionApiAuthHeaders()).toEqual({ Authorization: 'Bearer static-jwt' });
	});

	test('returns an empty object (fail-soft) when the token is unset', async () => {
		delete process.env['ELECTION_API_M2M_TOKEN'];
		const errorSpy = spyOn(console, 'error').mockImplementation(() => undefined);

		expect(await electionApiAuthHeaders()).toEqual({});

		errorSpy.mockRestore();
	});
});

describe('gpApiAuthHeaders', () => {
	test('sends the same static token as a Bearer header', async () => {
		expect(await gpApiAuthHeaders()).toEqual({ Authorization: 'Bearer static-jwt' });
	});

	test('returns an empty object and warns once when the token is unset', async () => {
		delete process.env['ELECTION_API_M2M_TOKEN'];
		const errorSpy = spyOn(console, 'error').mockImplementation(() => undefined);

		expect(await gpApiAuthHeaders()).toEqual({});
		expect(await gpApiAuthHeaders()).toEqual({});
		expect(
			errorSpy.mock.calls.filter((call) => String(call[0]).includes('ELECTION_API_M2M_TOKEN')),
		).toHaveLength(1);

		errorSpy.mockRestore();
	});
});

describe('GP_API_AUTH_MODE', () => {
	test('defaults to clerk, so an OIDC token in reach is ignored until the flip', async () => {
		setVercelRequestOidcToken(fakeVercelOidcToken('request'));
		process.env['VERCEL_OIDC_TOKEN'] = fakeVercelOidcToken('build');

		expect(getGpApiAuthMode()).toBe('clerk');
		expect(await gpApiAuthHeaders()).toEqual({ Authorization: 'Bearer static-jwt' });
		expect(await electionApiAuthHeaders()).toEqual({ Authorization: 'Bearer static-jwt' });
	});

	test('an unknown value stays on clerk and warns once', async () => {
		process.env['GP_API_AUTH_MODE'] = 'oidc';
		setVercelRequestOidcToken(fakeVercelOidcToken('request'));
		const errorSpy = spyOn(console, 'error').mockImplementation(() => undefined);

		expect(await gpApiAuthHeaders()).toEqual({ Authorization: 'Bearer static-jwt' });
		expect(await gpApiAuthHeaders()).toEqual({ Authorization: 'Bearer static-jwt' });
		expect(errorSpy.mock.calls.filter(call => String(call[0]).includes('Unknown GP_API_AUTH_MODE'))).toHaveLength(1);

		errorSpy.mockRestore();
	});

	describe('oidc-preferred', () => {
		beforeEach(() => {
			process.env['GP_API_AUTH_MODE'] = 'oidc-preferred';
		});

		test('sends the request-context OIDC token in place of the clerk token', async () => {
			const token = fakeVercelOidcToken('request');
			setVercelRequestOidcToken(token);

			expect(await gpApiAuthHeaders()).toEqual({ Authorization: `Bearer ${token}` });
			expect(await electionApiAuthHeaders()).toEqual({ Authorization: `Bearer ${token}` });
		});

		test('uses VERCEL_OIDC_TOKEN when there is no request context (a build)', async () => {
			const token = fakeVercelOidcToken('build');
			process.env['VERCEL_OIDC_TOKEN'] = token;

			expect(await gpApiAuthHeaders()).toEqual({ Authorization: `Bearer ${token}` });
		});

		test('reads a fresh token on every call rather than caching one', async () => {
			const first = fakeVercelOidcToken('first');
			const second = fakeVercelOidcToken('second');
			setVercelRequestOidcToken(first);
			expect(await gpApiAuthHeaders()).toEqual({ Authorization: `Bearer ${first}` });
			setVercelRequestOidcToken(second);
			expect(await gpApiAuthHeaders()).toEqual({ Authorization: `Bearer ${second}` });
		});

		test('falls back to the clerk token, warning once, when no OIDC token can be had', async () => {
			process.env['VERCEL_OIDC_TOKEN_FILE'] = '/nonexistent/vercel-oidc-token';
			const errorSpy = spyOn(console, 'error').mockImplementation(() => undefined);

			expect(await gpApiAuthHeaders()).toEqual({ Authorization: 'Bearer static-jwt' });
			expect(await electionApiAuthHeaders()).toEqual({ Authorization: 'Bearer static-jwt' });
			expect(errorSpy.mock.calls.filter(call => String(call[0]).includes('No Vercel OIDC token available'))).toHaveLength(1);

			errorSpy.mockRestore();
		});

		test('sends no header, without throwing, when neither credential is available', async () => {
			process.env['VERCEL_OIDC_TOKEN_FILE'] = '/nonexistent/vercel-oidc-token';
			delete process.env['ELECTION_API_M2M_TOKEN'];
			const errorSpy = spyOn(console, 'error').mockImplementation(() => undefined);

			expect(await gpApiAuthHeaders()).toEqual({});

			errorSpy.mockRestore();
		});
	});
});
