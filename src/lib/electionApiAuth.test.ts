import { afterEach, beforeEach, describe, expect, spyOn, test } from 'bun:test';

import { __resetElectionApiAuthForTests, gpApiAuthHeaders } from './electionApiAuth';
import { blockVercelOidcToken, fakeVercelOidcToken, saveVercelOidcEnv, setVercelRequestOidcToken } from '~/testing/vercelOidc';

let restoreVercelOidcEnv: () => void;

beforeEach(() => {
	restoreVercelOidcEnv = saveVercelOidcEnv();
	__resetElectionApiAuthForTests();
});

afterEach(() => {
	restoreVercelOidcEnv();
	__resetElectionApiAuthForTests();
});

describe('Vercel OIDC token', () => {
	test('sends the request-context OIDC token', async () => {
		const token = fakeVercelOidcToken('request');
		setVercelRequestOidcToken(token);

		expect(await gpApiAuthHeaders()).toEqual({ Authorization: `Bearer ${token}` });
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

	test('sends no header, without throwing, and warns once when no OIDC token can be had', async () => {
		blockVercelOidcToken();
		const errorSpy = spyOn(console, 'error').mockImplementation(() => undefined);

		expect(await gpApiAuthHeaders()).toEqual({});
		expect(await gpApiAuthHeaders()).toEqual({});
		expect(errorSpy.mock.calls.filter(call => String(call[0]).includes('No GP_API_SERVICE_TOKEN or Vercel OIDC token'))).toHaveLength(1);

		errorSpy.mockRestore();
	});
});

describe('GP_API_SERVICE_TOKEN', () => {
	test('is sent on every gp-api read', async () => {
		process.env['GP_API_SERVICE_TOKEN'] = 'github-oidc-jwt';

		expect(await gpApiAuthHeaders()).toEqual({ Authorization: 'Bearer github-oidc-jwt' });
	});

	test('wins over a Vercel OIDC token in reach', async () => {
		process.env['GP_API_SERVICE_TOKEN'] = 'github-oidc-jwt';
		setVercelRequestOidcToken(fakeVercelOidcToken('request'));

		expect(await gpApiAuthHeaders()).toEqual({ Authorization: 'Bearer github-oidc-jwt' });
	});

	test('needs no OIDC token and does not warn', async () => {
		process.env['GP_API_SERVICE_TOKEN'] = 'github-oidc-jwt';
		blockVercelOidcToken();
		const errorSpy = spyOn(console, 'error').mockImplementation(() => undefined);

		expect(await gpApiAuthHeaders()).toEqual({ Authorization: 'Bearer github-oidc-jwt' });
		expect(errorSpy).not.toHaveBeenCalled();

		errorSpy.mockRestore();
	});

	test('re-reads process.env on every call', async () => {
		process.env['GP_API_SERVICE_TOKEN'] = 'first';
		expect(await gpApiAuthHeaders()).toEqual({ Authorization: 'Bearer first' });
		process.env['GP_API_SERVICE_TOKEN'] = 'second';
		expect(await gpApiAuthHeaders()).toEqual({ Authorization: 'Bearer second' });
	});

	test('an empty value falls through to the Vercel OIDC token', async () => {
		process.env['GP_API_SERVICE_TOKEN'] = '';
		const token = fakeVercelOidcToken('request');
		setVercelRequestOidcToken(token);

		expect(await gpApiAuthHeaders()).toEqual({ Authorization: `Bearer ${token}` });
	});
});
