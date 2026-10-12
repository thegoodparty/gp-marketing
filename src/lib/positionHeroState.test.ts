import { describe, expect, test } from 'bun:test';
import { daysUntil, positionHeroHeading, positionPageMetadata, resolvePositionHeroState } from './positionHeroState';

const race = {
	filingDateStart: '2026-06-01T00:00:00.000Z',
	filingDateEnd: '2026-10-02T00:00:00.000Z',
	electionDate: '2026-11-03T00:00:00.000Z',
};

const at = (iso: string) => new Date(`${iso}T12:00:00`);

describe('resolvePositionHeroState', () => {
	test('filing is open between the window opening and the deadline', () => {
		expect(resolvePositionHeroState({ ...race, now: at('2026-08-15') })).toEqual({ phase: 'filing' });
	});

	test('the opening day itself is filing', () => {
		expect(resolvePositionHeroState({ ...race, now: at('2026-06-01') })).toEqual({ phase: 'filing' });
	});

	test('the deadline day itself still counts as filing', () => {
		expect(resolvePositionHeroState({ ...race, now: at('2026-10-02') })).toEqual({ phase: 'filing' });
	});

	test('before the window opens it is pre-filing, however close the opening is', () => {
		expect(resolvePositionHeroState({ ...race, now: at('2026-01-15') })).toEqual({ phase: 'preFiling' });
		expect(resolvePositionHeroState({ ...race, now: at('2026-05-20') })).toEqual({ phase: 'preFiling' });
		expect(resolvePositionHeroState({ ...race, now: at('2026-05-31') })).toEqual({ phase: 'preFiling' });
	});

	test('Houston mayor: filing opens July 2027, so in October 2026 the page is pre-filing', () => {
		expect(
			resolvePositionHeroState({ filingDateStart: '2027-07-17', filingDateEnd: '2027-08-16', electionDate: '2027-11-02', now: at('2026-10-12') }),
		).toEqual({ phase: 'preFiling' });
	});

	test('Richwood mayor: a deadline with no opening date is pre-filing until nine months before it, then filing', () => {
		const richwood = { filingDateEnd: '2027-08-04', electionDate: '2027-11-02' };
		expect(resolvePositionHeroState({ ...richwood, now: at('2026-10-12') })).toEqual({ phase: 'preFiling' });
		expect(resolvePositionHeroState({ ...richwood, now: at('2026-11-03') })).toEqual({ phase: 'preFiling' });
		expect(resolvePositionHeroState({ ...richwood, now: at('2026-11-04') })).toEqual({ phase: 'filing' });
		expect(resolvePositionHeroState({ ...richwood, now: at('2027-08-04') })).toEqual({ phase: 'filing' });
	});

	test('the nine-month mark clamps to the end of a shorter month instead of overflowing', () => {
		const deadline = { filingDateEnd: '2026-11-30', electionDate: '2027-03-02' };
		expect(resolvePositionHeroState({ ...deadline, now: at('2026-02-27') })).toEqual({ phase: 'preFiling' });
		expect(resolvePositionHeroState({ ...deadline, now: at('2026-02-28') })).toEqual({ phase: 'filing' });
	});

	test('with no filing dates at all, more than nine months before the election is pre-filing and inside it is mid-election', () => {
		expect(resolvePositionHeroState({ electionDate: race.electionDate, now: at('2026-01-15') })).toEqual({ phase: 'preFiling' });
		expect(resolvePositionHeroState({ electionDate: race.electionDate, now: at('2026-02-03') })).toEqual({
			phase: 'midElection',
			resultsPending: false,
		});
		expect(resolvePositionHeroState({ electionDate: race.electionDate, now: at('2026-08-15') })).toEqual({
			phase: 'midElection',
			resultsPending: false,
		});
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

	test('two months after the election with no result it is still results pending', () => {
		expect(resolvePositionHeroState({ ...race, now: at('2027-01-03') })).toEqual({ phase: 'midElection', resultsPending: true });
	});

	test('three months after the election the pending stretch ends and the page goes back to pre-filing', () => {
		expect(resolvePositionHeroState({ ...race, now: at('2027-02-03') })).toEqual({ phase: 'midElection', resultsPending: true });
		expect(resolvePositionHeroState({ ...race, now: at('2027-02-04') })).toEqual({ phase: 'preFiling' });
	});

	test('Union County sheriff: the last election loaded is 2020 with no result, so the page is pre-filing', () => {
		expect(
			resolvePositionHeroState({ filingDateStart: '2020-01-01', filingDateEnd: '2020-03-01', electionDate: '2020-11-03', now: at('2026-10-12') }),
		).toEqual({ phase: 'preFiling' });
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

	test('a winner on record holds decided however long ago the election was', () => {
		expect(resolvePositionHeroState({ ...race, winnerCount: 1, now: at('2027-06-01') })).toEqual({
			phase: 'decided',
			multipleWinners: false,
		});
	});

	test('a filing start with no deadline is pre-filing until it opens, then open filing until election day', () => {
		const noDeadline = { filingDateStart: race.filingDateStart, electionDate: race.electionDate };
		expect(resolvePositionHeroState({ ...noDeadline, now: at('2026-05-01') })).toEqual({ phase: 'preFiling' });
		expect(resolvePositionHeroState({ ...noDeadline, now: at('2026-08-15') })).toEqual({ phase: 'filing' });
		expect(resolvePositionHeroState({ ...noDeadline, now: at('2026-11-03') })).toEqual({ phase: 'filing' });
		expect(resolvePositionHeroState({ ...noDeadline, now: at('2026-11-10') })).toEqual({ phase: 'midElection', resultsPending: true });
	});

	test('a filing start with no deadline and no election date does not stay in filing for ever', () => {
		const startOnly = { filingDateStart: race.filingDateStart };
		expect(resolvePositionHeroState({ ...startOnly, now: at('2026-05-01') })).toEqual({ phase: 'preFiling' });
		expect(resolvePositionHeroState({ ...startOnly, now: at('2026-08-15') })).toEqual({ phase: 'midElection', resultsPending: false });
		expect(resolvePositionHeroState({ ...startOnly, now: at('2029-08-15') })).toEqual({ phase: 'midElection', resultsPending: false });
	});

	test('no dates at all reads as mid-election with nothing to count down to', () => {
		expect(resolvePositionHeroState({ now: at('2026-08-15') })).toEqual({ phase: 'midElection', resultsPending: false });
	});

	test('date-only strings are read the same as timestamps', () => {
		expect(
			resolvePositionHeroState({ filingDateStart: '2026-06-01', filingDateEnd: '2026-10-02', electionDate: '2026-11-03', now: at('2026-08-15') }),
		).toEqual({ phase: 'filing' });
	});
});

describe('positionHeroHeading', () => {
	test('pre-filing leads with the guide; every other phase names the race', () => {
		expect(positionHeroHeading({ phase: 'preFiling' }, 'City Council', 'Bay City, MI')).toBe('How to Run for City Council in Bay City, MI');
		expect(positionHeroHeading({ phase: 'filing' }, 'City Council', 'Bay City, MI')).toBe('City Council in Bay City, MI');
		expect(positionHeroHeading({ phase: 'midElection', resultsPending: false }, 'City Council', 'Bay City, MI')).toBe('City Council in Bay City, MI');
		expect(positionHeroHeading({ phase: 'midElection', resultsPending: true }, 'City Council', 'Bay City, MI')).toBe('City Council in Bay City, MI');
		expect(positionHeroHeading({ phase: 'decided', multipleWinners: false }, 'City Council', 'Bay City, MI')).toBe('City Council in Bay City, MI');
	});

	test('with no place it is the office alone', () => {
		expect(positionHeroHeading({ phase: 'preFiling' }, 'Governor', null)).toBe('How to Run for Governor');
		expect(positionHeroHeading({ phase: 'filing' }, 'Governor', undefined)).toBe('Governor');
	});
});

describe('positionPageMetadata', () => {
	test('pre-filing titles the page as a how-to and describes what it covers', () => {
		expect(positionPageMetadata({ phase: 'preFiling' }, 'Mayor', 'Houston, Harris County, Texas', 'GoodParty.org')).toEqual({
			title: 'How to Run for Mayor in Houston, Harris County, Texas | GoodParty.org',
			description: 'Learn how to run for Mayor in Houston, Harris County, Texas: filing dates, election date and who holds the office today.',
		});
	});

	test('every other phase keeps the election title and description', () => {
		const expected = {
			title: 'Governor in New York | GoodParty.org',
			description: 'Election details and candidates for Governor in New York.',
		};
		expect(positionPageMetadata({ phase: 'filing' }, 'Governor', 'New York', 'GoodParty.org')).toEqual(expected);
		expect(positionPageMetadata({ phase: 'midElection', resultsPending: false }, 'Governor', 'New York', 'GoodParty.org')).toEqual(expected);
		expect(positionPageMetadata({ phase: 'decided', multipleWinners: true }, 'Governor', 'New York', 'GoodParty.org')).toEqual(expected);
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
