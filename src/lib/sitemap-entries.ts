/**
 * Shared sitemap fetchers for dynamic route and CLI scripts.
 * Uses sanityClient directly (not sanityFetch) to avoid draftMode() in metadata context.
 */

import type { MetadataRoute } from 'next';
import { sanityClient } from '~/sanity/sanityClient';
import { looksLikeDistrictSlug } from '~/lib/electionsApi';
import {
	buildElectionPositionHrefFromRaceSlug,
	resolveElectionPositionFromRaceSlug,
	stripCountySuffix as stripCountySuffixFromHelpers,
} from '~/lib/electionsHelpers';
import { FAQ_BASE_PATH, getFaqSitemapEntries } from '~/lib/faqSlugs';
import { allFaqsQuery } from '~/sanity/groq';

/** 51 US state/DC codes (50 states + DC) */
export const US_STATE_CODES = [
	'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
] as const;

/** Single source of truth for sitemap IDs. Used by generateSitemaps() and sitemap-index route. */
/**
 * Alphabetical shards for the /people sitemaps (a–z + a catch-all "other" for
 * slugs that don't start with a letter). People are sharded by the first
 * character of their canonical slug so each people-*.xml stays crawlable and
 * bounded, instead of being lumped into shard 0 with the marketing pages.
 */
export const PEOPLE_SITEMAP_SHARDS = [
	...'abcdefghijklmnopqrstuvwxyz'.split(''),
	'other',
] as const;

/** Maps a person slug to its alphabetical sitemap shard key. */
export function peopleShardForSlug(slug: string): string {
	const first = slug.trim().charAt(0).toLowerCase();
	return first >= 'a' && first <= 'z' ? first : 'other';
}

/**
 * The first people shard id sits immediately after the state-election and
 * candidate bands (id 0 = main, 1..N = state elections, N+1..2N = candidates).
 */
export const PEOPLE_SITEMAP_BAND_START = 1 + 2 * US_STATE_CODES.length;

export function getSitemapIds(): { id: number }[] {
	const ids: { id: number }[] = [{ id: 0 }];
	for (let i = 0; i < US_STATE_CODES.length; i++) {
		ids.push({ id: i + 1 });
		ids.push({ id: i + 1 + US_STATE_CODES.length });
	}
	for (let i = 0; i < PEOPLE_SITEMAP_SHARDS.length; i++) {
		ids.push({ id: PEOPLE_SITEMAP_BAND_START + i });
	}
	return ids;
}

const ELECTION_API_BASE =
	process.env['NEXT_PUBLIC_ELECTION_API_BASE'] ?? process.env['ELECTIONS_API_BASE_URL'] ?? 'https://election-api.goodparty.org';

const GP_API_BASE =
	process.env['GP_API_BASE_URL'] ??
	process.env['NEXT_PUBLIC_API_BASE'] ??
	ELECTION_API_BASE.replace('election-api', 'gp-api');

const CACHE_1H: RequestInit = { next: { revalidate: 3600 } };

export type CountyPlace = { slug?: string; name?: string; mtfcc?: string };
export type CityPlace = { slug?: string; countyName?: string };
export type RaceEntry = { slug?: string; positionLevel?: string };

export function normalizeName(name: string): string {
	return name.replace(/[.\s''\-]/g, '').toLowerCase();
}

export function stripCountySuffix(name: string): string {
	return stripCountySuffixFromHelpers(name);
}

function dedupeByUrl(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
	const seen = new Set<string>();
	return entries.filter((e) => {
		if (seen.has(e.url)) return false;
		seen.add(e.url);
		return true;
	});
}

/** Splits an array into chunks of at most `size` (size must be > 0). */
export function chunkArray<T>(items: T[], size: number): T[][] {
	if (size <= 0) throw new Error('chunk size must be > 0');
	const chunks: T[][] = [];
	for (let i = 0; i < items.length; i += size) {
		chunks.push(items.slice(i, i + size));
	}
	return chunks;
}

function toEntry(
	baseUrl: string,
	path: string,
	priority: number,
	changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency'],
	lastModified?: string,
): MetadataRoute.Sitemap[0] {
	return {
		url: `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`,
		lastModified: lastModified ?? new Date().toISOString().slice(0, 10),
		changeFrequency,
		priority,
	};
}

export function buildCountyLookups(
	places: CountyPlace[],
	cities: CityPlace[],
): { countyNameToSlug: Map<string, string>; citySlugToCountySlug: Map<string, string> } {
	const countyNameToSlug = new Map<string, string>();
	for (const p of places) {
		if (p.slug && p.name && (p.mtfcc ?? '') === 'G4020') {
			const normalized = normalizeName(stripCountySuffix(p.name));
			countyNameToSlug.set(normalized, p.slug);
		}
	}

	const citySlugToCountySlug = new Map<string, string>();
	for (const c of cities) {
		if (c.slug && c.countyName) {
			const countySlug = countyNameToSlug.get(normalizeName(stripCountySuffix(c.countyName)));
			if (countySlug) citySlugToCountySlug.set(c.slug, countySlug);
		}
	}

	return { countyNameToSlug, citySlugToCountySlug };
}

/**
 * Builds election race sitemap entries.
 *
 * Slug formats from the election API:
 *   2-part  state/position                   → STATE / FEDERAL
 *   3-part  state/county/position            → COUNTY, or LOCAL at county level
 *   3-part  state/city/position              → CITY / LOCAL (city slug in map)
 *   4-part  state/county/city/position       → CITY / LOCAL races whose place slug
 *                                              includes the county (e.g. WI townships)
 *
 * CITY/LOCAL 3-part city slugs: look up county via citySlugToCountySlug to emit the
 * canonical 4-level URL /elections/state/county/city/position.
 * CITY/LOCAL 4-part slugs: the county is already embedded; fall through to the generic
 * branch which emits the URL directly from the prefix.
 * CITY 3-part slugs with no county mapping are skipped (would produce a wrong URL).
 */
export function buildRaceEntries(
	races: RaceEntry[],
	citySlugToCountySlug: Map<string, string>,
	baseUrl: string,
): MetadataRoute.Sitemap {
	const out: MetadataRoute.Sitemap = [];
	for (const r of races) {
		const path = buildElectionPositionHrefFromRaceSlug(r, {
			citySlugToCountySlug,
			skipUnmappedCity: true,
		});
		if (!path) continue;
		out.push(toEntry(baseUrl, path, 0.7, 'weekly'));
	}
	return out;
}

function dedupeByKey<T>(items: T[], keyFn: (t: T) => string): T[] {
	const seen = new Set<string>();
	const out: T[] = [];
	for (const item of items) {
		const k = keyFn(item);
		if (seen.has(k)) continue;
		seen.add(k);
		out.push(item);
	}
	return out;
}

export type ElectionCountyRouteParam = { state: string; county: string };
export type ElectionCityRouteParam = { state: string; county: string; city: string };
export type ElectionStatePositionRouteParam = { state: string; positionSlug: string };
export type ElectionCountyPositionRouteParam = { state: string; county: string; positionSlug: string };
export type ElectionCityPositionRouteParam = { state: string; county: string; city: string; positionSlug: string };
export type ElectionSubplacePositionRouteParam = {
	state: string;
	county: string;
	city: string;
	subplace: string;
	positionSlug: string;
};

/**
 * Same branching as buildRaceEntries; returns route params for static generation.
 */
export function buildRaceRouteParams(
	races: RaceEntry[],
	citySlugToCountySlug: Map<string, string>,
): {
	statePositionParams: ElectionStatePositionRouteParam[];
	countyPositionParams: ElectionCountyPositionRouteParam[];
	cityPositionParams: ElectionCityPositionRouteParam[];
	subplacePositionParams: ElectionSubplacePositionRouteParam[];
} {
	const statePositionParams: ElectionStatePositionRouteParam[] = [];
	const countyPositionParams: ElectionCountyPositionRouteParam[] = [];
	const cityPositionParams: ElectionCityPositionRouteParam[] = [];
	const subplacePositionParams: ElectionSubplacePositionRouteParam[] = [];

	for (const r of races) {
		if (!r.slug) continue;

		const resolved = resolveElectionPositionFromRaceSlug(r, {
			citySlugToCountySlug,
			skipUnmappedCity: true,
		});
		if (!resolved) continue;

		const { route } = resolved;
		switch (route.level) {
			case 'state':
				statePositionParams.push({ state: route.state, positionSlug: route.positionSlug });
				break;
			case 'county':
				countyPositionParams.push({
					state: route.state,
					county: route.county,
					positionSlug: route.positionSlug,
				});
				break;
			case 'city':
				cityPositionParams.push({
					state: route.state,
					county: route.county,
					city: route.city,
					positionSlug: route.positionSlug,
				});
				break;
			case 'subplace':
				subplacePositionParams.push({
					state: route.state,
					county: route.county,
					city: route.city,
					subplace: route.subplace,
					positionSlug: route.positionSlug,
				});
				break;
		}
	}

	return {
		statePositionParams: dedupeByKey(statePositionParams, (p) => `${p.state}|${p.positionSlug}`),
		countyPositionParams: dedupeByKey(
			countyPositionParams,
			(p) => `${p.state}|${p.county}|${p.positionSlug}`,
		),
		cityPositionParams: dedupeByKey(
			cityPositionParams,
			(p) => `${p.state}|${p.county}|${p.city}|${p.positionSlug}`,
		),
		subplacePositionParams: dedupeByKey(
			subplacePositionParams,
			(p) => `${p.state}|${p.county}|${p.city}|${p.subplace}|${p.positionSlug}`,
		),
	};
}

/**
 * Election route params for one state (aligned with fetchStateElectionSitemapEntries).
 */
export async function fetchStateElectionRouteParams(stateCode: string): Promise<{
	countyParams: ElectionCountyRouteParam[];
	cityParams: ElectionCityRouteParam[];
	statePositionParams: ElectionStatePositionRouteParam[];
	countyPositionParams: ElectionCountyPositionRouteParam[];
	cityPositionParams: ElectionCityPositionRouteParam[];
	subplacePositionParams: ElectionSubplacePositionRouteParam[];
}> {
	const code = stateCode.toUpperCase();

	const [places, cities, races] = await Promise.all([
		fetchElectionJson<{ slug?: string; mtfcc?: string; name?: string }>('v1/places', {
			state: code,
			placeColumns: 'slug,mtfcc,name',
		}),
		fetchElectionJson<{ slug?: string; countyName?: string }>('v1/places', {
			state: code,
			mtfcc: 'G4110',
			placeColumns: 'slug,countyName',
		}),
		fetchElectionJson<{ slug?: string; positionLevel?: string }>('v1/races', {
			state: code,
			raceColumns: 'slug,positionLevel',
		}),
	]);

	const { citySlugToCountySlug } = buildCountyLookups(places, cities);

	const countyParams: ElectionCountyRouteParam[] = [];
	const cityParams: ElectionCityRouteParam[] = [];
	for (const p of places) {
		if (!p.slug) continue;
		const mtfcc = p.mtfcc ?? '';
		const segs = p.slug.split('/').filter(Boolean);
		if (mtfcc === 'G4020' && segs.length >= 2) {
			countyParams.push({
				state: segs[0]!.toLowerCase(),
				county: segs.slice(1).join('/').toLowerCase(),
			});
		} else if (mtfcc.startsWith('G54')) {
			if (segs.length >= 3) {
				cityParams.push({
					state: segs[0]!.toLowerCase(),
					county: segs[1]!.toLowerCase(),
					city: segs.slice(2).join('/').toLowerCase(),
				});
			} else if (segs.length >= 2) {
				countyParams.push({
					state: segs[0]!.toLowerCase(),
					county: segs.slice(1).join('/').toLowerCase(),
				});
			}
		}
	}

	for (const c of cities) {
		const countySlug = citySlugToCountySlug.get(c.slug ?? '');
		if (!countySlug || !c.slug) continue;
		const citySegment = c.slug.split('/').pop();
		if (!citySegment || looksLikeDistrictSlug(citySegment)) continue;
		const segs = countySlug.split('/').filter(Boolean);
		if (segs.length >= 2) {
			cityParams.push({
				state: segs[0]!.toLowerCase(),
				county: segs.slice(1).join('/').toLowerCase(),
				city: citySegment.toLowerCase(),
			});
		}
	}

	const raceRoute = buildRaceRouteParams(races, citySlugToCountySlug);

	return {
		countyParams: dedupeByKey(countyParams, (x) => `${x.state}|${x.county}`),
		cityParams: dedupeByKey(cityParams, (x) => `${x.state}|${x.county}|${x.city}`),
		statePositionParams: raceRoute.statePositionParams,
		countyPositionParams: raceRoute.countyPositionParams,
		cityPositionParams: raceRoute.cityPositionParams,
		subplacePositionParams: raceRoute.subplacePositionParams,
	};
}

let cachedElectionRouteParams: Promise<{
	countyParams: ElectionCountyRouteParam[];
	cityParams: ElectionCityRouteParam[];
	statePositionParams: ElectionStatePositionRouteParam[];
	countyPositionParams: ElectionCountyPositionRouteParam[];
	cityPositionParams: ElectionCityPositionRouteParam[];
	subplacePositionParams: ElectionSubplacePositionRouteParam[];
}> | null = null;

/**
 * Merged election static params for all states (single fetch per build segment).
 */
export async function getCachedElectionRouteParams(): Promise<{
	countyParams: ElectionCountyRouteParam[];
	cityParams: ElectionCityRouteParam[];
	statePositionParams: ElectionStatePositionRouteParam[];
	countyPositionParams: ElectionCountyPositionRouteParam[];
	cityPositionParams: ElectionCityPositionRouteParam[];
	subplacePositionParams: ElectionSubplacePositionRouteParam[];
}> {
	if (!cachedElectionRouteParams) {
		cachedElectionRouteParams = (async () => {
			const results = await Promise.all(US_STATE_CODES.map((c) => fetchStateElectionRouteParams(c)));
			return {
				countyParams: dedupeByKey(results.flatMap((r) => r.countyParams), (x) => `${x.state}|${x.county}`),
				cityParams: dedupeByKey(
					results.flatMap((r) => r.cityParams),
					(x) => `${x.state}|${x.county}|${x.city}`,
				),
				statePositionParams: dedupeByKey(
					results.flatMap((r) => r.statePositionParams),
					(p) => `${p.state}|${p.positionSlug}`,
				),
				countyPositionParams: dedupeByKey(
					results.flatMap((r) => r.countyPositionParams),
					(p) => `${p.state}|${p.county}|${p.positionSlug}`,
				),
				cityPositionParams: dedupeByKey(
					results.flatMap((r) => r.cityPositionParams),
					(p) => `${p.state}|${p.county}|${p.city}|${p.positionSlug}`,
				),
				subplacePositionParams: dedupeByKey(
					results.flatMap((r) => r.subplacePositionParams),
					(p) => `${p.state}|${p.county}|${p.city}|${p.subplace}|${p.positionSlug}`,
				),
			};
		})();
	}
	return cachedElectionRouteParams;
}

async function fetchGpApiJson<T>(path: string): Promise<T[]> {
	const url = `${GP_API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
	try {
		const res = await fetch(url, CACHE_1H);
		if (!res.ok) {
			console.error(`[sitemap] gp-api ${res.status} ${url}`);
			return [];
		}
		const data: unknown = await res.json();
		return Array.isArray(data) ? (data as T[]) : [];
	} catch (err) {
		console.error('[sitemap] gp-api fetch failed', url, err instanceof Error ? err.message : String(err));
		return [];
	}
}

async function fetchElectionJson<T>(path: string, params: Record<string, string>): Promise<T[]> {
	const search = new URLSearchParams(params).toString();
	const url = `${ELECTION_API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}?${search}`;
	try {
		const res = await fetch(url, CACHE_1H);
		if (!res.ok) {
			console.error(`[sitemap] Election API ${res.status} ${url}`);
			return [];
		}
		const data: unknown = await res.json();
		if (Array.isArray(data)) return data as T[];
		if (data && typeof data === 'object' && 'data' in data) {
			const inner = (data as { data: unknown }).data;
			if (Array.isArray(inner)) return inner as T[];
		}
		return [];
	} catch (err) {
		console.error('[sitemap] Election API fetch failed', url, err instanceof Error ? err.message : String(err));
		return [];
	}
}

/**
 * Fetches main sitemap entries from Sanity (parallel) and returns MetadataRoute.Sitemap shape.
 * Tag-based revalidation: webhook revalidateTag(body._type) invalidates these fetches.
 */
export async function fetchMainSitemapEntries(baseUrl: string): Promise<MetadataRoute.Sitemap> {
	const entries: MetadataRoute.Sitemap = [];

	const [singletons, landingAndPolicySlugs, articles, categorySlugs, topicSlugs, glossaryTerms, faqs] =
		await Promise.all([
			sanityClient.fetch<{
				home: string | null;
				blog: string | null;
				contact: string | null;
				glossary: string | null;
			}>(
				`{
					"home": *[_type=="goodpartyOrg_home"][0]._id,
					"blog": *[_type=="goodpartyOrg_allArticles"][0]._id,
					"contact": *[_type=="goodpartyOrg_contact"][0]._id,
					"glossary": *[_type=="goodpartyOrg_glossary"][0]._id
				}`,
				{},
				{ next: { tags: ['goodpartyOrg_home', 'goodpartyOrg_allArticles', 'goodpartyOrg_contact', 'goodpartyOrg_glossary'] } },
			),
			sanityClient.fetch<Array<{ slug: string | null }>>(
				`*[_type in ["goodpartyOrg_landingPages","policy"]][]{"slug": select(_type == "goodpartyOrg_landingPages" => detailPageOverviewNoHero.field_slug, _type == "policy" => policyOverview.field_slug)}`,
				{},
				{ next: { tags: ['goodpartyOrg_landingPages', 'policy'] } },
			),
			sanityClient.fetch<Array<{ slug: string | null; updatedAt?: string }>>(
				`*[_type == "article"][]{"slug": editorialOverview.field_slug, "updatedAt": editorialOverview.field_lastUpdated}`,
				{},
				{ next: { tags: ['article'] } },
			),
			sanityClient.fetch<Array<string | null>>(
				`*[_type == "categories"][].tagOverview.field_slug`,
				{},
				{ next: { tags: ['categories'] } },
			),
			sanityClient.fetch<Array<string | null>>(
				`*[_type == "topics"][].tagOverview.field_slug`,
				{},
				{ next: { tags: ['topics'] } },
			),
			sanityClient.fetch<Array<{ title: string; slug: string | null }>>(
				`*[_type == "glossary"][]{"title": glossaryTermOverview.field_glossaryTerm, "slug": glossaryTermOverview.field_slug}`,
				{},
				{ next: { tags: ['glossary'] } },
			),
			sanityClient.fetch<Array<{ _id: string; _updatedAt?: string; faqOverview?: { field_question?: string } }>>(
				allFaqsQuery,
				{},
				{ perspective: 'published', next: { tags: ['faq'] } },
			),
		]);

	if (singletons.home) entries.push(toEntry(baseUrl, '/', 1.0, 'monthly'));
	if (singletons.blog) entries.push(toEntry(baseUrl, '/blog', 1.0, 'monthly'));
	if (singletons.contact) entries.push(toEntry(baseUrl, '/contact', 1.0, 'monthly'));
	if (singletons.glossary) entries.push(toEntry(baseUrl, '/political-terms', 1.0, 'monthly'));

	for (const { slug } of landingAndPolicySlugs) {
		if (slug) entries.push(toEntry(baseUrl, `/${slug}`, 1.0, 'monthly'));
	}

	for (const a of articles) {
		if (a.slug) {
			entries.push(toEntry(baseUrl, `/blog/article/${a.slug}`, 0.7, 'monthly', a.updatedAt?.slice(0, 10)));
		}
	}

	for (const slug of categorySlugs) {
		if (slug) entries.push(toEntry(baseUrl, `/blog/section/${slug}`, 0.7, 'weekly'));
	}

	for (const slug of topicSlugs) {
		if (slug) entries.push(toEntry(baseUrl, `/blog/tag/${slug}`, 0.7, 'weekly'));
	}

	const seenLetters = new Set<string>();
	for (const t of glossaryTerms) {
		if (t.slug) entries.push(toEntry(baseUrl, `/political-terms/${t.slug}`, 0.6, 'monthly'));
		const letter = t.title?.charAt(0)?.toLowerCase();
		if (letter && !seenLetters.has(letter)) {
			seenLetters.add(letter);
			entries.push(toEntry(baseUrl, `/political-terms/${letter}`, 0.6, 'monthly'));
		}
	}

	for (const { slug, faq } of getFaqSitemapEntries(faqs)) {
		entries.push(
			toEntry(baseUrl, `${FAQ_BASE_PATH}/${slug}`, 0.6, 'monthly', faq._updatedAt?.slice(0, 10)),
		);
	}

	return dedupeByUrl(entries);
}

/**
 * Fetches state election sitemap entries (places + races) from Election API.
 *
 * City-level races and city listing pages are included by fetching city places
 * (mtfcc G4110) with countyName, building a citySlug->countySlug lookup, and
 * emitting correct 4-level URLs (/elections/[state]/[county]/[city]/position/[positionSlug]).
 */
export async function fetchStateElectionSitemapEntries(
	stateCode: string,
	baseUrl: string,
): Promise<MetadataRoute.Sitemap> {
	const entries: MetadataRoute.Sitemap = [];
	const code = stateCode.toUpperCase();

	const [places, cities, races] = await Promise.all([
		fetchElectionJson<{ slug?: string; mtfcc?: string; name?: string }>('v1/places', {
			state: code,
			placeColumns: 'slug,mtfcc,name',
		}),
		fetchElectionJson<{ slug?: string; countyName?: string }>('v1/places', {
			state: code,
			mtfcc: 'G4110',
			placeColumns: 'slug,countyName',
		}),
		fetchElectionJson<{ slug?: string; positionLevel?: string }>('v1/races', {
			state: code,
			raceColumns: 'slug,positionLevel',
		}),
	]);

	const { citySlugToCountySlug } = buildCountyLookups(places, cities);

	for (const p of places) {
		if (!p.slug) continue;
		const mtfcc = p.mtfcc ?? '';
		if (mtfcc === 'G4020' || mtfcc.startsWith('G54')) {
			entries.push(toEntry(baseUrl, `/elections/${p.slug}`, 0.7, 'weekly'));
		}
	}

	for (const c of cities) {
		const countySlug = citySlugToCountySlug.get(c.slug ?? '');
		if (!countySlug || !c.slug) continue;
		const citySegment = c.slug.split('/').pop();
		if (!citySegment || looksLikeDistrictSlug(citySegment)) continue;
		entries.push(toEntry(baseUrl, `/elections/${countySlug}/${citySegment}`, 0.7, 'weekly'));
	}

	entries.push(...buildRaceEntries(races, citySlugToCountySlug, baseUrl));

	return dedupeByUrl(entries);
}

/**
 * Fetches public /people profile sitemap entries.
 *
 * Two-hop join across the service boundary: gp-api owns the publish gate (which
 * personIds are live), election-api owns the authoritative, unique, clean
 * `Person.slug` that is the canonical URL. Anything gp-api reports as published
 * but that has no election-api Person yet is skipped (no slug → no page).
 */
export async function fetchPeopleSitemapEntries(
	baseUrl: string,
	shard?: string,
): Promise<MetadataRoute.Sitemap> {
	const published = await fetchGpApiJson<{ personId?: string; updatedAt?: string }>(
		'v1/public-person-profiles/published',
	);
	if (published.length === 0) return [];

	const updatedByPersonId = new Map<string, string | undefined>();
	for (const row of published) {
		if (row.personId) updatedByPersonId.set(row.personId.toLowerCase(), row.updatedAt);
	}

	const ids = [...updatedByPersonId.keys()];
	// election-api caps the `ids` filter at 500 (a larger list is rejected and
	// returns []), so batch to avoid silently dropping published people.
	const idBatches = chunkArray(ids, 500);
	const persons = (
		await Promise.all(
			idBatches.map((batch) =>
				fetchElectionJson<{ id?: string; slug?: string | null }>('v1/persons', {
					ids: batch.join(','),
					columns: 'id,slug',
				}),
			),
		)
	).flat();

	const entries: MetadataRoute.Sitemap = [];
	for (const p of persons) {
		if (!p.id || !p.slug) continue;
		// When a shard is requested, only emit people whose slug falls in it.
		if (shard && peopleShardForSlug(p.slug) !== shard) continue;
		const updatedAt = updatedByPersonId.get(p.id.toLowerCase());
		entries.push(toEntry(baseUrl, `/people/${p.slug}`, 0.7, 'weekly', updatedAt?.slice(0, 10)));
	}
	return dedupeByUrl(entries);
}

/**
 * Fetches candidate sitemap entries from Election API.
 */
export async function fetchCandidateSitemapEntries(
	stateCode: string,
	baseUrl: string,
): Promise<MetadataRoute.Sitemap> {
	const code = stateCode.toUpperCase();
	const candidacies = await fetchElectionJson<{ slug?: string }>('v1/candidacies', {
		state: code,
		columns: 'slug',
	});
	const entries: MetadataRoute.Sitemap = [];
	for (const c of candidacies) {
		if (c.slug) entries.push(toEntry(baseUrl, `/candidate/${c.slug}`, 0.7, 'weekly'));
	}
	return dedupeByUrl(entries);
}
