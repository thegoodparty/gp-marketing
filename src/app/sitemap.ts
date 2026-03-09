import type { MetadataRoute } from 'next';
import { client } from '~/lib/client';
import { getBaseUrl } from '~/lib/url';
import { US_STATE_CODES } from '~/constants/usStateCodes';

type SitemapEntry = MetadataRoute.Sitemap[number];

/** Max 5k docs per type keeps sitemap under 50k URLs and avoids Sanity timeouts */
const SLICE = '[0..4999]';

export const revalidate = 86400; // 24h - sitemap does not need real-time freshness

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const base = getBaseUrl();

	const staticRoutes: SitemapEntry[] = [
		{ url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
		{ url: `${base}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
		{ url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
		{ url: `${base}/political-terms`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
		{ url: `${base}/all`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
		{ url: `${base}/elections`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
		{ url: `${base}/candidates`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
		{ url: `${base}/profile`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
	];

	const [
		landingSlugs,
		policySlugs,
		articleSlugs,
		glossarySlugs,
		categorySlugs,
		topicSlugs,
	] = await Promise.all([
		client.fetch<Array<{ slug: string }>>(
			`*[_type=="goodpartyOrg_landingPages"]${SLICE}{ "slug": detailPageOverviewNoHero.field_slug }`,
		),
		client.fetch<Array<{ slug: string }>>(
			`*[_type=="policy"]${SLICE}{ "slug": policyOverview.field_slug }`,
		),
		client.fetch<Array<{ slug: string; _updatedAt: string }>>(
			`*[_type=="article"]${SLICE}{ "slug": editorialOverview.field_slug, _updatedAt }`,
		),
		client.fetch<Array<{ slug: string }>>(
			`*[_type=="glossary"]${SLICE}{ "slug": glossaryTermOverview.field_slug }`,
		),
		client.fetch<Array<{ slug: string }>>(
			`*[_type=="categories"]${SLICE}{ "slug": tagOverview.field_slug }`,
		),
		client.fetch<Array<{ slug: string }>>(
			`*[_type=="topics"]${SLICE}{ "slug": tagOverview.field_slug }`,
		),
	]);

	const landingPages: SitemapEntry[] = (landingSlugs ?? [])
		.filter((x) => x.slug)
		.map((x) => ({
			url: `${base}/${x.slug}`,
			lastModified: new Date(),
			changeFrequency: 'weekly' as const,
			priority: 0.8,
		}));

	const policies: SitemapEntry[] = (policySlugs ?? [])
		.filter((x) => x.slug)
		.map((x) => ({
			url: `${base}/${x.slug}`,
			lastModified: new Date(),
			changeFrequency: 'monthly' as const,
			priority: 0.7,
		}));

	const articles: SitemapEntry[] = (articleSlugs ?? [])
		.filter((x) => x.slug)
		.map((x) => ({
			url: `${base}/blog/article/${x.slug}`,
			lastModified: x._updatedAt ? new Date(x._updatedAt) : new Date(),
			changeFrequency: 'monthly' as const,
			priority: 0.7,
		}));

	const glossaryTerms: SitemapEntry[] = (glossarySlugs ?? [])
		.filter((x) => x.slug)
		.map((x) => ({
			url: `${base}/political-terms/${x.slug}`,
			lastModified: new Date(),
			changeFrequency: 'monthly' as const,
			priority: 0.6,
		}));

	const categories: SitemapEntry[] = (categorySlugs ?? [])
		.filter((x) => x.slug)
		.map((x) => ({
			url: `${base}/blog/section/${x.slug}`,
			lastModified: new Date(),
			changeFrequency: 'weekly' as const,
			priority: 0.7,
		}));

	const topics: SitemapEntry[] = (topicSlugs ?? [])
		.filter((x) => x.slug)
		.map((x) => ({
			url: `${base}/blog/tag/${x.slug}`,
			lastModified: new Date(),
			changeFrequency: 'weekly' as const,
			priority: 0.7,
		}));

	const electionStateRoutes: SitemapEntry[] = US_STATE_CODES.map((code) => ({
		url: `${base}/elections/${code.toLowerCase()}`,
		lastModified: new Date(),
		changeFrequency: 'weekly' as const,
		priority: 0.7,
	}));

	return [
		...staticRoutes,
		...landingPages,
		...policies,
		...articles,
		...glossaryTerms,
		...categories,
		...topics,
		...electionStateRoutes,
	];
}
