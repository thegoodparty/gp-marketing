import { afterEach, beforeEach, describe, expect, spyOn, test } from 'bun:test';

import {
	__resetElectionApiAuthForTests,
	electionApiAuthHeaders,
	getElectionApiToken,
} from './electionApiAuth';

const ORIGINAL_TOKEN = process.env['ELECTION_API_M2M_TOKEN'];

beforeEach(() => {
	process.env['ELECTION_API_M2M_TOKEN'] = 'static-jwt';
	__resetElectionApiAuthForTests();
});

afterEach(() => {
	if (ORIGINAL_TOKEN === undefined) {
		delete process.env['ELECTION_API_M2M_TOKEN'];
	} else {
		process.env['ELECTION_API_M2M_TOKEN'] = ORIGINAL_TOKEN;
	}
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
	test('returns a Bearer Authorization header when the token is set', () => {
		expect(electionApiAuthHeaders()).toEqual({ Authorization: 'Bearer static-jwt' });
	});

	test('returns an empty object (fail-soft) when the token is unset', () => {
		delete process.env['ELECTION_API_M2M_TOKEN'];
		const errorSpy = spyOn(console, 'error').mockImplementation(() => undefined);

		expect(electionApiAuthHeaders()).toEqual({});

		errorSpy.mockRestore();
	});
});
