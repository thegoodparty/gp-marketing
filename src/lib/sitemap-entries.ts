/**
 * Shared sitemap fetchers for dynamic route and CLI scripts.
 * Uses sanityClient directly (not sanityFetch) to avoid draftMode() in metadata context.
 */

import type { MetadataRoute } from 'next';
import { sanityClient } from '~/sanity/sanityClient';
import { stripCountySuffix as stripCountySuffixFromHelpers } from '~/lib/electionsHelpers';

/** 51 US state/territory codes (50 states + DC) */
export const US_STATE_CODES = [
	'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
] as const;

/** Single source of truth for sitemap IDs. Used by generateSitemaps() and sitemap-index route. */
export function getSitemapIds(): { id: number }[] {
	const ids: { id: number }[] = [{ id: 0 }];
	for (let i = 0; i < US_STATE_CODES.length; i++) {
		ids.push({ id: i + 1 });
		ids.push({ id: i + 1 + US_STATE_CODES.length });
	}
	return ids;
}

const ELECTION_API_BASE =
	process.env['NEXT_PUBLIC_ELECTION_API_BASE'] ?? process.env['ELECTIONS_API_BASE_URL'] ?? 'https://election-api.goodparty.org';

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
		if (!r.slug) continue;
		const parts = r.slug.split('/');
		const positionSlug = parts.pop();
		if (!positionSlug) continue;

		const level = (r.positionLevel ?? '').toUpperCase();

		if (level === 'CITY' || level === 'LOCAL') {
			const citySlug = parts.join('/');
			const countySlug = citySlugToCountySlug.get(citySlug);
			if (countySlug) {
				// 3-part city slug with a known county mapping → expand to 4-level URL
				const citySegment = parts.pop();
				if (!citySegment) continue;
				out.push(
					toEntry(baseUrl, `/elections/${countySlug}/${citySegment}/position/${positionSlug}`, 0.7, 'weekly'),
				);
				continue;
			}
			// CITY 3-part slug with no county mapping would produce a bad URL (city treated
			// as county). Skip it. 4-part slugs (parts.length === 3) already carry the county
			// and fall through to emit the correct URL from the prefix.
			if (level === 'CITY' && parts.length === 2) continue;
		}

		const prefix = parts.join('/');
		out.push(toEntry(baseUrl, `/elections/${prefix}/position/${positionSlug}`, 0.7, 'weekly'));
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
		const parts = r.slug.split('/');
		const positionSlug = parts.pop();
		if (!positionSlug) continue;

		const level = (r.positionLevel ?? '').toUpperCase();

		if (level === 'CITY' || level === 'LOCAL') {
			const citySlug = parts.join('/');
			const countySlug = citySlugToCountySlug.get(citySlug);
			if (countySlug) {
				const citySegment = parts.pop();
				if (!citySegment) continue;
				const csParts = countySlug.split('/').filter(Boolean);
				if (csParts.length >= 2) {
					cityPositionParams.push({
						state: csParts[0]!.toLowerCase(),
						county: csParts.slice(1).join('/').toLowerCase(),
						city: citySegment.toLowerCase(),
						positionSlug,
					});
				}
				continue;
			}
			if (level === 'CITY' && parts.length === 2) continue;
		}

		const prefix = parts.join('/');
		const segs = prefix.split('/').filter(Boolean);
		if (segs.length === 1) {
			statePositionParams.push({ state: segs[0]!.toLowerCase(), positionSlug });
		} else if (segs.length === 2) {
			countyPositionParams.push({
				state: segs[0]!.toLowerCase(),
				county: segs[1]!.toLowerCase(),
				positionSlug,
			});
		} else if (segs.length === 3) {
			cityPositionParams.push({
				state: segs[0]!.toLowerCase(),
				county: segs[1]!.toLowerCase(),
				city: segs[2]!.toLowerCase(),
				positionSlug,
			});
		} else if (segs.length === 4) {
			subplacePositionParams.push({
				state: segs[0]!.toLowerCase(),
				county: segs[1]!.toLowerCase(),
				city: segs[2]!.toLowerCase(),
				subplace: segs[3]!.toLowerCase(),
				positionSlug,
			});
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
	for (const p of places) {
		if (!p.slug) continue;
		const mtfcc = p.mtfcc ?? '';
		if (mtfcc === 'G4020' || mtfcc.startsWith('G54')) {
			const segs = p.slug.split('/').filter(Boolean);
			if (segs.length >= 2) {
				countyParams.push({
					state: segs[0]!.toLowerCase(),
					county: segs.slice(1).join('/').toLowerCase(),
				});
			}
		}
	}

	const cityParams: ElectionCityRouteParam[] = [];
	for (const c of cities) {
		const countySlug = citySlugToCountySlug.get(c.slug ?? '');
		if (!countySlug || !c.slug) continue;
		const citySegment = c.slug.split('/').pop();
		if (!citySegment) continue;
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

	const [singletons, landingAndPolicySlugs, articles, categorySlugs, topicSlugs, glossaryTerms] =
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
		if (citySegment) {
			entries.push(toEntry(baseUrl, `/elections/${countySlug}/${citySegment}`, 0.7, 'weekly'));
		}
	}

	entries.push(...buildRaceEntries(races, citySlugToCountySlug, baseUrl));

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
