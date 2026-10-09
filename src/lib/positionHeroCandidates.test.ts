import { describe, expect, test } from 'bun:test';
import { currentCycleCandidacies, mapCandidacyToHeroCandidate, rankPositionCandidates } from './positionHeroCandidates';
import type { PersonItem, PersonOfficeHolder } from '~/types/people';
import type { ElectionsPositionHeroCandidate } from '~/ui/ElectionsPositionHero';

/**
 * Pins the order of a position page's candidates (Emily, 2026-10-06): pledged
 * first, then the unpledged with no major party, then Republicans and
 * Democrats, with the feed's order kept inside each group. Seen on the QA
 * preview: a pledged judge candidate sat seventh in a nonpartisan field, and
 * the hero's four-name ballot card never showed them.
 */

const person = (name: string, over: Partial<ElectionsPositionHeroCandidate> = {}): ElectionsPositionHeroCandidate => ({
	key: name,
	name,
	party: 'Nonpartisan',
	partyClass: null,
	isPledged: false,
	href: `/people/${name.toLowerCase()}`,
	...over,
});

describe('rankPositionCandidates', () => {
	test('pledged, then unpledged non-partisan, then major party', () => {
		const feed = [
			person('A', { party: 'Democratic', partyClass: 'democrat' }),
			person('B'),
			person('C', { party: 'Republican', partyClass: 'republican' }),
			person('D', { isPledged: true }),
			person('E', { party: 'Independent', partyClass: 'independent' }),
			person('F', { isPledged: true, party: 'Independent', partyClass: 'independent' }),
		];
		expect(rankPositionCandidates(feed).map(c => c.name)).toEqual(['D', 'F', 'B', 'E', 'A', 'C']);
	});

	test('keeps the feed order inside a group', () => {
		const feed = [person('Zed'), person('Amy'), person('Kim')];
		expect(rankPositionCandidates(feed).map(c => c.name)).toEqual(['Zed', 'Amy', 'Kim']);
	});

	test('a pledged person lands in the first four, where the hero can show them', () => {
		const feed = [...Array.from({ length: 6 }, (_, i) => person(`N${i}`)), person('Pledged', { isPledged: true })];
		expect(rankPositionCandidates(feed).slice(0, 4).map(c => c.name)).toContain('Pledged');
	});

	test('an empty field stays empty', () => {
		expect(rankPositionCandidates([])).toEqual([]);
	});
});

/**
 * The seat comes from the candidacy's OWN race row. Under a shared slug such as
 * mi/state-senator every district's race shares the slug, so this is the only
 * row that knows which district a candidate is in (Emily, 2026-10-06). It is
 * what lights up the seat tags and the seat filter on the position page.
 */
describe('mapCandidacyToHeroCandidate reads the seat off the candidacy\u2019s race', () => {
	test('District 21 from the race row', () => {
		const candidate = mapCandidacyToHeroCandidate(
			{ id: 'c1', firstName: 'Sarah', lastName: 'Anthony', party: 'Democratic', Race: { brHashId: 'br1', slug: 'mi/state-senator', subAreaName: 'District', subAreaValue: '21' } },
			0,
			undefined,
		);
		expect(candidate.seatName).toBe('District');
		expect(candidate.seatValue).toBe('21');
	});

	test('no race row, no seat', () => {
		const candidate = mapCandidacyToHeroCandidate({ id: 'c2', firstName: 'Pat', lastName: 'Lee' }, 1, undefined);
		expect(candidate.seatName).toBeUndefined();
		expect(candidate.seatValue).toBeUndefined();
	});
});

/**
 * The party on a position page row is the person's, read as their profile
 * reads it, not the one ballot line the row was filed on: under New York's
 * fusion voting a major-party nominee's row often carries the minor line
 * (Bruce Blakeman, "Vote Affordable"; Emily, 2026-10-09).
 */
describe('mapCandidacyToHeroCandidate labels the person, not the ballot line', () => {
	const row = { id: 'c1', personId: 'p-bb', firstName: 'Bruce', lastName: 'Blakeman', party: 'Vote Affordable' };
	const record = (over: Partial<PersonItem>): PersonItem => ({
		id: 'p-bb',
		slug: 'bruce-blakeman',
		firstName: 'Bruce',
		middleName: null,
		lastName: 'Blakeman',
		nickname: null,
		suffix: null,
		fullName: 'Bruce Blakeman',
		bioText: null,
		headshotUrl: null,
		websiteUrl: null,
		linkedinUrl: null,
		facebookUrl: null,
		twitterUrl: null,
		instagramUrl: null,
		state: 'NY',
		...over,
	});
	const office = (partyNames: string[]): PersonOfficeHolder => ({
		id: 'o1',
		positionName: 'Nassau County Executive',
		normalizedPositionName: null,
		officeTitle: 'County Executive',
		partyNames,
		startAt: '2022-01-01',
		endAt: null,
		termDateSpecificity: null,
		isCurrent: true,
		isAppointed: null,
		numberOfSeats: null,
		state: 'NY',
		subAreaName: null,
		subAreaValue: null,
		websiteUrl: null,
		officePhone: null,
		officeEmail: null,
		mailingCity: null,
		mailingState: null,
	});

	test('the office on the record names the party and the class', () => {
		const candidate = mapCandidacyToHeroCandidate(row, 0, record({ OfficeHolders: [office(['Conservative Party', 'Republican'])] }));
		expect([candidate.party, candidate.partyClass]).toEqual(['Republican, Conservative Party', 'republican']);
	});

	test('a record with no party keeps the row\u2019s line', () => {
		const candidate = mapCandidacyToHeroCandidate(row, 0, record({}));
		expect([candidate.party, candidate.partyClass]).toEqual(['Vote Affordable', 'other']);
	});

	test('no record, the row is all there is', () => {
		const candidate = mapCandidacyToHeroCandidate(row, 0, undefined);
		expect([candidate.party, candidate.partyClass]).toEqual(['Vote Affordable', 'other']);
		expect(mapCandidacyToHeroCandidate({ id: 'c2', firstName: 'Pat', lastName: 'Lee' }, 1, undefined).party).toBe('Unknown');
	});

	test('a major line on the row still classes the row major when the record leads with a minor one', () => {
		const candidate = mapCandidacyToHeroCandidate({ ...row, party: 'Democratic' }, 0, record({ OfficeHolders: [office(['Working Families'])] }));
		expect([candidate.party, candidate.partyClass]).toEqual(['Working Families', 'democrat']);
	});
});

describe('currentCycleCandidacies', () => {
	const today = new Date(2026, 9, 7);
	const run = (id: string, electionDate?: string) =>
		({ id, firstName: id, lastName: 'X', party: 'Nonpartisan', Race: electionDate ? { brHashId: `r-${id}`, electionDate } : undefined }) as never;

	/** Garden Grove, CA council: two District 5 candidates from 2024 sat beside the 2026 field. */
	test('drops a candidacy from a past cycle and keeps the upcoming and undated ones', () => {
		const kept = currentCycleCandidacies([run('zylla', '2026-11-03'), run('muneton', '2024-11-05'), run('undated')], {
			raceElectionDate: '2026-11-03',
			today,
		});
		expect(kept.map(c => c.id)).toEqual(['zylla', 'undated']);
	});

	test('a decided page keeps the field of its own past race', () => {
		const kept = currentCycleCandidacies([run('won', '2025-11-04T00:00:00.000Z'), run('older', '2021-11-02')], {
			raceElectionDate: '2025-11-04T00:00:00.000Z',
			today,
		});
		expect(kept.map(c => c.id)).toEqual(['won']);
	});
});
