import { describe, expect, test } from 'bun:test';
import { startOfElectionDay } from './electionDay';
import { isElectionDateBeforeToday } from './electionsHelpers';
import { resolvePositionHeroState } from './positionHeroState';

const localDay = (y: number, m: number, d: number) => new Date(y, m - 1, d).getTime();

describe('startOfElectionDay', () => {
	test('is still election day at 11:59pm Pacific, when UTC is already the next morning', () => {
		expect(startOfElectionDay(new Date('2026-11-04T07:59:00Z')).getTime()).toBe(localDay(2026, 11, 3));
	});

	test('turns over at midnight Pacific', () => {
		expect(startOfElectionDay(new Date('2026-11-04T08:00:00Z')).getTime()).toBe(localDay(2026, 11, 4));
	});

	test('follows daylight saving time', () => {
		expect(startOfElectionDay(new Date('2026-07-02T06:59:00Z')).getTime()).toBe(localDay(2026, 7, 1));
		expect(startOfElectionDay(new Date('2026-07-02T07:00:00Z')).getTime()).toBe(localDay(2026, 7, 2));
	});
});

// The reported bug: from 7pm Eastern on Nov 2 the profiles treated Nov 3 races as already run.
describe('an election day race stays upcoming until midnight Pacific', () => {
	const evenings = [
		['7pm Eastern the evening before', '2026-11-03T00:00:00Z'],
		['polls closing in the East', '2026-11-04T00:00:00Z'],
		['polls closing in Hawaii and Alaska', '2026-11-04T06:00:00Z'],
		['a minute before midnight Pacific', '2026-11-04T07:59:00Z'],
	] as const;

	for (const [label, iso] of evenings) {
		test(`${label}`, () => {
			const now = new Date(iso);
			expect(isElectionDateBeforeToday('2026-11-03', now)).toBe(false);
			expect(isElectionDateBeforeToday('2026-11-03T00:00:00.000Z', now)).toBe(false);
			expect(resolvePositionHeroState({ electionDate: '2026-11-03', now })).not.toEqual({ phase: 'midElection', resultsPending: true });
		});
	}

	test('is past once the Pacific day is over', () => {
		const now = new Date('2026-11-04T08:00:00Z');
		expect(isElectionDateBeforeToday('2026-11-03', now)).toBe(true);
	});
});
