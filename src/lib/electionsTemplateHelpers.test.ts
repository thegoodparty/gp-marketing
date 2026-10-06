import { describe, expect, test } from 'bun:test';

import {
	buildCandidatesSectionOverrides,
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
		expect(resolveTokens('Running in [location]', tokens)).toBe('Running in Brooklyn, NY');
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
		expect(resolveTokens('Candidates in [location]', tokens)).toBe('Candidates in Brooklyn, NY');
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

	/** The offices list counts each row's pledged candidates off the same people the hero and featured block read. */
	test('gives each office its pledged candidate count by race slug, counting a person once per race', () => {
		const card = (overrides: Partial<{ personId: string | null; href: string; raceSlug: string | null; isPledged: boolean }>) => ({
			personId: 'p1',
			name: 'Person',
			office: null,
			location: null,
			href: '/people/person-p1',
			avatarUrl: null,
			isPledged: true,
			isNonpartisan: true,
			role: 'candidate' as const,
			electionDate: '2026-11-03',
			raceSlug: 'il/kane-county/county-board',
			...overrides,
		});
		const offices = [
			{ id: 'a', type: 'County', position: 'County Board', nextElectionDate: '2026-11-03', raceSlug: 'IL/kane-county/county-board' },
			{ id: 'b', type: 'County', position: 'Sheriff', nextElectionDate: '2026-11-03', raceSlug: 'il/kane-county/sheriff' },
			{ id: 'c', type: 'County', position: 'Unslugged', nextElectionDate: '2026-11-03' },
		];
		const list = buildElectionsIndexSectionOverrides({
			...countyCtx,
			offices,
			featuredPeople: {
				candidates: [
					card({}),
					card({ personId: 'P1' }),
					card({ personId: 'p2', href: '/people/two-p2' }),
					card({ personId: 'p3', href: '/people/three-p3', isPledged: false }),
					card({ personId: 'p4', href: '/people/four-p4', raceSlug: 'il/kane-county/sheriff', isPledged: false }),
				],
				representatives: [],
				candidatesComplete: true,
			},
		}).component_listOfOfficesBlock;

		expect(list?.offices?.map(office => office.pledgedCount)).toEqual([2, undefined, undefined]);
	});

	test('leaves the offices untouched without featured people', () => {
		const offices = [{ id: 'a', type: 'County', position: 'County Board', nextElectionDate: '2026-11-03', raceSlug: 'il/kane-county/county-board' }];
		expect(buildElectionsIndexSectionOverrides({ ...countyCtx, offices }).component_listOfOfficesBlock?.offices).toBe(offices);
	});

	test('leaves the headline unset when the route does not phrase one', () => {
		const hero = buildElectionsIndexSectionOverrides({ ...countyCtx, heroTitle: undefined }).component_locationLandingPageHero;

		expect(hero?.headline).toBeUndefined();
		expect(hero?.stateName).toBe('Illinois');
	});

	/** The hero reads its independents from the same people the featured block gets, so the two can never disagree. */
	test("summarises the featured people into the hero's independents, and hides both without them", () => {
		const pledged = {
			personId: 'p1',
			name: 'A',
			office: null,
			location: null,
			href: '/people/a',
			avatarUrl: null,
			isPledged: true,
			isNonpartisan: true,
			role: 'candidate' as const,
			electionDate: '2026-11-03',
		};
		const withPeople = buildElectionsIndexSectionOverrides({
			...countyCtx,
			defaultYear: 2026,
			featuredPeople: { candidates: [pledged], representatives: [], candidatesComplete: true },
		}).component_locationLandingPageHero;
		const withoutPeople = buildElectionsIndexSectionOverrides(countyCtx).component_locationLandingPageHero;

		expect(withPeople?.independents).toEqual({ candidateCount: 1, hasAny: true });
		expect(withoutPeople?.independents).toEqual({ candidateCount: null, hasAny: false });
	});

	/**
	 * Both hero figures describe the ballot the offices list shows, in the year it
	 * opens on: the races are the list's own rows for that year, and the
	 * independents are scoped to it too.
	 */
	test('counts the races and the independents off the offices list, in its opening year', () => {
		const office = (slug: string, nextElectionDate: string) => ({
			id: slug,
			type: 'County',
			position: slug,
			nextElectionDate,
			href: `/${slug}`,
		});
		const candidate = (personId: string, electionDate: string) => ({
			personId,
			name: personId,
			office: null,
			location: null,
			href: `/people/${personId}`,
			avatarUrl: null,
			isPledged: true,
			isNonpartisan: true,
			role: 'candidate' as const,
			electionDate,
		});
		const hero = buildElectionsIndexSectionOverrides({
			...countyCtx,
			defaultYear: 2026,
			offices: [office('clerk', '2026-11-03'), office('sheriff', '2026-11-03'), office('judge', '2028-11-07')],
			featuredPeople: {
				candidates: [candidate('p1', '2026-11-03'), candidate('p2', '2028-11-07')],
				representatives: [],
				candidatesComplete: true,
			},
		}).component_locationLandingPageHero;

		expect(hero?.raceCount).toBe(2);
		expect(hero?.independents).toEqual({ candidateCount: 1, hasAny: true });
	});

	/** Without the list's opening year neither figure can be scoped, so both hide together; the button still knows someone is pledged. */
	test('without an opening year the independent count hides along with the race count', () => {
		const pledged = {
			personId: 'p1',
			name: 'A',
			office: null,
			location: null,
			href: '/people/a',
			avatarUrl: null,
			isPledged: true,
			isNonpartisan: true,
			role: 'candidate' as const,
			electionDate: '2026-11-03',
		};
		const hero = buildElectionsIndexSectionOverrides({
			...countyCtx,
			offices: [],
			featuredPeople: { candidates: [pledged], representatives: [], candidatesComplete: true },
		}).component_locationLandingPageHero;

		expect(hero?.raceCount).toBeNull();
		expect(hero?.independents).toEqual({ candidateCount: null, hasAny: true });
	});

	test('the race count is unknown, not zero, when the page has no offices data', () => {
		expect(buildElectionsIndexSectionOverrides(countyCtx).component_locationLandingPageHero?.raceCount).toBeNull();
		const emptyList = buildElectionsIndexSectionOverrides({ ...countyCtx, defaultYear: 2026, offices: [] });
		expect(emptyList.component_locationLandingPageHero?.raceCount).toBe(0);
	});
});
