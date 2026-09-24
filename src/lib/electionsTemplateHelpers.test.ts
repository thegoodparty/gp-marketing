import { describe, expect, test } from 'bun:test';

import {
	buildCandidatesTokens,
	buildElectionsIndexSectionOverrides,
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

	test('chooses the how-to-run guide for the office from the blog article matrix', () => {
		const overrides = buildPositionSectionOverrides(positionOverrideCtx);

		expect(overrides.component_electionPositionResourcesBlock?.guideHref).toBe('/blog/article/how-to-run-for-district-attorney');
	});

	test('reads the race when it has one, not only the office name', () => {
		const overrides = buildPositionSectionOverrides({
			...positionOverrideCtx,
			officeName: 'Commissioner',
			race: { id: 1, slug: 'mn/morrison-county/commissioner', name: 'Morrison County Commissioner', state: 'MN', positionLevel: 'COUNTY' },
		});

		expect(overrides.component_electionPositionResourcesBlock?.guideHref).toBe('/blog/article/how-to-run-for-county-commissioner');
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

describe('buildElectionsIndexSectionOverrides', () => {
	const countyCtx = {
		breadcrumbs: [],
		locationLevel: 'county' as const,
		stateName: 'Illinois',
		countyName: 'Kane County',
		heroTitle: 'Upcoming elections in Kane County, Illinois',
	};

	/**
	 * The route phrases the whole headline. It used to be handed over as `stateName`,
	 * and the hero rebuilt a headline around it, so every county, city and district
	 * page published "Kane County, Upcoming elections in Kane County, Illinois".
	 */
	test('hands the hero the route headline, and the bare state name separately', () => {
		const hero = buildElectionsIndexSectionOverrides(countyCtx).component_locationLandingPageHero;

		expect(hero?.headline).toBe('Upcoming elections in Kane County, Illinois');
		expect(hero?.stateName).toBe('Illinois');
		expect(hero?.countyName).toBe('Kane County');
	});

	test('leaves the headline unset when the route does not phrase one', () => {
		const hero = buildElectionsIndexSectionOverrides({ ...countyCtx, heroTitle: undefined }).component_locationLandingPageHero;

		expect(hero?.headline).toBeUndefined();
		expect(hero?.stateName).toBe('Illinois');
	});
});
