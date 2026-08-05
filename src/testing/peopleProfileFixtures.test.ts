/**
 * Contract test for the shared 12-state fixtures. Keeps the fixtures honest
 * against the API contracts they mirror so the matrix/stories can't drift into
 * shapes the real services would never emit.
 */
import { describe, expect, test } from 'bun:test';
import { assertNoPii, PERSON_ID, STATE_FIXTURES } from './peopleProfileFixtures';
import type { ProfileState } from '~/lib/peopleProfile';

const ALL_STATES: ProfileState[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

describe('12-state fixture coverage', () => {
	test('there is exactly one fixture per state A–L', () => {
		const states = STATE_FIXTURES.map((f) => f.state).sort();
		expect(states).toEqual([...ALL_STATES].sort());
		expect(states).toHaveLength(12);
	});

	test('every person fixture keeps the canonical id and slug', () => {
		for (const f of STATE_FIXTURES) {
			expect(f.person.id).toBe(PERSON_ID);
			expect(f.person.slug).toBe('jane-public');
		}
	});
});

describe('fixtures honor the election-api PII-omission contract', () => {
	test('no person spine fixture carries email/phone PII', () => {
		for (const f of STATE_FIXTURES) {
			expect(assertNoPii(f.person)).toEqual([]);
			expect(f.person).not.toHaveProperty('email');
			expect(f.person).not.toHaveProperty('phone');
		}
	});

	test('live overlay fixtures expose only public contact fields, never raw PII', () => {
		for (const f of STATE_FIXTURES) {
			if (f.overlay.status !== 'live') continue;
			// publicEmail/publicPhone are allowed; raw email/phone are not.
			expect(assertNoPii(f.overlay.profile)).toEqual([]);
		}
	});
});

describe('assertNoPii', () => {
	test('flags nested email/phone keys with their path', () => {
		const leaks = assertNoPii({ a: { email: 'x@y.z' }, b: [{ phone: '555' }] });
		expect(leaks).toContain('$.a.email');
		expect(leaks).toContain('$.b[0].phone');
	});

	test('does not flag public contact fields', () => {
		expect(assertNoPii({ publicEmail: 'x@y.z', publicPhone: '555' })).toEqual([]);
	});
});
