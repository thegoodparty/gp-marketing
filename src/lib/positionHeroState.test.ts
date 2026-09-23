import { describe, expect, test } from 'bun:test';
import { daysUntil, resolvePositionHeroState } from './positionHeroState';

const race = {
	filingDateStart: '2026-06-01T00:00:00.000Z',
	filingDateEnd: '2026-10-02T00:00:00.000Z',
	electionDate: '2026-11-03T00:00:00.000Z',
};

const at = (iso: string) => new Date(`${iso}T12:00:00`);

describe('resolvePositionHeroState', () => {
	test('filing is open between the window opening and the deadline', () => {
		expect(resolvePositionHeroState({ ...race, now: at('2026-08-15') })).toEqual({ phase: 'filing', filingOpen: true });
	});

	test('the deadline day itself still counts as filing', () => {
		expect(resolvePositionHeroState({ ...race, now: at('2026-10-02') })).toEqual({ phase: 'filing', filingOpen: true });
	});

	test('inside six months of the window opening it is filing, but not open yet', () => {
		expect(resolvePositionHeroState({ ...race, now: at('2026-01-15') })).toEqual({ phase: 'filing', filingOpen: false });
	});

	test('more than six months out, the previous cycle result holds the page in decided', () => {
		expect(resolvePositionHeroState({ ...race, priorWinnerCount: 1, now: at('2025-11-20') })).toEqual({
			phase: 'decided',
			multipleWinners: false,
		});
	});

	test('more than six months out with no previous result falls back to filing not yet open', () => {
		expect(resolvePositionHeroState({ ...race, now: at('2025-11-20') })).toEqual({ phase: 'filing', filingOpen: false });
	});

	test('after the deadline and before the election it is mid-election', () => {
		expect(resolvePositionHeroState({ ...race, now: at('2026-10-20') })).toEqual({ phase: 'midElection', resultsPending: false });
	});

	test('election day itself is still mid-election', () => {
		expect(resolvePositionHeroState({ ...race, now: at('2026-11-03') })).toEqual({ phase: 'midElection', resultsPending: false });
	});

	test('after the election with no results, mid-election with results pending', () => {
		expect(resolvePositionHeroState({ ...race, now: at('2026-11-10') })).toEqual({ phase: 'midElection', resultsPending: true });
	});

	test('after the election with zero winners recorded still counts as pending', () => {
		expect(resolvePositionHeroState({ ...race, winnerCount: 0, now: at('2026-11-10') })).toEqual({
			phase: 'midElection',
			resultsPending: true,
		});
	});

	test('one winner is decided', () => {
		expect(resolvePositionHeroState({ ...race, winnerCount: 1, now: at('2026-11-10') })).toEqual({
			phase: 'decided',
			multipleWinners: false,
		});
	});

	test('several winners is decided with multiple winners', () => {
		expect(resolvePositionHeroState({ ...race, winnerCount: 3, now: at('2026-11-10') })).toEqual({
			phase: 'decided',
			multipleWinners: true,
		});
	});

	test('no filing dates at all reads as mid-election', () => {
		expect(resolvePositionHeroState({ electionDate: race.electionDate, now: at('2026-08-15') })).toEqual({
			phase: 'midElection',
			resultsPending: false,
		});
	});

	test('a filing start with no deadline is filing until it opens', () => {
		expect(resolvePositionHeroState({ filingDateStart: race.filingDateStart, electionDate: race.electionDate, now: at('2026-05-01') })).toEqual(
			{ phase: 'filing', filingOpen: false },
		);
	});

	test('date-only strings are read the same as timestamps', () => {
		expect(
			resolvePositionHeroState({ filingDateStart: '2026-06-01', filingDateEnd: '2026-10-02', electionDate: '2026-11-03', now: at('2026-08-15') }),
		).toEqual({ phase: 'filing', filingOpen: true });
	});
});

describe('daysUntil', () => {
	test('counts whole days to a future date', () => {
		expect(daysUntil('2026-11-03T00:00:00.000Z', at('2026-10-20'))).toBe(14);
	});

	test('is zero on the day', () => {
		expect(daysUntil('2026-11-03', at('2026-11-03'))).toBe(0);
	});

	test('goes negative once passed', () => {
		expect(daysUntil('2026-11-03', at('2026-11-05'))).toBe(-2);
	});

	test('is null without a date', () => {
		expect(daysUntil(undefined, at('2026-11-05'))).toBeNull();
		expect(daysUntil('TBD', at('2026-11-05'))).toBeNull();
	});
});
