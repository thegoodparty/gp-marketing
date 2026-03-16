/**
 * Shared sitemap fetchers for dynamic route and CLI scripts.
 * Uses sanityClient directly (not sanityFetch) to avoid draftMode() in metadata context.
 */

import type { MetadataRoute } from 'next';
import { sanityClient } from '~/sanity/sanityClient';

/** 51 US state/territory codes (50 states + DC) */
export const US_STATE_CODES = [
	'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
] as const;

const ELECTION_API_BASE =
	process.env['NEXT_PUBLIC_ELECTION_API_BASE'] ?? process.env['ELECTIONS_API_BASE_URL'] ?? 'https://election-api.goodparty.org';

const CACHE_1H: RequestInit = { next: { revalidate: 3600 } };

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

async function fetchElectionJson<T>(path: string, params: Record<string, string>): Promise<T[]> {
	const search = new URLSearchParams(params).toString();
	const url = `${ELECTION_API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}?${search}`;
	try {
		const res = await fetch(url, CACHE_1H);
		if (!res.ok) return [];
		const data: unknown = await res.json();
		if (Array.isArray(data)) return data as T[];
		if (data && typeof data === 'object' && 'data' in data) {
			const inner = (data as { data: unknown }).data;
			if (Array.isArray(inner)) return inner as T[];
		}
		return [];
	} catch {
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

	return entries;
}

/**
 * Fetches state election sitemap entries (places + races) from Election API.
 */
export async function fetchStateElectionSitemapEntries(
	stateCode: string,
	baseUrl: string,
): Promise<MetadataRoute.Sitemap> {
	const entries: MetadataRoute.Sitemap = [];
	const code = stateCode.toUpperCase();

	const [places, races] = await Promise.all([
		fetchElectionJson<{ slug?: string }>('v1/places', { state: code, placeColumns: 'slug' }),
		fetchElectionJson<{ slug?: string }>('v1/races', { state: code, raceColumns: 'slug' }),
	]);

	for (const p of places) {
		if (p.slug) entries.push(toEntry(baseUrl, `/elections/${p.slug}`, 0.7, 'weekly'));
	}
	for (const r of races) {
		if (!r.slug) continue;
		const parts = r.slug.split('/');
		const positionSlug = parts.pop();
		if (!positionSlug) continue;
		const prefix = parts.join('/');
		entries.push(toEntry(baseUrl, `/elections/${prefix}/position/${positionSlug}`, 0.7, 'weekly'));
	}

	return entries;
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
	return entries;
}
