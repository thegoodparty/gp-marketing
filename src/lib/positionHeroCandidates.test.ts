import { describe, expect, test } from 'bun:test';
import { currentCycleCandidacies, mapCandidacyToHeroCandidate, rankPositionCandidates } from './positionHeroCandidates';
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
