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
import { buildPersonSlugFromBase } from '~/lib/peopleProfile';
import { FAQ_BASE_PATH, getFaqSitemapEntries } from '~/lib/faqSlugs';
import { fetchElectionApiJsonCached } from '~/lib/electionApiFetch';
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
 * The first people shard id sits immediately after the state-election band
 * (id 0 = main, 1..N = state elections).
 *
 * There used to be a second per-state band listing every /candidate/<slug>.
 * It was retired when /candidate started permanently redirecting to /people:
 * a sitemap should advertise destinations, not redirects, and leaving ~248k
 * 308s in it spent crawl budget re-walking the migration on every pass.
 */
export const PEOPLE_SITEMAP_BAND_START = 1 + US_STATE_CODES.length;

export function getSitemapIds(): { id: number }[] {
	const ids: { id: number }[] = [{ id: 0 }];
	for (let i = 0; i < US_STATE_CODES.length; i++) {
		ids.push({ id: i + 1 });
	}
	for (let i = 0; i < PEOPLE_SITEMAP_SHARDS.length; i++) {
		ids.push({ id: PEOPLE_SITEMAP_BAND_START + i });
	}
	return ids;
}

// Server-only base: M2M auth headers are attached to requests against this URL,
// so it must never be sourced from a client-visible (NEXT_PUBLIC_*) env var.
const ELECTION_API_BASE =
	process.env['ELECTIONS_API_BASE_URL'] ?? 'https://election-api.goodparty.org';

const GP_API_BASE =
	process.env['GP_API_BASE_URL'] ??
	process.env['NEXT_PUBLIC_API_BASE'] ??
	ELECTION_API_BASE.replace('election-api', 'gp-api');

const CACHE_1H: RequestInit = { next: { revalidate: 3600 } };

/** Next.js data-cache tag for the /people sitemap upstream fetches. Bust via revalidateTag. */
export const PEOPLE_SITEMAP_CACHE_TAG = 'people-sitemap';

function cacheInit(tags?: readonly string[]): RequestInit {
	if (tags && tags.length > 0) {
		return { next: { revalidate: 3600, tags: [...tags] } };
	}
	return CACHE_1H;
}

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

/**
 * `lastModified` distinguishes "unknown" from "absent": `undefined` stamps today
 * (the long-standing default for pages whose freshness we can't source), while
 * an explicit `null` omits the key entirely. The /people band needs the latter —
 * we have no per-person modification date for a page nobody has claimed, and
 * dating 200k+ of them "today" on every hourly rebuild would tell crawlers the
 * whole corpus changes continuously, which is both false and the fastest way to
 * get lastmod ignored site-wide.
 */
function toEntry(
	baseUrl: string,
	path: string,
	priority: number,
	changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency'],
	lastModified?: string | null,
): MetadataRoute.Sitemap[0] {
	return {
		url: `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`,
		...(lastModified === null
			? {}
			: { lastModified: lastModified ?? new Date().toISOString().slice(0, 10) }),
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
			const results = await Promise.all(US_STATE_CODES.map(async (c) => fetchStateElectionRouteParams(c)));
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

/**
 * Strict variants for the /people band.
 *
 * The soft helpers above degrade a failed upstream to `[]`, which is right for a
 * band whose worst case is a few missing election URLs. It is wrong here. This
 * band's inputs are a whole-table enumeration and a privacy exclusion list, and
 * an empty-on-failure read of either is indistinguishable from a real answer:
 * one transient 5xx on a single state sweep would publish a sitemap missing that
 * state's people while claiming to be complete, and a non-200 from the removal
 * list would advertise every person who asked to be delisted. Both failures are
 * silent and both look exactly like success.
 *
 * So these throw. The shard then fails rather than serving a wrong answer, which
 * is the recoverable direction: a crawler retries, and the previous good sitemap
 * stays cached until it does.
 */
async function fetchGpApiJsonOrThrow<T>(path: string, tags?: readonly string[]): Promise<T[]> {
	const url = `${GP_API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
	const res = await fetch(url, cacheInit(tags));
	if (!res.ok) throw new Error(`[sitemap] gp-api ${res.status} ${url}`);
	const data: unknown = await res.json();
	if (!Array.isArray(data)) throw new Error(`[sitemap] gp-api non-array body ${url}`);
	return data as T[];
}

async function fetchElectionJsonOrThrow<T>(
	path: string,
	params: Record<string, string>,
	tags?: readonly string[],
): Promise<T[]> {
	const search = new URLSearchParams(params).toString();
	const url = `${ELECTION_API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}?${search}`;
	const result = await fetchElectionApiJsonCached(url, tags);
	if (!result.ok) throw new Error(`[sitemap] Election API ${result.status} ${url}`);
	if (!Array.isArray(result.json)) {
		throw new Error(`[sitemap] Election API non-array body ${url}`);
	}
	return result.json as T[];
}

async function fetchElectionJson<T>(
	path: string,
	params: Record<string, string>,
	tags?: readonly string[],
): Promise<T[]> {
	const search = new URLSearchParams(params).toString();
	const url = `${ELECTION_API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}?${search}`;
	try {
		const result = await fetchElectionApiJsonCached(url, tags);
		if (!result.ok) {
			console.error(`[sitemap] Election API ${result.status} ${url}`);
			return [];
		}
		const data = result.json;
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

type PeopleSitemapPerson = { id?: string; slug?: string | null };

type PeopleSitemapData = {
	/** personId → updatedAt, for the published subset only; also marks "claimed". */
	updatedByPersonId: Map<string, string | undefined>;
	/** personIds whose page must never be advertised — see the loader for why. */
	unlistedPersonIds: Set<string>;
	persons: PeopleSitemapPerson[];
};

/**
 * Ids per `?ids=` lookup.
 *
 * election-api's own documented cap is 500, but that is unreachable: the filter
 * is a query parameter, and 500 comma-encoded uuids is a ~19.5KB query string,
 * which the gateway rejects with a 414 before the service ever sees it (measured
 * — 300 ids / ~11.8KB still answers 200). This sits under the classic 8KB
 * request-line limit so it survives any proxy in front of the API, at the cost
 * of more, smaller round trips.
 */
const PERSON_ID_BATCH = 150;

/**
 * Cap on concurrent upstream requests while enumerating the person table.
 * A full sweep is ~150 calls; firing them at once buys nothing (each returns in
 * well under a second) and risks starving the same election-api that is serving
 * live page renders.
 */
const ENUMERATION_CONCURRENCY = 8;

async function mapWithConcurrency<T, R>(
	items: readonly T[],
	limit: number,
	fn: (item: T) => Promise<R>,
): Promise<R[]> {
	const results: R[] = new Array(items.length) as R[];
	let next = 0;
	const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
		for (let i = next++; i < items.length; i = next++) {
			results[i] = await fn(items[i] as T);
		}
	});
	await Promise.all(workers);
	return results;
}

/**
 * Every person with a public /people page.
 *
 * election-api offers no pagination and no count on `GET /v1/persons` — the
 * query schema is strict, so `limit`/`offset` are 400s — which leaves `state`
 * as the only bounded way to walk the table. A state sweep alone is NOT
 * complete: `Person.state` is nullable, and the people carrying no state are
 * unreachable through it (~8% of the corpus, 17k of 216k when this was written)
 * because there is no way to ask for `state IS NULL`.
 *
 * The upstream mart defines the Person table as "people with a candidacy or
 * office term", so the candidacy and officeholder feeds between them name every
 * person that exists — and both DO carry a usable state. Unioning their
 * personIds and resolving anything the sweep missed back through the 500-id
 * batch filter closes the gap exactly, rather than approximately.
 *
 * If election-api ever grows a cursor or a dedicated enumeration feed, this
 * whole dance collapses into a single paged read.
 */
async function fetchAllPersons(): Promise<PeopleSitemapPerson[]> {
	const tags = [PEOPLE_SITEMAP_CACHE_TAG];
	const states = [...US_STATE_CODES];
	const byId = new Map<string, PeopleSitemapPerson>();

	const sweeps = await mapWithConcurrency(states, ENUMERATION_CONCURRENCY, async (state) =>
		fetchElectionJsonOrThrow<PeopleSitemapPerson>(
			'v1/persons',
			{ state, columns: 'id,slug' },
			tags,
		),
	);
	for (const rows of sweeps) {
		for (const person of rows) {
			if (person.id) byId.set(person.id.toLowerCase(), person);
		}
	}

	const linkedFeeds: { path: string; state: string }[] = states.flatMap((state) => [
		{ path: 'v1/candidacies', state },
		{ path: 'v1/officeholders', state },
	]);
	const linked = await mapWithConcurrency(
		linkedFeeds,
		ENUMERATION_CONCURRENCY,
		async ({ path, state }) =>
			fetchElectionJsonOrThrow<{ personId?: string }>(
				path,
				{ state, columns: 'personId' },
				tags,
			),
	);
	const unseen = new Set<string>();
	for (const rows of linked) {
		for (const row of rows) {
			const id = row.personId?.toLowerCase();
			if (id && !byId.has(id)) unseen.add(id);
		}
	}

	const batches = await mapWithConcurrency(
		chunkArray([...unseen], PERSON_ID_BATCH),
		ENUMERATION_CONCURRENCY,
		async (ids) =>
			fetchElectionJsonOrThrow<PeopleSitemapPerson>(
				'v1/persons',
				{ ids: ids.join(','), columns: 'id,slug' },
				tags,
			),
	);
	for (const rows of batches) {
		for (const person of rows) {
			if (person.id) byId.set(person.id.toLowerCase(), person);
		}
	}

	return [...byId.values()];
}

let cachedPeopleSitemapData: Promise<PeopleSitemapData> | null = null;

/**
 * Clears the process-local in-flight Promise (same instance only).
 * Pair with revalidateTag(PEOPLE_SITEMAP_CACHE_TAG) so other instances hit a
 * fresh Next.js data cache on next access. Used by revalidate-person and tests.
 */
export function clearPeopleSitemapCache(): void {
	cachedPeopleSitemapData = null;
}

/**
 * Shared gp-api + election-api lookup for the /people sitemap band.
 * Concurrent shard callers share one in-flight Promise; once it settles the
 * module slot clears so the next access goes through the tagged Next.js data
 * cache (mirrors Sanity sitemap revalidateTag busting).
 */
async function getCachedPeopleSitemapData(): Promise<PeopleSitemapData> {
	if (!cachedPeopleSitemapData) {
		const load = (async (): Promise<PeopleSitemapData> => {
			const [published, unlisted, persons] = await Promise.all([
				fetchGpApiJsonOrThrow<{ personId?: string; updatedAt?: string }>(
					'v1/public-person-profiles/published',
					[PEOPLE_SITEMAP_CACHE_TAG],
				),
				fetchGpApiJsonOrThrow<{ personId?: string }>('v1/public-person-profiles/unlisted', [
					PEOPLE_SITEMAP_CACHE_TAG,
				]),
				fetchAllPersons(),
			]);

			const updatedByPersonId = new Map<string, string | undefined>();
			for (const row of published) {
				if (row.personId) updatedByPersonId.set(row.personId.toLowerCase(), row.updatedAt);
			}

			// Two different reasons, one consequence: a person with a privacy removal
			// on record renders noindex, and a person whose owner deleted their
			// profile gets a 410 from gp-api and so has no page at all. gp-api
			// collapses both into this feed because the sitemap only cares about the
			// consequence.
			const unlistedPersonIds = new Set<string>();
			for (const row of unlisted) {
				if (row.personId) unlistedPersonIds.add(row.personId.toLowerCase());
			}

			return { updatedByPersonId, unlistedPersonIds, persons };
		})();
		cachedPeopleSitemapData = load;
		// Settle via two-arg `then`, not `finally`: the upstream reads throw now, and
		// `finally` returns a promise that re-raises the rejection with nobody
		// attached to it — an unhandled rejection that can take the server down
		// depending on the runtime's policy. Handling both arms here keeps the
		// rejection observable only to the shard awaiting it, which is where it
		// belongs. Clearing the slot on failure also means a transient outage costs
		// one failed shard rather than pinning the band broken.
		const settle = (): void => {
			if (cachedPeopleSitemapData === load) {
				cachedPeopleSitemapData = null;
			}
		};
		load.then(settle, settle);
	}
	return cachedPeopleSitemapData;
}

/**
 * Sitemap entries for the public /people band — every person with a page, not
 * just the claimed ones.
 *
 * election-api owns the authoritative, unique `Person.slug` that is the
 * canonical URL, so a person with no spine row has no page and is skipped.
 * gp-api contributes the two per-person facts it alone knows: which people have
 * published (worth a higher priority and a real lastmod) and which must not be
 * listed at all.
 *
 * Unlisted people are dropped rather than downranked, because in both cases the
 * URL is one we should not be handing to a crawler: a privacy removal renders
 * `noindex`, so advertising it contradicts the page's own directive and points
 * crawlers at someone who asked to be left alone, and an owner-deleted profile
 * has no page to reach at all — gp-api answers 410 and the route 404s.
 *
 * Upstream fetches are shared across shards via getCachedPeopleSitemapData.
 */
export async function fetchPeopleSitemapEntries(
	baseUrl: string,
	shard?: string,
): Promise<MetadataRoute.Sitemap> {
	const { updatedByPersonId, unlistedPersonIds, persons } = await getCachedPeopleSitemapData();

	const entries: MetadataRoute.Sitemap = [];
	for (const p of persons) {
		if (!p.id || !p.slug) continue;
		const personId = p.id.toLowerCase();
		if (unlistedPersonIds.has(personId)) continue;
		// When a shard is requested, only emit people whose slug falls in it. The
		// canonical URL appends the 8-hex id suffix but shares the base's first
		// char, so sharding on the base is equivalent.
		if (shard && peopleShardForSlug(p.slug) !== shard) continue;
		const canonicalSlug = buildPersonSlugFromBase(p.slug, p.id);
		const published = updatedByPersonId.has(personId);
		entries.push(
			toEntry(
				baseUrl,
				`/people/${canonicalSlug}`,
				// A claimed page carries owner-authored content; an unclaimed one is
				// the civics spine alone. The split tells crawlers which half of the
				// corpus to spend budget on first.
				published ? 0.7 : 0.5,
				'weekly',
				published ? (updatedByPersonId.get(personId)?.slice(0, 10) ?? null) : null,
			),
		);
	}
	return dedupeByUrl(entries);
}

