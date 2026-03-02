import type { MetadataRoute } from 'next';
import { client } from '~/lib/client';
import { getBaseUrl } from '~/lib/url';

type SitemapEntry = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const base = getBaseUrl();

	const staticRoutes: SitemapEntry[] = [
		{ url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
		{ url: `${base}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
		{ url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
		{ url: `${base}/political-terms`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
		{ url: `${base}/all`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
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
			'*[_type=="goodpartyOrg_landingPages"]{ "slug": detailPageOverviewNoHero.field_slug }',
		),
		client.fetch<Array<{ slug: string }>>(
			'*[_type=="policy"]{ "slug": policyOverview.field_slug }',
		),
		client.fetch<Array<{ slug: string; _updatedAt: string }>>(
			'*[_type=="article"]{ "slug": editorialOverview.field_slug, _updatedAt }',
		),
		client.fetch<Array<{ slug: string }>>(
			'*[_type=="glossary"]{ "slug": glossaryTermOverview.field_slug }',
		),
		client.fetch<Array<{ slug: string }>>(
			'*[_type=="categories"]{ "slug": tagOverview.field_slug }',
		),
		client.fetch<Array<{ slug: string }>>(
			'*[_type=="topics"]{ "slug": tagOverview.field_slug }',
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

	return [
		...staticRoutes,
		...landingPages,
		...policies,
		...articles,
		...glossaryTerms,
		...categories,
		...topics,
	];
}
