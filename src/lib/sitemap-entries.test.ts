import { afterAll, describe, expect, test } from 'bun:test';
import {
	buildCountyLookups,
	buildRaceEntries,
	buildRaceRouteParams,
	chunkArray,
	clearPeopleSitemapCache,
	fetchPeopleSitemapEntries,
	getSitemapIds,
	normalizeName,
	peopleShardForSlug,
	PEOPLE_SITEMAP_BAND_START,
	PEOPLE_SITEMAP_SHARDS,
	stripCountySuffix,
	US_STATE_CODES,
	type CountyPlace,
	type CityPlace,
	type RaceEntry,
} from './sitemap-entries';

describe('people sitemap shards', () => {
	test('maps slugs to a–z shards by first character', () => {
		expect(peopleShardForSlug('jane-doe')).toBe('j');
		expect(peopleShardForSlug('Abe-Lincoln')).toBe('a');
	});

	test('non-letter leading characters fall into the "other" shard', () => {
		expect(peopleShardForSlug('123-numeric')).toBe('other');
		expect(peopleShardForSlug('-leading-hyphen')).toBe('other');
		expect(peopleShardForSlug('')).toBe('other');
	});

	test('there are 27 shards (a–z + other) starting after the candidate band', () => {
		expect(PEOPLE_SITEMAP_SHARDS).toHaveLength(27);
		expect(PEOPLE_SITEMAP_SHARDS[26]).toBe('other');
		expect(PEOPLE_SITEMAP_BAND_START).toBe(1 + 2 * US_STATE_CODES.length);
	});

	test('getSitemapIds includes main + 2 state bands + the people band, contiguously', () => {
		const ids = getSitemapIds().map((i) => i.id);
		const expectedLength = 1 + 2 * US_STATE_CODES.length + PEOPLE_SITEMAP_SHARDS.length;
		expect(ids).toHaveLength(expectedLength);
		// The set is a contiguous 0..last with no gaps or dupes (ids are emitted
		// interleaved by band, so compare the sorted set).
		expect([...ids].sort((a, b) => a - b)).toEqual([...Array(expectedLength).keys()]);
	});
});

describe('fetchPeopleSitemapEntries cache', () => {
	const originalFetch = globalThis.fetch;
	const aliceId = 'aaaaaaaa-1111-2222-3333-444444444444';
	const bobId = 'bbbbbbbb-1111-2222-3333-444444444444';
	const base = 'https://goodparty.org';

	afterAll(() => {
		globalThis.fetch = originalFetch;
		clearPeopleSitemapCache();
	});

	test('empty upstream is not poisoned; concurrent shards then share one warm fetch', async () => {
		const urls: string[] = [];
		let serveEmpty = true;
		globalThis.fetch = (async (input: RequestInfo | URL) => {
			const url = String(input);
			urls.push(url);
			if (url.includes('public-person-profiles/published')) {
				const body = serveEmpty
					? []
					: [
							{ personId: aliceId, updatedAt: '2026-01-15T00:00:00.000Z' },
							{ personId: bobId, updatedAt: '2026-02-01T00:00:00.000Z' },
						];
				return new Response(JSON.stringify(body), {
					status: 200,
					headers: { 'content-type': 'application/json' },
				});
			}
			if (url.includes('/v1/persons')) {
				return new Response(
					JSON.stringify([
						{ id: aliceId, slug: 'alice-smith' },
						{ id: bobId, slug: 'bob-jones' },
					]),
					{ status: 200, headers: { 'content-type': 'application/json' } },
				);
			}
			return new Response(JSON.stringify([]), { status: 200 });
		}) as typeof fetch;

		const empty = await fetchPeopleSitemapEntries(base, 'a');
		expect(empty).toEqual([]);
		expect(urls.filter((u) => u.includes('public-person-profiles/published'))).toHaveLength(1);
		expect(urls.filter((u) => u.includes('/v1/persons'))).toHaveLength(0);

		serveEmpty = false;
		urls.length = 0;

		const [aShard, bShard] = await Promise.all([
			fetchPeopleSitemapEntries(base, 'a'),
			fetchPeopleSitemapEntries(base, 'b'),
		]);

		expect(urls.filter((u) => u.includes('public-person-profiles/published'))).toHaveLength(1);
		expect(urls.filter((u) => u.includes('/v1/persons'))).toHaveLength(1);
		expect(aShard.map((e) => e.url)).toEqual([`${base}/people/alice-smith-aaaaaaaa`]);
		expect(bShard.map((e) => e.url)).toEqual([`${base}/people/bob-jones-bbbbbbbb`]);
	});
});

describe('chunkArray', () => {
	test('returns a single chunk when input is smaller than the size', () => {
		expect(chunkArray([1, 2, 3], 500)).toEqual([[1, 2, 3]]);
	});

	test('returns an empty array for empty input', () => {
		expect(chunkArray([], 500)).toEqual([]);
	});

	test('splits into batches of at most `size` (people sitemap 500-id cap)', () => {
		const ids = Array.from({ length: 1201 }, (_, i) => i);
		const batches = chunkArray(ids, 500);
		expect(batches.map((b) => b.length)).toEqual([500, 500, 201]);
		// No id is dropped and order is preserved.
		expect(batches.flat()).toEqual(ids);
	});

	test('handles an exact multiple of the size', () => {
		const ids = Array.from({ length: 1000 }, (_, i) => i);
		expect(chunkArray(ids, 500).map((b) => b.length)).toEqual([500, 500]);
	});

	test('throws when size is not positive', () => {
		expect(() => chunkArray([1], 0)).toThrow();
	});
});

describe('normalizeName', () => {
	test('lowercases and strips whitespace', () => {
		expect(normalizeName('Maricopa County')).toBe('maricopacounty');
	});

	test('strips periods, apostrophes, and hyphens', () => {
		expect(normalizeName("St. Mary's")).toBe('stmarys');
		expect(normalizeName('Yukon-Koyukuk')).toBe('yukonkoyukuk');
	});

	test('returns empty string for empty input', () => {
		expect(normalizeName('')).toBe('');
	});
});

describe('stripCountySuffix (sitemap-entries)', () => {
	test.each([
		['Maricopa County', 'Maricopa'],
		['Jefferson Parish', 'Jefferson'],
		['Fairbanks North Star Borough', 'Fairbanks North Star'],
		['Yukon-Koyukuk Census Area', 'Yukon-Koyukuk'],
		['Juneau City and Borough', 'Juneau'],
		['San Francisco City and County', 'San Francisco'],
	])('strips suffix from "%s"', (input, expected) => {
		expect(stripCountySuffix(input)).toBe(expected);
	});

	test('returns name unchanged when no suffix', () => {
		expect(stripCountySuffix('Buckeye')).toBe('Buckeye');
	});
});

describe('buildCountyLookups', () => {
	function countyPlace(slug: string, name: string): CountyPlace {
		return { slug, name, mtfcc: 'G4020' };
	}

	function cityPlace(slug: string, countyName: string): CityPlace {
		return { slug, countyName };
	}

	test('maps city to county when countyName includes "County" suffix', () => {
		const places = [countyPlace('az/maricopa-county', 'Maricopa County')];
		const cities = [cityPlace('az/buckeye', 'Maricopa County')];

		const { citySlugToCountySlug } = buildCountyLookups(places, cities);

		expect(citySlugToCountySlug.get('az/buckeye')).toBe('az/maricopa-county');
	});

	test('maps city to county when countyName omits suffix', () => {
		const places = [countyPlace('az/maricopa-county', 'Maricopa County')];
		const cities = [cityPlace('az/buckeye', 'Maricopa')];

		const { citySlugToCountySlug } = buildCountyLookups(places, cities);

		expect(citySlugToCountySlug.get('az/buckeye')).toBe('az/maricopa-county');
	});

	test('maps city to county with Parish suffix', () => {
		const places = [countyPlace('la/jefferson-parish', 'Jefferson Parish')];
		const cities = [cityPlace('la/kenner', 'Jefferson Parish')];

		const { citySlugToCountySlug } = buildCountyLookups(places, cities);

		expect(citySlugToCountySlug.get('la/kenner')).toBe('la/jefferson-parish');
	});

	test('maps city to county with Borough suffix', () => {
		const places = [countyPlace('ak/fairbanks-north-star-borough', 'Fairbanks North Star Borough')];
		const cities = [cityPlace('ak/fairbanks', 'Fairbanks North Star Borough')];

		const { citySlugToCountySlug } = buildCountyLookups(places, cities);

		expect(citySlugToCountySlug.get('ak/fairbanks')).toBe('ak/fairbanks-north-star-borough');
	});

	test('maps city to county with Census Area suffix', () => {
		const places = [countyPlace('ak/yukon-koyukuk-census-area', 'Yukon-Koyukuk Census Area')];
		const cities = [cityPlace('ak/galena', 'Yukon-Koyukuk Census Area')];

		const { citySlugToCountySlug } = buildCountyLookups(places, cities);

		expect(citySlugToCountySlug.get('ak/galena')).toBe('ak/yukon-koyukuk-census-area');
	});

	test('maps city to county with City and Borough suffix', () => {
		const places = [countyPlace('ak/juneau-city-and-borough', 'Juneau City and Borough')];
		const cities = [cityPlace('ak/downtown-juneau', 'Juneau City and Borough')];

		const { citySlugToCountySlug } = buildCountyLookups(places, cities);

		expect(citySlugToCountySlug.get('ak/downtown-juneau')).toBe('ak/juneau-city-and-borough');
	});

	test('maps multiple cities to the same county', () => {
		const places = [countyPlace('az/maricopa-county', 'Maricopa County')];
		const cities = [
			cityPlace('az/buckeye', 'Maricopa County'),
			cityPlace('az/phoenix', 'Maricopa County'),
			cityPlace('az/tempe', 'Maricopa County'),
		];

		const { citySlugToCountySlug } = buildCountyLookups(places, cities);

		expect(citySlugToCountySlug.get('az/buckeye')).toBe('az/maricopa-county');
		expect(citySlugToCountySlug.get('az/phoenix')).toBe('az/maricopa-county');
		expect(citySlugToCountySlug.get('az/tempe')).toBe('az/maricopa-county');
	});

	test('maps cities across multiple counties', () => {
		const places = [
			countyPlace('az/maricopa-county', 'Maricopa County'),
			countyPlace('az/pima-county', 'Pima County'),
		];
		const cities = [
			cityPlace('az/buckeye', 'Maricopa County'),
			cityPlace('az/tucson', 'Pima County'),
		];

		const { citySlugToCountySlug } = buildCountyLookups(places, cities);

		expect(citySlugToCountySlug.get('az/buckeye')).toBe('az/maricopa-county');
		expect(citySlugToCountySlug.get('az/tucson')).toBe('az/pima-county');
	});

	test('skips city when countyName does not match any county place', () => {
		const places = [countyPlace('az/maricopa-county', 'Maricopa County')];
		const cities = [cityPlace('az/buckeye', 'Nonexistent County')];

		const { citySlugToCountySlug } = buildCountyLookups(places, cities);

		expect(citySlugToCountySlug.has('az/buckeye')).toBe(false);
	});

	test('skips places without G4020 mtfcc', () => {
		const places: CountyPlace[] = [
			{ slug: 'az/phoenix', name: 'Phoenix', mtfcc: 'G4110' },
		];
		const cities = [cityPlace('az/tempe', 'Phoenix')];

		const { countyNameToSlug, citySlugToCountySlug } = buildCountyLookups(places, cities);

		expect(countyNameToSlug.size).toBe(0);
		expect(citySlugToCountySlug.size).toBe(0);
	});

	test('skips entries with missing slug or name', () => {
		const places: CountyPlace[] = [
			{ slug: undefined, name: 'Maricopa County', mtfcc: 'G4020' },
			{ slug: 'az/pima-county', name: undefined, mtfcc: 'G4020' },
		];
		const cities: CityPlace[] = [
			{ slug: undefined, countyName: 'Maricopa County' },
			{ slug: 'az/tucson', countyName: undefined },
		];

		const { countyNameToSlug, citySlugToCountySlug } = buildCountyLookups(places, cities);

		expect(countyNameToSlug.size).toBe(0);
		expect(citySlugToCountySlug.size).toBe(0);
	});

	test('handles empty arrays', () => {
		const { countyNameToSlug, citySlugToCountySlug } = buildCountyLookups([], []);

		expect(countyNameToSlug.size).toBe(0);
		expect(citySlugToCountySlug.size).toBe(0);
	});

	test('countyNameToSlug keys are normalized (lowercase, no punctuation)', () => {
		const places = [
			countyPlace('ak/yukon-koyukuk-census-area', 'Yukon-Koyukuk Census Area'),
			countyPlace('la/st-marys-parish', "St. Mary's Parish"),
		];

		const { countyNameToSlug } = buildCountyLookups(places, []);

		expect(countyNameToSlug.has('yukonkoyukuk')).toBe(true);
		expect(countyNameToSlug.has('stmarys')).toBe(true);
	});
});

describe('buildRaceEntries', () => {
	const BASE = 'https://goodparty.org';

	const citySlugToCountySlug = new Map([
		['az/buckeye', 'az/maricopa-county'],
		['az/phoenix', 'az/maricopa-county'],
		['la/kenner', 'la/jefferson-parish'],
	]);

	function urls(races: RaceEntry[]): string[] {
		return buildRaceEntries(races, citySlugToCountySlug, BASE).map(e => e.url);
	}

	test('CITY race emits 4-level URL with county expansion', () => {
		const result = urls([{ slug: 'az/buckeye/city-legislature', positionLevel: 'CITY' }]);
		expect(result).toEqual([
			`${BASE}/elections/az/maricopa-county/buckeye/position/city-legislature`,
		]);
	});

	test('LOCAL race with city slug emits 4-level URL (same as CITY)', () => {
		const result = urls([{ slug: 'az/buckeye/library-board-member', positionLevel: 'LOCAL' }]);
		expect(result).toEqual([
			`${BASE}/elections/az/maricopa-county/buckeye/position/library-board-member`,
		]);
	});

	test('LOCAL race with county slug emits 3-level URL (no expansion)', () => {
		const result = urls([{ slug: 'az/maricopa-county/school-board', positionLevel: 'LOCAL' }]);
		expect(result).toEqual([
			`${BASE}/elections/az/maricopa-county/position/school-board`,
		]);
	});

	test('COUNTY race emits 3-level URL', () => {
		const result = urls([{ slug: 'az/maricopa-county/county-sheriff', positionLevel: 'COUNTY' }]);
		expect(result).toEqual([
			`${BASE}/elections/az/maricopa-county/position/county-sheriff`,
		]);
	});

	test('STATE race emits 2-level URL', () => {
		const result = urls([{ slug: 'az/governor', positionLevel: 'STATE' }]);
		expect(result).toEqual([
			`${BASE}/elections/az/position/governor`,
		]);
	});

	test('FEDERAL race emits 2-level URL', () => {
		const result = urls([{ slug: 'az/us-senate', positionLevel: 'FEDERAL' }]);
		expect(result).toEqual([
			`${BASE}/elections/az/position/us-senate`,
		]);
	});

	test('CITY race with 3-part slug and no county mapping is skipped', () => {
		const result = urls([{ slug: 'az/unknown-city/clerk', positionLevel: 'CITY' }]);
		expect(result).toEqual([]);
	});

	test('CITY race with 4-part slug and no county mapping falls through to 4-level URL', () => {
		// e.g. city places whose slug includes the county (WI-style) won't be in the map,
		// but the URL can be emitted directly from the prefix.
		const result = urls([{ slug: 'wi/adams-county/adams-town/city-clerk', positionLevel: 'CITY' }]);
		expect(result).toEqual([
			`${BASE}/elections/wi/adams-county/adams-town/position/city-clerk`,
		]);
	});

	test('LOCAL race with 3-part slug and no county mapping falls through to 3-level URL', () => {
		const result = urls([{ slug: 'az/unknown-place/board', positionLevel: 'LOCAL' }]);
		expect(result).toEqual([
			`${BASE}/elections/az/unknown-place/position/board`,
		]);
	});

	test('LOCAL race with 4-part slug (e.g. WI township) falls through to 4-level URL', () => {
		// WI township races have slugs like state/county/town/position because the town
		// place slug includes the county. The county is already in the prefix.
		const result = urls([{ slug: 'wi/adams-county/adams-town/township-board-head', positionLevel: 'LOCAL' }]);
		expect(result).toEqual([
			`${BASE}/elections/wi/adams-county/adams-town/position/township-board-head`,
		]);
	});

	test('race with no positionLevel falls through to generic branch', () => {
		const result = urls([{ slug: 'az/maricopa-county/assessor' }]);
		expect(result).toEqual([
			`${BASE}/elections/az/maricopa-county/position/assessor`,
		]);
	});

	test('skips races with no slug', () => {
		const result = urls([{ slug: undefined, positionLevel: 'STATE' }]);
		expect(result).toEqual([]);
	});

	test('skips races with empty slug', () => {
		const result = urls([{ slug: '', positionLevel: 'STATE' }]);
		expect(result).toEqual([]);
	});

	test('handles mixed race levels in a single batch', () => {
		const result = urls([
			{ slug: 'az/governor', positionLevel: 'STATE' },
			{ slug: 'az/maricopa-county/county-sheriff', positionLevel: 'COUNTY' },
			{ slug: 'az/buckeye/city-legislature', positionLevel: 'CITY' },
			{ slug: 'az/buckeye/library-board-member', positionLevel: 'LOCAL' },
			{ slug: 'az/maricopa-county/school-board', positionLevel: 'LOCAL' },
		]);
		expect(result).toEqual([
			`${BASE}/elections/az/position/governor`,
			`${BASE}/elections/az/maricopa-county/position/county-sheriff`,
			`${BASE}/elections/az/maricopa-county/buckeye/position/city-legislature`,
			`${BASE}/elections/az/maricopa-county/buckeye/position/library-board-member`,
			`${BASE}/elections/az/maricopa-county/position/school-board`,
		]);
	});

	test('case-insensitive positionLevel matching', () => {
		const result = urls([{ slug: 'az/buckeye/clerk', positionLevel: 'city' }]);
		expect(result).toEqual([
			`${BASE}/elections/az/maricopa-county/buckeye/position/clerk`,
		]);
	});

	test('OK joint city office emits 5-level subplace URL', () => {
		const okMap = new Map([['ok/binger', 'ok/caddo-county']]);
		const result = buildRaceEntries(
			[{ slug: 'ok/binger/city-clerk/treasurer-joint', positionLevel: 'CITY' }],
			okMap,
			BASE,
		).map(e => e.url);
		expect(result).toEqual([
			`${BASE}/elections/ok/caddo-county/binger/city-clerk/position/treasurer-joint`,
		]);
	});

	test('emits 4-level URL for nested LOCAL school district race', () => {
		const result = urls([
			{ slug: 'ok/choctaw/nicoma-park-schools/local-school-board', positionLevel: 'LOCAL' },
		]);
		expect(result).toEqual([
			`${BASE}/elections/ok/choctaw/nicoma-park-schools/position/local-school-board`,
		]);
	});

	test('emits 4-level URL for AK nested school district race', () => {
		const result = urls([
			{ slug: 'ak/delta/greely-school-district/local-school-board', positionLevel: 'LOCAL' },
		]);
		expect(result).toEqual([
			`${BASE}/elections/ak/delta/greely-school-district/position/local-school-board`,
		]);
	});

	test('skips PA compound county office slug', () => {
		const result = urls([
			{
				slug: 'pa/sullivan-county/county-prothonotary/register-of-wills/recorder-of-deeds/clerk-of-orphans-court/court-clerk-joint',
				positionLevel: 'COUNTY',
			},
		]);
		expect(result).toEqual([]);
	});
});

describe('buildRaceRouteParams', () => {
	const citySlugToCountySlug = new Map([
		['az/buckeye', 'az/maricopa-county'],
		['az/phoenix', 'az/maricopa-county'],
		['la/kenner', 'la/jefferson-parish'],
	]);

	function params(races: RaceEntry[]) {
		return buildRaceRouteParams(races, citySlugToCountySlug);
	}

	test('CITY race maps to cityPositionParams with county expansion', () => {
		const { cityPositionParams, statePositionParams, countyPositionParams } = params([
			{ slug: 'az/buckeye/city-legislature', positionLevel: 'CITY' },
		]);
		expect(cityPositionParams).toEqual([
			{ state: 'az', county: 'maricopa-county', city: 'buckeye', positionSlug: 'city-legislature' },
		]);
		expect(statePositionParams).toEqual([]);
		expect(countyPositionParams).toEqual([]);
	});

	test('STATE race maps to statePositionParams', () => {
		const { statePositionParams } = params([{ slug: 'az/governor', positionLevel: 'STATE' }]);
		expect(statePositionParams).toEqual([{ state: 'az', positionSlug: 'governor' }]);
	});

	test('COUNTY race maps to countyPositionParams', () => {
		const { countyPositionParams } = params([
			{ slug: 'az/maricopa-county/county-sheriff', positionLevel: 'COUNTY' },
		]);
		expect(countyPositionParams).toEqual([
			{ state: 'az', county: 'maricopa-county', positionSlug: 'county-sheriff' },
		]);
	});

	test('4-part CITY slug maps to cityPositionParams via generic branch', () => {
		const { cityPositionParams } = params([
			{ slug: 'wi/adams-county/adams-town/city-clerk', positionLevel: 'CITY' },
		]);
		expect(cityPositionParams).toEqual([
			{
				state: 'wi',
				county: 'adams-county',
				city: 'adams-town',
				positionSlug: 'city-clerk',
			},
		]);
	});

	test('5-part slug maps to subplacePositionParams via generic branch', () => {
		const { subplacePositionParams, cityPositionParams } = params([
			{
				slug: 'wi/adams-county/quincy-town/township-clerk/treasurer-joint',
				positionLevel: 'LOCAL',
			},
		]);
		expect(subplacePositionParams).toEqual([
			{
				state: 'wi',
				county: 'adams-county',
				city: 'quincy-town',
				subplace: 'township-clerk',
				positionSlug: 'treasurer-joint',
			},
		]);
		expect(cityPositionParams).toEqual([]);
	});

	test('OK joint city office maps to subplacePositionParams with county expansion', () => {
		const okMap = new Map([['ok/binger', 'ok/caddo-county']]);
		const { subplacePositionParams, cityPositionParams } = buildRaceRouteParams(
			[{ slug: 'ok/binger/city-clerk/treasurer-joint', positionLevel: 'CITY' }],
			okMap,
		);
		expect(subplacePositionParams).toEqual([
			{
				state: 'ok',
				county: 'caddo-county',
				city: 'binger',
				subplace: 'city-clerk',
				positionSlug: 'treasurer-joint',
			},
		]);
		expect(cityPositionParams).toEqual([]);
	});
});
