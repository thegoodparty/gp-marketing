import { describe, expect, test } from 'bun:test';

import {
	buildCandidatesSectionOverrides,
	buildCandidatesTokens,
	buildPositionSeatFilter,
	buildPositionSectionOverrides,
	buildPositionTokens,
} from '~/lib/electionsTemplateHelpers';
import { resolveTokens } from '~/lib/resolveTokens';

const tokenCtx = {
	officeName: 'Mayor',
	stateName: 'New York',
	countyName: 'Kings',
	cityName: 'Brooklyn',
};

const positionOverrideCtx = {
	officeName: 'County Attorney',
	stateName: 'Minnesota',
	countyName: 'Morrison County',
	electionDate: 'November 3, 2026',
	filingDate: 'TBD',
	breadcrumbs: [{ href: '/elections', label: 'Elections' }],
	pageUrl: 'https://goodparty.org/elections/mn/morrison-county/position/county-attorney',
};

describe('buildPositionSectionOverrides content block', () => {
	const race = {
		id: 'r1',
		slug: 'mn/morrison-county/county-attorney',
		name: 'County Attorney',
		state: 'MN',
		electionDate: '2026-11-03T00:00:00.000Z',
		filingDateStart: '2026-05-19T00:00:00.000Z',
		filingDateEnd: '2026-06-02T00:00:00.000Z',
		positionLevel: 'county',
		salary: '$90,000 / year',
		employmentType: 'Full Time',
		partisanType: 'partisan',
		frequency: ['4'],
		numberOfSeats: 1,
		isRunoff: false,
		positionDescription: 'The county attorney prosecutes crimes.',
		eligibilityRequirements: 'Must be a licensed attorney.',
		filingRequirements: 'Affidavit of candidacy and $500 fee.',
		filingOfficeAddress: '213 1st Ave SE, Little Falls, MN 56345',
	};

	test('carries the same race dates the hero reads, the page URL and the location crumb', () => {
		const overrides = buildPositionSectionOverrides({
			...positionOverrideCtx,
			race,
			breadcrumbs: [
				{ href: '/elections', label: 'Elections' },
				{ href: '/elections/mn', label: 'Minnesota' },
				{ href: '/elections/mn/morrison-county', label: 'Morrison County' },
				{ href: '', label: 'County Attorney' },
			],
			heroCandidates: [
				{ key: 'c1', name: 'Tom Nguyen', party: 'Independent', partyClass: 'independent', isPledged: true, href: '/people/tom-nguyen-c1' },
			],
			officeholders: [{ key: 'o1', name: 'Grace Hopper', party: 'Independent', term: '2023 to 2027' }],
		});
		const block = overrides.component_electionsPositionContentBlock;

		expect(block?.electionDateIso).toBe(race.electionDate);
		expect(block?.filingDateStartIso).toBe(race.filingDateStart);
		expect(block?.filingDateEndIso).toBe(race.filingDateEnd);
		expect(block?.shareUrl).toBe(positionOverrideCtx.pageUrl);
		expect(block?.locationHref).toBe('/elections/mn/morrison-county');
		expect(block?.candidates).toEqual([
			{
				key: 'c1',
				name: 'Tom Nguyen',
				party: 'Independent',
				isPledged: true,
				href: '/people/tom-nguyen-c1',
				avatar: undefined,
				isWinner: undefined,
			},
		]);
		expect(block?.officeholders?.[0]?.name).toBe('Grace Hopper');
	});

	test('maps the race facts onto the About card and the filing step', () => {
		const block = buildPositionSectionOverrides({
			...positionOverrideCtx,
			race,
			filingDate: 'May 19, 2026 - June 2, 2026',
		}).component_electionsPositionContentBlock;

		expect(block?.about?.description).toBe(race.positionDescription);
		expect(block?.about?.attributes).toEqual([
			{ label: 'Office level', value: 'County' },
			{ label: 'Election frequency', value: 'Every 4 years' },
			{ label: 'Typical salary', value: '$90,000 / year' },
			{ label: 'Commitment level', value: 'Full Time' },
			{ label: 'Affiliation', value: 'Partisan' },
			{ label: 'Positions', value: '1 open seat' },
		]);
		expect(block?.about?.electionTypes).toEqual([
			{ label: 'Partisan election (party labels appear on ballots)', checked: true },
			{ label: 'Run-off election', checked: false },
		]);
		expect(block?.howToRun?.eligibility).toBe(race.eligibilityRequirements);
		expect(block?.howToRun?.filing).toEqual([
			{ label: 'Filing requirements', value: race.filingRequirements },
			{ label: 'Filing period', value: 'May 19, 2026 - June 2, 2026' },
			{ label: 'Where to file', value: race.filingOfficeAddress },
		]);
	});

	test('leaves candidates and officeholders undefined when the route could not read them', () => {
		const block = buildPositionSectionOverrides(positionOverrideCtx).component_electionsPositionContentBlock;

		expect(block?.candidates).toBeUndefined();
		expect(block?.officeholders).toBeUndefined();
		expect(block?.about).toBeUndefined();
		expect(block?.howToRun).toBeUndefined();
		expect(block?.seatFilter).toBeUndefined();
	});

	test('offers the seat filter only when every row carries a seat and there is a choice', () => {
		const withSeats = [
			{ key: 'a', name: 'A', seatValue: '2' },
			{ key: 'b', name: 'B', seatValue: '1' },
			{ key: 'c', name: 'C', seatValue: '10' },
		];
		expect(buildPositionSeatFilter(withSeats, 'District')).toEqual({
			label: 'Filter by District',
			options: [
				{ value: '1', label: 'District 1' },
				{ value: '2', label: 'District 2' },
				{ value: '10', label: 'District 10' },
			],
		});
		expect(buildPositionSeatFilter([...withSeats, { key: 'd', name: 'D' }], 'District')).toBeUndefined();
		expect(buildPositionSeatFilter([{ key: 'a', name: 'A', seatValue: '1' }], 'District')).toBeUndefined();
	});

	test('resolves the [Position Name] alias the Figma copy uses', () => {
		const tokens = buildPositionTokens(tokenCtx);
		expect(resolveTokens('About [Position Name]', tokens)).toBe('About Mayor');
	});
});

describe('buildPositionSectionOverrides hero', () => {
	const race = {
		id: 'r1',
		slug: 'mn/morrison-county/county-attorney',
		name: 'County Attorney',
		state: 'MN',
		electionDate: '2026-11-03T00:00:00.000Z',
		filingDateStart: '2026-05-19T00:00:00.000Z',
		filingDateEnd: '2026-06-02T00:00:00.000Z',
		numberOfSeats: 2,
	};

	test('hands the hero the race dates, the seat count and an anchor to the on-page candidate rows', () => {
		const overrides = buildPositionSectionOverrides({
			...positionOverrideCtx,
			race,
			candidatesHref: '/elections/mn/morrison-county/position/county-attorney/candidates',
			heroCandidates: [{ name: 'Ada Lovelace', party: 'Independent', partyClass: 'independent' }],
		});

		expect(overrides.component_electionsPositionHero).toMatchObject({
			officeName: 'County Attorney',
			stateName: 'Minnesota',
			countyName: 'Morrison County',
			electionDateIso: '2026-11-03T00:00:00.000Z',
			filingDateStartIso: '2026-05-19T00:00:00.000Z',
			filingDateEndIso: '2026-06-02T00:00:00.000Z',
			seatCount: 2,
			candidatesHref: '#position-candidates',
			resultsHref: '#position-candidates',
		});
		expect(overrides.component_electionsPositionHero?.candidates).toHaveLength(1);
	});

	test('never links the hero to the /candidates page: with no rows on the page the button has nowhere to go', () => {
		const href = '/elections/mn/morrison-county/position/county-attorney/candidates';
		const withEmptyRows = buildPositionSectionOverrides({ ...positionOverrideCtx, race, candidatesHref: href, heroCandidates: [] });
		const withNoData = buildPositionSectionOverrides({ ...positionOverrideCtx, race, candidatesHref: href });
		expect(withEmptyRows.component_electionsPositionHero?.candidatesHref).toBeUndefined();
		expect(withNoData.component_electionsPositionHero?.candidatesHref).toBeUndefined();
		expect(withNoData.component_electionsPositionHero?.resultsHref).toBeUndefined();
	});

	test('leaves candidates undefined, not empty, when the route supplied none', () => {
		const overrides = buildPositionSectionOverrides({ ...positionOverrideCtx, race });

		expect(overrides.component_electionsPositionHero?.candidates).toBeUndefined();
		expect(overrides.component_electionsPositionHero?.winners).toBeUndefined();
	});

	test('uses the same hero data on the candidates page', () => {
		const overrides = buildCandidatesSectionOverrides({ ...positionOverrideCtx, race, candidates: [], heroCandidates: [] });

		expect(overrides.component_electionsPositionHero?.electionDateIso).toBe('2026-11-03T00:00:00.000Z');
		expect(overrides.component_electionsPositionHero?.candidates).toEqual([]);
	});
});

describe('buildPositionTokens', () => {
	test('resolves both [office name] and [office]', () => {
		const tokens = buildPositionTokens(tokenCtx);
		expect(resolveTokens('Running for [office name]?', tokens)).toBe('Running for Mayor?');
		expect(resolveTokens('Running for [office]?', tokens)).toBe('Running for Mayor?');
	});

	test('resolves [location]', () => {
		const tokens = buildPositionTokens(tokenCtx);
		expect(resolveTokens('Running in [location]', tokens)).toBe('Running in Brooklyn, Kings, New York');
	});

	test('does not supply [candidate name]', () => {
		const tokens = buildPositionTokens(tokenCtx);
		expect(resolveTokens('Meet [candidate name]', tokens)).toBe('Meet ');
	});
});

describe('buildCandidatesTokens', () => {
	test('resolves both [office name] and [office]', () => {
		const tokens = buildCandidatesTokens(tokenCtx);
		expect(resolveTokens('Not running for [office]?', tokens)).toBe('Not running for Mayor?');
		expect(resolveTokens('See candidates for [office name]', tokens)).toBe('See candidates for Mayor');
	});

	test('resolves [location], [State], and [County or City]', () => {
		const tokens = buildCandidatesTokens(tokenCtx);
		expect(resolveTokens('Candidates in [location]', tokens)).toBe('Candidates in Brooklyn, Kings, New York');
		expect(resolveTokens('Candidates in [State]', tokens)).toBe('Candidates in New York');
		expect(resolveTokens('Candidates in [County or City]', tokens)).toBe('Candidates in Brooklyn');
	});

	test('does not supply [candidate name]', () => {
		const tokens = buildCandidatesTokens(tokenCtx);
		expect(resolveTokens('Meet [candidate name]', tokens)).toBe('Meet ');
	});
});
