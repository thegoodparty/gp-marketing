import { afterAll, afterEach, describe, expect, test } from 'bun:test';
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

	// The candidate band used to sit between the state elections and the people
	// band. Retiring it moved the people band down by one state-band's width; if
	// this drifts from src/app/sitemap.ts's arithmetic the shards silently serve
	// each other's content.
	test('there are 27 shards (a–z + other) starting straight after the state band', () => {
		expect(PEOPLE_SITEMAP_SHARDS).toHaveLength(27);
		expect(PEOPLE_SITEMAP_SHARDS[26]).toBe('other');
		expect(PEOPLE_SITEMAP_BAND_START).toBe(1 + US_STATE_CODES.length);
	});

	test('getSitemapIds includes main + the state band + the people band, contiguously', () => {
		const ids = getSitemapIds().map((i) => i.id);
		const expectedLength = 1 + US_STATE_CODES.length + PEOPLE_SITEMAP_SHARDS.length;
		expect(ids).toHaveLength(expectedLength);
		// The set is a contiguous 0..last with no gaps or dupes.
		expect([...ids].sort((a, b) => a - b)).toEqual([...Array(expectedLength).keys()]);
	});
});

describe('fetchPeopleSitemapEntries', () => {
	const originalFetch = globalThis.fetch;
	const base = 'https://goodparty.org';
	const aliceId = 'aaaaaaaa-1111-2222-3333-444444444444';
	const bobId = 'bbbbbbbb-1111-2222-3333-444444444444';
	const carolId = 'cccccccc-1111-2222-3333-444444444444';

	type MockPerson = { id: string; slug: string; state: string | null };

	/**
	 * A row on the candidacy / officeholder feeds. The bare-string form is a row
	 * that names an office, which is the ordinary case; the object form exists to
	 * model the rows that carry a personId and nothing else — the shape behind
	 * the flagged near-duplicate pages.
	 */
	type MockLink = string | { personId: string; positionName?: string | null; officeTitle?: string | null };

	function linkRow(link: MockLink): {
		personId: string;
		positionName: string | null;
		officeTitle: string | null;
	} {
		if (typeof link === 'string') {
			return { personId: link, positionName: 'Mayor', officeTitle: null };
		}
		return {
			personId: link.personId,
			positionName: link.positionName ?? null,
			officeTitle: link.officeTitle ?? null,
		};
	}

	/**
	 * Stands in for the four upstream feeds the band reads. `state: null` models
	 * the ~8% of the real table that no `?state=` sweep can reach, which is the
	 * whole reason the candidacy/officeholder union exists.
	 */
	function mockUpstream(opts: {
		persons: MockPerson[];
		candidacies?: Record<string, MockLink[]>;
		officeholders?: Record<string, MockLink[]>;
		published?: { personId: string; updatedAt?: string }[];
		unlisted?: { personId: string }[];
		unlistedStatus?: number;
		failPersonsForState?: string;
	}): string[] {
		const urls: string[] = [];
		globalThis.fetch = (async (input: RequestInfo | URL) => {
			const raw = String(input);
			urls.push(raw);
			const url = new URL(raw);
			const json = (body: unknown) =>
				new Response(JSON.stringify(body), {
					status: 200,
					headers: { 'content-type': 'application/json' },
				});

			if (url.pathname.endsWith('/public-person-profiles/published')) {
				return json(opts.published ?? []);
			}
			if (url.pathname.endsWith('/public-person-profiles/unlisted')) {
				if (opts.unlistedStatus) return new Response('nope', { status: opts.unlistedStatus });
				return json(opts.unlisted ?? []);
			}
			if (url.pathname.endsWith('/v1/persons')) {
				if (
					opts.failPersonsForState &&
					url.searchParams.get('state') === opts.failPersonsForState
				) {
					return new Response('boom', { status: 503 });
				}
				const ids = url.searchParams.get('ids');
				const matches = ids
					? ((): MockPerson[] => {
							const want = new Set(ids.split(','));
							return opts.persons.filter((p) => want.has(p.id));
						})()
					: opts.persons.filter((p) => p.state === url.searchParams.get('state'));
				return json(matches.map(({ id, slug }) => ({ id, slug })));
			}
			if (url.pathname.endsWith('/v1/candidacies')) {
				const state = url.searchParams.get('state') ?? '';
				return json((opts.candidacies?.[state] ?? []).map(linkRow));
			}
			if (url.pathname.endsWith('/v1/officeholders')) {
				const state = url.searchParams.get('state') ?? '';
				return json((opts.officeholders?.[state] ?? []).map(linkRow));
			}
			return json([]);
		}) as typeof fetch;
		return urls;
	}

	afterEach(() => {
		globalThis.fetch = originalFetch;
		clearPeopleSitemapCache();
	});

	afterAll(() => {
		globalThis.fetch = originalFetch;
		clearPeopleSitemapCache();
	});

	// The band's whole purpose after the /candidate retirement: an unclaimed
	// programmatic page is the destination now, so it has to be listed even
	// though gp-api knows nothing about it.
	test('lists people who have never been claimed', async () => {
		mockUpstream({
			persons: [{ id: aliceId, slug: 'alice-smith', state: 'WY' }],
			candidacies: { WY: [aliceId] },
		});

		const entries = await fetchPeopleSitemapEntries(base, 'a');

		expect(entries.map((e) => e.url)).toEqual([`${base}/people/alice-smith-aaaaaaaa`]);
	});

	test('recovers people no state sweep can see, via the candidacy and officeholder feeds', async () => {
		mockUpstream({
			persons: [
				{ id: aliceId, slug: 'alice-smith', state: 'WY' },
				{ id: bobId, slug: 'bob-jones', state: null },
				{ id: carolId, slug: 'carol-diaz', state: null },
			],
			candidacies: { WY: [aliceId, bobId] },
			officeholders: { MT: [carolId] },
		});

		const urls = await Promise.all([
			fetchPeopleSitemapEntries(base, 'a'),
			fetchPeopleSitemapEntries(base, 'b'),
			fetchPeopleSitemapEntries(base, 'c'),
		]);

		expect(urls.flat().map((e) => e.url)).toEqual([
			`${base}/people/alice-smith-aaaaaaaa`,
			`${base}/people/bob-jones-bbbbbbbb`,
			`${base}/people/carol-diaz-cccccccc`,
		]);
	});

	// election-api advertises a 500-id cap on `?ids=`, but the gateway 414s on the
	// ~19.5KB query string that many uuids produce, so the real ceiling is the
	// request line, not the documented count. Batching to the advertised cap
	// silently dropped every recovered person until this was measured against the
	// live API.
	test('keeps each ids lookup under the request-line limit', async () => {
		const many = Array.from(
			{ length: 400 },
			(_, i) => `${i.toString(16).padStart(8, '0')}-1111-2222-3333-444444444444`,
		);
		const urls = mockUpstream({
			persons: many.map((id) => ({ id, slug: `zed-${id.slice(0, 8)}`, state: null })),
			candidacies: { WY: many },
		});

		const entries = await fetchPeopleSitemapEntries(base, 'z');

		expect(entries).toHaveLength(many.length);
		const idCalls = urls.filter((u) => u.includes('ids='));
		expect(idCalls.length).toBeGreaterThan(1);
		for (const url of idCalls) expect(url.length).toBeLessThan(8000);
	});
	test('resolves the recovered ids through the batch filter, not one call each', async () => {
		const urls = mockUpstream({
			persons: [
				{ id: bobId, slug: 'bob-jones', state: null },
				{ id: carolId, slug: 'carol-diaz', state: null },
			],
			candidacies: { WY: [bobId, carolId] },
		});

		await fetchPeopleSitemapEntries(base, 'b');

		const idCalls = urls.filter((u) => u.includes('ids='));
		expect(idCalls).toHaveLength(1);
		expect(decodeURIComponent(idCalls[0]!)).toContain(`${bobId},${carolId}`);
	});

	// gp-api folds two cases into this feed: a privacy removal (page renders
	// noindex) and an owner-deleted profile (gp-api 410s, so the page 404s). The
	// band cares only that neither URL should reach a crawler, so it is one set.
	test('omits people gp-api reports as unlistable', async () => {
		mockUpstream({
			persons: [
				{ id: aliceId, slug: 'alice-smith', state: 'WY' },
				{ id: bobId, slug: 'bob-jones', state: 'WY' },
			],
			candidacies: { WY: [aliceId, bobId] },
			unlisted: [{ personId: bobId }],
		});

		const [aShard, bShard] = await Promise.all([
			fetchPeopleSitemapEntries(base, 'a'),
			fetchPeopleSitemapEntries(base, 'b'),
		]);

		expect(aShard.map((e) => e.url)).toEqual([`${base}/people/alice-smith-aaaaaaaa`]);
		expect(bShard).toEqual([]);
	});

	test('matches unlisted ids case-insensitively, since the id is a uuid from another service', async () => {
		mockUpstream({
			persons: [{ id: aliceId, slug: 'alice-smith', state: 'WY' }],
			candidacies: { WY: [aliceId] },
			unlisted: [{ personId: aliceId.toUpperCase() }],
		});

		expect(await fetchPeopleSitemapEntries(base, 'a')).toEqual([]);
	});

	test('a claimed page carries its publish date and outranks an unclaimed one', async () => {
		mockUpstream({
			persons: [
				{ id: aliceId, slug: 'alice-smith', state: 'WY' },
				{ id: bobId, slug: 'bob-jones', state: 'WY' },
			],
			candidacies: { WY: [bobId] },
			published: [{ personId: aliceId, updatedAt: '2026-01-15T00:00:00.000Z' }],
		});

		const [claimed] = await fetchPeopleSitemapEntries(base, 'a');
		const [unclaimed] = await fetchPeopleSitemapEntries(base, 'b');

		expect(claimed).toMatchObject({ priority: 0.7, lastModified: '2026-01-15' });
		expect(unclaimed).toMatchObject({ priority: 0.5 });
		// Not merely absent-ish: stamping today on a page nobody has touched would
		// tell crawlers the entire unclaimed corpus changes every rebuild.
		expect(unclaimed).not.toHaveProperty('lastModified');
	});

	test('concurrent shards share one sweep instead of each re-walking the table', async () => {
		const urls = mockUpstream({
			persons: [
				{ id: aliceId, slug: 'alice-smith', state: 'WY' },
				{ id: bobId, slug: 'bob-jones', state: 'WY' },
			],
		});

		await Promise.all([
			fetchPeopleSitemapEntries(base, 'a'),
			fetchPeopleSitemapEntries(base, 'b'),
		]);

		expect(urls.filter((u) => u.includes('public-person-profiles/published'))).toHaveLength(1);
		expect(urls.filter((u) => u.includes('state=WY') && u.includes('/v1/persons'))).toHaveLength(
			1,
		);
	});

	// The in-flight promise clears once it settles, so an upstream that was empty
	// (or failing) at build time must not pin the band empty for the process.
	test('an empty sweep is not cached for the life of the process', async () => {
		mockUpstream({ persons: [] });
		expect(await fetchPeopleSitemapEntries(base, 'a')).toEqual([]);

		clearPeopleSitemapCache();
		mockUpstream({
			persons: [{ id: aliceId, slug: 'alice-smith', state: 'WY' }],
			candidacies: { WY: [aliceId] },
		});

		expect((await fetchPeopleSitemapEntries(base, 'a')).map((e) => e.url)).toEqual([
			`${base}/people/alice-smith-aaaaaaaa`,
		]);
	});

	// Both of the following cover the same class of bug: an upstream that answers
	// "nothing" on failure is indistinguishable from one that answers "no rows",
	// and for these two inputs the wrong answer is silent and shipped.

	test('a failed state sweep rejects rather than publishing a partial corpus', async () => {
		mockUpstream({
			persons: [{ id: aliceId, slug: 'alice-smith', state: 'WY' }],
			failPersonsForState: 'CA',
		});

		await expect(fetchPeopleSitemapEntries(base, 'a')).rejects.toThrow();
	});

	// A rolling deploy where gp-api has not yet shipped the endpoint 404s here.
	// Failing open would advertise every person who asked to be delisted.
	test('an unavailable exclusion list rejects rather than listing everyone', async () => {
		mockUpstream({
			persons: [{ id: aliceId, slug: 'alice-smith', state: 'WY' }],
			unlistedStatus: 404,
		});

		await expect(fetchPeopleSitemapEntries(base, 'a')).rejects.toThrow();
	});

	// The band must not stay broken after a blip: the module slot has to clear on
	// the rejected load too, or the first failure pins every later shard.
	test('recovers on the next call after a failure', async () => {
		mockUpstream({
			persons: [{ id: aliceId, slug: 'alice-smith', state: 'WY' }],
			unlistedStatus: 503,
		});
		await expect(fetchPeopleSitemapEntries(base, 'a')).rejects.toThrow();

		mockUpstream({
			persons: [{ id: aliceId, slug: 'alice-smith', state: 'WY' }],
			candidacies: { WY: [aliceId] },
		});

		expect((await fetchPeopleSitemapEntries(base, 'a')).map((e) => e.url)).toEqual([
			`${base}/people/alice-smith-aaaaaaaa`,
		]);
	});

	// The GSC "Duplicate, Google chose different canonical than user" cohort: the
	// page renders noindex because it has nothing on it, so advertising it would
	// only swap that report for "Submitted URL marked noindex".
	test('omits a person whose civics feeds name no office', async () => {
		mockUpstream({
			persons: [
				{ id: aliceId, slug: 'alice-smith', state: 'WY' },
				{ id: bobId, slug: 'bob-jones', state: 'WY' },
			],
			candidacies: { WY: [aliceId, { personId: bobId, positionName: null }] },
		});

		const [aShard, bShard] = await Promise.all([
			fetchPeopleSitemapEntries(base, 'a'),
			fetchPeopleSitemapEntries(base, 'b'),
		]);

		expect(aShard.map((e) => e.url)).toEqual([`${base}/people/alice-smith-aaaaaaaa`]);
		expect(bShard).toEqual([]);
	});

	// A person reachable only by the state sweep has no candidacy or officeholder
	// row at all, so there is no office to render and nothing to index.
	test('omits a person who appears on no civics feed at all', async () => {
		mockUpstream({ persons: [{ id: aliceId, slug: 'alice-smith', state: 'WY' }] });

		expect(await fetchPeopleSitemapEntries(base, 'a')).toEqual([]);
	});

	test('an officeholder row that carries only officeTitle still counts as an office', async () => {
		mockUpstream({
			persons: [{ id: aliceId, slug: 'alice-smith', state: 'WY' }],
			officeholders: { WY: [{ personId: aliceId, officeTitle: 'City Council' }] },
		});

		expect((await fetchPeopleSitemapEntries(base, 'a')).map((e) => e.url)).toEqual([
			`${base}/people/alice-smith-aaaaaaaa`,
		]);
	});

	// Blank-but-present is the same absence as null. It is not a hypothetical:
	// the dbt mart wraps office_title in nullif(x, '') because "the S3 feed uses
	// '' (not null) for absent values", and leaves position_name alone. Both
	// sides of the decision route these through the same `hasText`, so the
	// renderer reads a blank the same way.
	for (const blank of ['', '   ']) {
		test(`treats a ${blank === '' ? 'empty' : 'whitespace-only'} position name as no office`, async () => {
			mockUpstream({
				persons: [{ id: aliceId, slug: 'alice-smith', state: 'WY' }],
				candidacies: { WY: [{ personId: aliceId, positionName: blank }] },
			});

			expect(await fetchPeopleSitemapEntries(base, 'a')).toEqual([]);
		});
	}

	/**
	 * Pins the two column projections, because a name election-api does not know
	 * is not a soft failure: its query schemas are `.strict()` and validate
	 * `columns` against an allow-list built from the Prisma scalar-field enum, so
	 * a typo is a 400, and `fetchElectionJsonOrThrow` turns that into a failed
	 * shard rather than a partial sitemap. Asserting the request here is what
	 * makes the projection reviewable against those schemas without a token.
	 */
	test('projects only the columns the thinness signal needs', async () => {
		const urls = mockUpstream({
			persons: [{ id: aliceId, slug: 'alice-smith', state: 'WY' }],
			candidacies: { WY: [aliceId] },
		});
		await fetchPeopleSitemapEntries(base, 'a');

		const columnsFor = (path: string): Set<string> =>
			new Set(
				urls
					.filter((u) => new URL(u).pathname.endsWith(path))
					.map((u) => new URL(u).searchParams.get('columns') ?? ''),
			);

		expect(columnsFor('/v1/candidacies')).toEqual(new Set(['personId,positionName']));
		expect(columnsFor('/v1/officeholders')).toEqual(
			new Set(['personId,positionName,officeTitle']),
		);
		expect(columnsFor('/v1/persons')).toEqual(new Set(['id,slug']));
	});

	// The one case where the sitemap must not apply the office test: an owner who
	// claimed and published gets an indexable page regardless of the spine, so
	// dropping it here would hide the only pages with authored content.
	test('keeps a claimed person who has no office on any feed', async () => {
		mockUpstream({
			persons: [{ id: aliceId, slug: 'alice-smith', state: 'WY' }],
			published: [{ personId: aliceId, updatedAt: '2026-01-15T00:00:00.000Z' }],
		});

		expect((await fetchPeopleSitemapEntries(base, 'a')).map((e) => e.url)).toEqual([
			`${base}/people/alice-smith-aaaaaaaa`,
		]);
	});

	/**
	 * The cohort behind that exemption is exactly the one no sweep can see.
	 *
	 * `Person.state` holds a spelled-out `Minnesota` for rows the ETL creates
	 * from a gp-api account rather than from BallotReady — 24,619 of them, and
	 * none with a candidacy or office term. So `?state=MN` misses them and the
	 * linked-feed union has nothing to recover them with. Unpublished that is
	 * correct; published it silently dropped the page, which is the one
	 * direction this band is not allowed to take. Four live profiles were in
	 * that state when this was written.
	 */
	test('lists a published person no state sweep and no civics feed can reach', async () => {
		mockUpstream({
			persons: [{ id: aliceId, slug: 'alice-smith', state: 'Minnesota' }],
			published: [{ personId: aliceId, updatedAt: '2026-01-15T00:00:00.000Z' }],
		});

		expect((await fetchPeopleSitemapEntries(base, 'a')).map((e) => e.url)).toEqual([
			`${base}/people/alice-smith-aaaaaaaa`,
		]);
	});

	test('resolves the seeded published ids through the batch filter, not one call each', async () => {
		const urls = mockUpstream({
			persons: [
				{ id: bobId, slug: 'bob-jones', state: 'Oklahoma' },
				{ id: carolId, slug: 'carol-diaz', state: 'Tennessee' },
			],
			published: [{ personId: bobId }, { personId: carolId }],
		});

		await fetchPeopleSitemapEntries(base, 'b');

		const idCalls = urls.filter((u) => u.includes('ids='));
		expect(idCalls).toHaveLength(1);
		expect(decodeURIComponent(idCalls[0]!)).toContain(`${bobId},${carolId}`);
	});

	test('does not re-request a published person the sweep already returned', async () => {
		const urls = mockUpstream({
			persons: [{ id: aliceId, slug: 'alice-smith', state: 'WY' }],
			published: [{ personId: aliceId }],
		});

		await fetchPeopleSitemapEntries(base, 'a');

		expect(urls.filter((u) => u.includes('ids='))).toEqual([]);
	});

	// Seeding cannot invent a page: gp-api can hold a profile for a personId the
	// spine has no row for, and without a slug there is no URL to advertise.
	test('ignores a published id the spine does not know', async () => {
		mockUpstream({
			persons: [],
			published: [{ personId: aliceId }],
		});

		expect(await fetchPeopleSitemapEntries(base, 'a')).toEqual([]);
	});

	// Seeding must not outrank the exclusion list: publish-then-request-removal
	// would otherwise advertise a page the owner asked us to take down.
	test('still omits a seeded person who is also unlisted', async () => {
		mockUpstream({
			persons: [{ id: aliceId, slug: 'alice-smith', state: 'Minnesota' }],
			published: [{ personId: aliceId }],
			unlisted: [{ personId: aliceId }],
		});

		expect(await fetchPeopleSitemapEntries(base, 'a')).toEqual([]);
	});

	test('skips a person with no slug, since there is no URL to point at', async () => {
		mockUpstream({
			persons: [{ id: aliceId, slug: '', state: 'WY' }],
		});

		expect(await fetchPeopleSitemapEntries(base, 'a')).toEqual([]);
	});
});

describe('chunkArray', () => {
	test('returns a single chunk when input is smaller than the size', () => {
		expect(chunkArray([1, 2, 3], 500)).toEqual([[1, 2, 3]]);
	});

	test('returns an empty array for empty input', () => {
		expect(chunkArray([], 500)).toEqual([]);
	});

	test('splits into batches of at most `size` (generic batching helper)', () => {
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
