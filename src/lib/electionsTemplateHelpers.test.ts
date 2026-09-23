import { describe, expect, test } from 'bun:test';

import {
	buildCandidatesSectionOverrides,
	buildCandidatesTokens,
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

describe('buildPositionSectionOverrides', () => {
	test('includes rightColumnCTA when candidatesHref is set', () => {
		const overrides = buildPositionSectionOverrides({
			...positionOverrideCtx,
			candidatesHref: '/elections/mn/morrison-county/position/county-attorney/candidates',
		});

		expect(overrides.component_electionsPositionContentBlock?.rightColumnCTA).toEqual({
			buttonType: 'internal',
			href: '/elections/mn/morrison-county/position/county-attorney/candidates',
			label: 'View candidates',
			buttonProps: { styleType: 'secondary' },
		});
	});

	test('omits rightColumnCTA when candidatesHref is not set', () => {
		const overrides = buildPositionSectionOverrides(positionOverrideCtx);

		expect(overrides.component_electionsPositionContentBlock?.rightColumnCTA).toBeUndefined();
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

	test('hands the hero the race dates, the seat count and the candidates page link', () => {
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
			candidatesHref: '/elections/mn/morrison-county/position/county-attorney/candidates',
		});
		expect(overrides.component_electionsPositionHero?.candidates).toHaveLength(1);
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
