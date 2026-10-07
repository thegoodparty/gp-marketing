import { describe, expect, test } from 'bun:test';

import {
	buildCandidatesSectionOverrides,
	buildCandidatesTokens,
	buildPositionSeatFilter,
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
				seatName: undefined,
				seatValue: undefined,
				seatLabel: undefined,
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

	test('candidates that carry a seat feed the filter alongside the officeholders', () => {
		const block = buildPositionSectionOverrides({
			...positionOverrideCtx,
			race,
			heroCandidates: [
				{ key: 'c1', name: 'A', party: 'Independent', partyClass: 'independent', seatName: 'District', seatValue: '1' },
				{ key: 'c2', name: 'B', party: 'Democratic', partyClass: 'democrat', seatName: 'District', seatValue: '2' },
			],
			officeholders: [{ key: 'o1', name: 'C', seatValue: '2', seatName: 'District' }],
		}).component_electionsPositionContentBlock;
		expect(block?.candidates?.[0]?.seatLabel).toBe('District 1');
		expect(block?.seatFilter?.label).toBe('Filter by District');
		expect(block?.seatFilter?.options.map(option => option.value)).toEqual(['1', '2']);
	});

	test("names the seat filter after the office's own sub-area when every row carries a seat", () => {
		const block = buildPositionSectionOverrides({
			...positionOverrideCtx,
			race,
			officeholders: [
				{ key: 'o1', name: 'A', seatValue: '1', seatName: 'Ward' },
				{ key: 'o2', name: 'B', seatValue: '2', seatName: 'Ward' },
			],
		}).component_electionsPositionContentBlock;
		expect(block?.seatFilter?.label).toBe('Filter by Ward');
		expect(block?.seatFilter?.options.map(option => option.label)).toEqual(['Ward 1', 'Ward 2']);
	});

	test('resolves the [Position Name] alias the Figma copy uses', () => {
		const tokens = buildPositionTokens(tokenCtx);
		expect(resolveTokens('About [Position Name]', tokens)).toBe('About Mayor');
	});

	test('chooses the how-to-run guide for the office from the blog article matrix', () => {
		const overrides = buildPositionSectionOverrides(positionOverrideCtx);

		expect(overrides.component_electionPositionResourcesBlock?.guideHref).toBe('/blog/article/how-to-run-for-district-attorney');
	});

	/** The nearby offices heading names the page's own place once: a state page is "in Michigan", not "in Michigan, Michigan". */
	test('names the place and state in the nearby offices heading, and only the state on a state page', () => {
		const county = buildPositionSectionOverrides(positionOverrideCtx);
		const city = buildPositionSectionOverrides({ ...positionOverrideCtx, cityName: 'Little Falls' });
		const state = buildPositionSectionOverrides({ ...positionOverrideCtx, countyName: undefined });

		expect(county.component_nearbyOffices?.heading).toBe('More offices in Morrison County, Minnesota');
		expect(city.component_nearbyOffices?.heading).toBe('More offices in Little Falls, Minnesota');
		expect(state.component_nearbyOffices?.heading).toBe('More offices in Minnesota');
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
