/// <reference types="bun-types" />
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { resolvePlace, resolvePlaceUrl, type ResolvePlaceData } from './resolvePlace';
import { normalizeName } from './electionsApi';
import { __resetElectionApiAuthForTests } from './electionApiAuth';

type FetchMockResponse = { match(url: string): boolean; body: unknown };

function withFetchMock(responses: FetchMockResponse[]): string[] {
	const urls: string[] = [];
	globalThis.fetch = (async (input: RequestInfo | URL) => {
		const url = String(input);
		urls.push(url);
		const match = responses.find(r => r.match(url));
		return new Response(JSON.stringify(match ? match.body : []), {
			status: 200,
			headers: { 'content-type': 'application/json' },
		});
	}) as typeof fetch;
	return urls;
}

const guilfordCounty: ResolvePlaceData = {
	cityAndTownPlaces: [{ name: 'Greensboro', slug: 'nc/greensboro', countyName: 'Guilford' }],
	countyPlaces: [{ name: 'Guilford County', slug: 'nc/guilford-county' }],
	citySlugToCountySlug: new Map([['nc/greensboro', 'nc/guilford-county']]),
};

const windhamCounty: ResolvePlaceData = {
	cityAndTownPlaces: [{ name: 'Brattleboro', slug: 'vt/brattleboro-town', countyName: 'Windham' }],
	countyPlaces: [{ name: 'Windham County', slug: 'vt/windham-county' }],
	citySlugToCountySlug: new Map([['vt/brattleboro-town', 'vt/windham-county']]),
};

// Simulates what the wrapper's county walk hands the pure resolver for CT: the
// walked child's slug and the county-slug map entry the walk builds directly.
const hartfordCountyWalk: ResolvePlaceData = {
	cityAndTownPlaces: [{ name: 'Hartford', slug: 'ct/hartford-county/hartford', countyName: 'Hartford County' }],
	countyPlaces: [{ name: 'Hartford County', slug: 'ct/hartford-county' }],
	citySlugToCountySlug: new Map([['ct/hartford-county/hartford', 'ct/hartford-county']]),
};

const louisianaParish: ResolvePlaceData = {
	cityAndTownPlaces: [],
	countyPlaces: [{ name: 'Jefferson Parish', slug: 'la/jefferson-parish' }],
	citySlugToCountySlug: new Map(),
};

const washingtonDc: ResolvePlaceData = {
	cityAndTownPlaces: [],
	countyPlaces: [{ name: 'District of Columbia', slug: 'dc/district-of-columbia' }],
	citySlugToCountySlug: new Map(),
};

const emptyData: ResolvePlaceData = {
	cityAndTownPlaces: [],
	countyPlaces: [],
	citySlugToCountySlug: new Map(),
};

describe('resolvePlaceUrl: city match', () => {
	test('resolves a city to its county-qualified URL', () => {
		expect(resolvePlaceUrl({ city: 'Greensboro', state: 'NC' }, guilfordCounty)).toEqual({
			url: '/elections/nc/guilford-county/greensboro',
			matchedLevel: 'city',
		});
	});

	test('resolves a Vermont town using its own -town-suffixed slug', () => {
		expect(resolvePlaceUrl({ city: 'Brattleboro', state: 'VT' }, windhamCounty)).toEqual({
			url: '/elections/vt/windham-county/brattleboro-town',
			matchedLevel: 'city',
		});
	});

	test('resolves a CT city from county-walk data despite an empty state sweep', () => {
		expect(resolvePlaceUrl({ city: 'Hartford', state: 'CT' }, hartfordCountyWalk)).toEqual({
			url: '/elections/ct/hartford-county/hartford',
			matchedLevel: 'city',
		});
	});

	test('city match wins over an available county match', () => {
		const data: ResolvePlaceData = {
			...guilfordCounty,
			countyPlaces: [...guilfordCounty.countyPlaces, { name: 'Greensboro', slug: 'nc/greensboro-county' }],
		};
		expect(resolvePlaceUrl({ city: 'Greensboro', county: 'Greensboro', state: 'NC' }, data)).toEqual({
			url: '/elections/nc/guilford-county/greensboro',
			matchedLevel: 'city',
		});
	});

	test('matches a city query against a place name carrying a Town/City/etc suffix', () => {
		const data: ResolvePlaceData = {
			cityAndTownPlaces: [{ name: 'Avon Town', slug: 'ct/hartford-county/avon', countyName: 'Hartford County' }],
			countyPlaces: [{ name: 'Hartford County', slug: 'ct/hartford-county' }],
			citySlugToCountySlug: new Map([['ct/hartford-county/avon', 'ct/hartford-county']]),
		};
		expect(resolvePlaceUrl({ city: 'Avon', state: 'CT' }, data)).toEqual({
			url: '/elections/ct/hartford-county/avon',
			matchedLevel: 'city',
		});
	});

	test('a mapped city is not shadowed by an earlier, unmapped same-named row', () => {
		const data: ResolvePlaceData = {
			// The unmapped sweep row comes first (as it does in resolvePlace's
			// [...sweep, ...walked] order); the correctly-mapped walked row is second.
			cityAndTownPlaces: [
				{ name: 'Hartford', slug: 'ct/somewhere', countyName: 'Capitol Planning Region' },
				{ name: 'Hartford', slug: 'ct/hartford-county/hartford', countyName: 'Hartford County' },
			],
			countyPlaces: [{ name: 'Hartford County', slug: 'ct/hartford-county' }],
			citySlugToCountySlug: new Map([['ct/hartford-county/hartford', 'ct/hartford-county']]),
		};
		expect(resolvePlaceUrl({ city: 'Hartford', state: 'CT' }, data)).toEqual({
			url: '/elections/ct/hartford-county/hartford',
			matchedLevel: 'city',
		});
	});

	test('falls through to state when a city match has no known county mapping', () => {
		const data: ResolvePlaceData = {
			cityAndTownPlaces: [{ name: 'Portland', slug: 'me/portland', countyName: 'Cumberland' }],
			countyPlaces: [],
			citySlugToCountySlug: new Map(),
		};
		expect(resolvePlaceUrl({ city: 'Portland', state: 'ME' }, data)).toEqual({
			url: '/elections/me',
			matchedLevel: 'state',
		});
	});
});

describe('resolvePlaceUrl: county match', () => {
	test('resolves a county-only query', () => {
		expect(resolvePlaceUrl({ county: 'Guilford County', state: 'NC' }, guilfordCounty)).toEqual({
			url: '/elections/nc/guilford-county',
			matchedLevel: 'county',
		});
	});

	test('resolves a Louisiana parish', () => {
		expect(resolvePlaceUrl({ county: 'Jefferson Parish', state: 'LA' }, louisianaParish)).toEqual({
			url: '/elections/la/jefferson-parish',
			matchedLevel: 'county',
		});
	});

	test('resolves Washington DC at the county level', () => {
		expect(resolvePlaceUrl({ county: 'District of Columbia', state: 'DC' }, washingtonDc)).toEqual({
			url: '/elections/dc/district-of-columbia',
			matchedLevel: 'county',
		});
	});

	test('falls back to the city text as a county query when no county param is given', () => {
		const data: ResolvePlaceData = { ...guilfordCounty, cityAndTownPlaces: [] };
		expect(resolvePlaceUrl({ city: 'Guilford County', state: 'NC' }, data)).toEqual({
			url: '/elections/nc/guilford-county',
			matchedLevel: 'county',
		});
	});
});

describe('resolvePlaceUrl: state fallback and unresolved', () => {
	test('falls back to the state page when nothing else matches', () => {
		expect(resolvePlaceUrl({ city: 'Nowhereville', state: 'NC' }, emptyData)).toEqual({
			url: '/elections/nc',
			matchedLevel: 'state',
		});
	});

	test('empty data with no matches still falls through to state', () => {
		expect(resolvePlaceUrl({ city: 'Anything', county: 'Anything', state: 'CA' }, emptyData)).toEqual({
			url: '/elections/ca',
			matchedLevel: 'state',
		});
	});

	test('returns unresolved with no params at all', () => {
		expect(resolvePlaceUrl({}, emptyData)).toEqual({ error: 'unresolved' });
	});

	test('returns unresolved for unmatchable text with no state', () => {
		expect(resolvePlaceUrl({ city: 'Nowhereville' }, emptyData)).toEqual({ error: 'unresolved' });
	});
});

describe('resolvePlace', () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		// Fail-soft path: unset the static token so election-api reads go out
		// unauthenticated (these tests don't assert on auth headers).
		delete process.env['ELECTION_API_M2M_TOKEN'];
		__resetElectionApiAuthForTests({ warnedMissingToken: true });
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		__resetElectionApiAuthForTests();
	});

	test('a normally-mapped state resolves the city without walking any county', async () => {
		const urls = withFetchMock([
			{
				match: url => url.includes('/v1/places?') && url.includes('state=NC') && url.includes('mtfcc=G4020'),
				body: [{ slug: 'nc/guilford-county', name: 'Guilford County', mtfcc: 'G4020', state: 'NC' }],
			},
			{
				match: url => url.includes('/v1/places?') && url.includes('state=NC') && url.includes('mtfcc=G4110'),
				body: [{ slug: 'nc/greensboro', name: 'Greensboro', mtfcc: 'G4110', state: 'NC', countyName: 'Guilford' }],
			},
			{
				match: url => url.includes('/v1/places?') && url.includes('state=NC') && url.includes('mtfcc=G4040'),
				body: [],
			},
		]);

		await expect(resolvePlace({ city: 'Greensboro', state: 'NC' })).resolves.toEqual({
			url: '/elections/nc/guilford-county/greensboro',
			matchedLevel: 'city',
		});
		expect(urls.some(u => u.includes('includeChildren=true'))).toBe(false);
	});

	// Regression for the discredited empty-sweep gate (see sitemap-entries.ts
	// commit "fix(sitemap): gate the county walk on mapping, not on an empty
	// sweep"): the sweep here returns a row, but it maps to no county place, so
	// citySlugToCountySlug is empty even though the sweep is not.
	test('walks the counties when the sweep is non-empty but maps to no county', async () => {
		const urls = withFetchMock([
			{
				match: url => url.includes('/v1/places?') && url.includes('state=CT') && url.includes('mtfcc=G4020'),
				body: [{ slug: 'ct/hartford-county', name: 'Hartford County', mtfcc: 'G4020', state: 'CT' }],
			},
			{
				match: url => url.includes('/v1/places?') && url.includes('state=CT') && url.includes('mtfcc=G4110'),
				// A row the state sweep returns but that maps to no real county place.
				body: [{ slug: 'ct/somewhere', name: 'Somewhere', mtfcc: 'G4110', state: 'CT', countyName: 'Capitol Planning Region' }],
			},
			{
				match: url => url.includes('/v1/places?') && url.includes('state=CT') && url.includes('mtfcc=G4040'),
				body: [],
			},
			{
				match: url => url.includes('/v1/places?') && url.includes('slug=ct%2Fhartford-county') && url.includes('includeChildren=true'),
				body: [
					{
						slug: 'ct/hartford-county',
						name: 'Hartford County',
						mtfcc: 'G4020',
						children: [{ slug: 'ct/hartford-county/hartford', name: 'Hartford', mtfcc: 'G4110' }],
					},
				],
			},
		]);

		await expect(resolvePlace({ city: 'Hartford', state: 'CT' })).resolves.toEqual({
			url: '/elections/ct/hartford-county/hartford',
			matchedLevel: 'city',
		});
		expect(urls.some(u => u.includes('slug=ct%2Fhartford-county') && u.includes('includeChildren=true'))).toBe(true);
	});

	test('walks the counties when the sweep is completely empty', async () => {
		withFetchMock([
			{
				match: url => url.includes('/v1/places?') && url.includes('state=CT') && url.includes('mtfcc=G4020'),
				body: [{ slug: 'ct/fairfield-county', name: 'Fairfield County', mtfcc: 'G4020', state: 'CT' }],
			},
			{
				match: url =>
					url.includes('/v1/places?') && url.includes('state=CT') && (url.includes('mtfcc=G4110') || url.includes('mtfcc=G4040')),
				body: [],
			},
			{
				match: url => url.includes('/v1/places?') && url.includes('slug=ct%2Ffairfield-county') && url.includes('includeChildren=true'),
				body: [
					{
						slug: 'ct/fairfield-county',
						name: 'Fairfield County',
						mtfcc: 'G4020',
						children: [{ slug: 'ct/fairfield-county/bridgeport', name: 'Bridgeport', mtfcc: 'G4110' }],
					},
				],
			},
		]);

		await expect(resolvePlace({ city: 'Bridgeport', state: 'CT' })).resolves.toEqual({
			url: '/elections/ct/fairfield-county/bridgeport',
			matchedLevel: 'city',
		});
	});

	test('resolves unresolved with no state, without fetching anything', async () => {
		const urls = withFetchMock([]);
		await expect(resolvePlace({ city: 'Anywhere' })).resolves.toEqual({ error: 'unresolved' });
		expect(urls).toHaveLength(0);
	});
});

describe('normalizeName (electionsApi.ts, imported not duplicated)', () => {
	test('strips punctuation and apostrophes', () => {
		expect(normalizeName("St. Mary's")).toBe('stmarys');
	});

	test('strips hyphens', () => {
		expect(normalizeName('Yukon-Koyukuk')).toBe('yukonkoyukuk');
	});
});
