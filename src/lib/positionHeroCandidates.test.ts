import { describe, expect, test } from 'bun:test';
import { mapCandidacyToHeroCandidate, rankPositionCandidates } from './positionHeroCandidates';
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
