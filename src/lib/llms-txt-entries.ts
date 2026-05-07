/**
 * Curated content fetcher for /llms.txt (https://llmstxt.org/).
 *
 * Mirrors the sitemap-entries.ts pattern: uses `sanityClient` directly (not
 * `sanityFetch`) to avoid `draftMode()` in metadata-route context, and
 * pins `next.tags` so the existing /api/revalidate webhook invalidates it.
 *
 * The data layer (`fetchLlmsTxtData`) is split from the transformation
 * (`buildLlmsTxtDoc`) and the serialization (`renderLlmsTxt`) so the latter
 * two can be unit-tested without hitting Sanity.
 */

import { sanityClient } from '~/sanity/sanityClient';

export type LlmsTxtItem = { title: string; url: string; description?: string };

export type LlmsTxtSection = { name: string; items: LlmsTxtItem[] };

export type LlmsTxtDoc = {
	title: string;
	summary: string;
	details?: string;
	sections: LlmsTxtSection[];
};

type SlugTitleDescRow = {
	slug: string | null;
	title: string | null;
	description: string | null;
};

export type LlmsTxtSourceData = {
	singletons: {
		home: boolean;
		blog: boolean;
		contact: boolean;
		glossary: boolean;
	};
	articles: SlugTitleDescRow[];
	glossary: SlugTitleDescRow[];
	landingPages: SlugTitleDescRow[];
	policies: SlugTitleDescRow[];
};

const SITE_TITLE = 'Good Party';
const SITE_SUMMARY =
	'Nonpartisan tools, guides, and data that help independent and third-party candidates run for office and help voters discover them.';
const MAX_DESCRIPTION_LENGTH = 200;

/**
 * Removes a trailing slash and joins a path onto an absolute base URL.
 * Mirrors `toEntry` from sitemap-entries.ts to ensure URL formatting parity.
 */
export function joinUrl(baseUrl: string, path: string): string {
	const base = baseUrl.replace(/\/$/, '');
	const suffix = path.startsWith('/') ? path : `/${path}`;
	return `${base}${suffix}`;
}

export function dedupeByUrl<T extends { url: string }>(items: T[]): T[] {
	const seen = new Set<string>();
	const out: T[] = [];
	for (const item of items) {
		if (seen.has(item.url)) continue;
		seen.add(item.url);
		out.push(item);
	}
	return out;
}

/**
 * Collapses whitespace, strips Markdown link syntax, and truncates so a single
 * description line never breaks the `- [title](url): description` format.
 */
export function normalizeDescription(
	value: string | null | undefined,
	maxLen: number = MAX_DESCRIPTION_LENGTH,
): string | undefined {
	if (!value) return undefined;
	const collapsed = value.replace(/\s+/g, ' ').trim();
	if (!collapsed) return undefined;
	if (collapsed.length <= maxLen) return collapsed;
	return `${collapsed.slice(0, maxLen - 1).trimEnd()}…`;
}

function rowsToItems(
	baseUrl: string,
	rows: SlugTitleDescRow[],
	pathPrefix: string,
): LlmsTxtItem[] {
	const items: LlmsTxtItem[] = [];
	for (const row of rows) {
		if (!row.slug || !row.title) continue;
		items.push({
			title: row.title,
			url: joinUrl(baseUrl, `${pathPrefix}/${row.slug}`),
			description: normalizeDescription(row.description),
		});
	}
	return items;
}

/**
 * Pure transformation: source data + base URL → structured llms.txt doc.
 */
export function buildLlmsTxtDoc(
	baseUrl: string,
	data: LlmsTxtSourceData,
): LlmsTxtDoc {
	const topLevel: LlmsTxtItem[] = [];
	if (data.singletons.home) {
		topLevel.push({
			title: 'Home',
			url: joinUrl(baseUrl, '/'),
			description: 'Good Party homepage and mission overview.',
		});
	}
	if (data.singletons.blog) {
		topLevel.push({
			title: 'Blog',
			url: joinUrl(baseUrl, '/blog'),
			description: 'Articles on independent politics, candidates, and election reform.',
		});
	}
	if (data.singletons.glossary) {
		topLevel.push({
			title: 'Political terms glossary',
			url: joinUrl(baseUrl, '/political-terms'),
			description: 'Plain-language definitions of political and election terminology.',
		});
	}
	topLevel.push({
		title: 'Elections',
		url: joinUrl(baseUrl, '/elections'),
		description: 'State, county, and local election guides for US voters.',
	});
	topLevel.push({
		title: 'Candidates',
		url: joinUrl(baseUrl, '/candidates'),
		description: 'Independent and third-party candidates running for office.',
	});
	if (data.singletons.contact) {
		topLevel.push({
			title: 'Contact',
			url: joinUrl(baseUrl, '/contact'),
			description: 'Get in touch with Good Party.',
		});
	}

	// Dedupe globally across sections: the top-level curated entries win over
	// any later Sanity-driven duplicate (e.g. a landing page with slug
	// "elections" should not re-appear under ## Pages).
	const seenUrls = new Set<string>();
	const sections: LlmsTxtSection[] = [];
	const pushSection = (name: string, items: LlmsTxtItem[]): void => {
		const filtered: LlmsTxtItem[] = [];
		for (const item of items) {
			if (seenUrls.has(item.url)) continue;
			seenUrls.add(item.url);
			filtered.push(item);
		}
		if (filtered.length > 0) sections.push({ name, items: filtered });
	};

	pushSection('Top-level pages', topLevel);
	pushSection('Articles', rowsToItems(baseUrl, data.articles, '/blog/article'));
	pushSection('Political terms', rowsToItems(baseUrl, data.glossary, '/political-terms'));
	pushSection('Pages', rowsToItems(baseUrl, data.landingPages, ''));
	pushSection('Policies', rowsToItems(baseUrl, data.policies, ''));

	return {
		title: SITE_TITLE,
		summary: SITE_SUMMARY,
		sections,
	};
}

/**
 * Renders an `LlmsTxtDoc` into the spec-compliant Markdown body served at
 * `/llms.txt`. Output ends with a trailing newline so curl/cat output is tidy.
 */
export function renderLlmsTxt(doc: LlmsTxtDoc): string {
	const lines: string[] = [];
	lines.push(`# ${doc.title}`, '');
	lines.push(`> ${doc.summary}`, '');

	if (doc.details) {
		lines.push(doc.details, '');
	}

	for (const section of doc.sections) {
		lines.push(`## ${section.name}`, '');
		for (const item of section.items) {
			const desc = item.description ? `: ${item.description}` : '';
			lines.push(`- [${item.title}](${item.url})${desc}`);
		}
		lines.push('');
	}

	return `${lines.join('\n').replace(/\n+$/, '')}\n`;
}

/**
 * Single-flight fetch of every Sanity collection that feeds /llms.txt.
 * Tags align with the document `_type`s already wired in /api/revalidate.
 */
export async function fetchLlmsTxtData(): Promise<LlmsTxtSourceData> {
	const [singletons, articles, glossary, landingPages, policies] = await Promise.all([
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
			{
				next: {
					tags: [
						'goodpartyOrg_home',
						'goodpartyOrg_allArticles',
						'goodpartyOrg_contact',
						'goodpartyOrg_glossary',
					],
				},
			},
		),
		sanityClient.fetch<SlugTitleDescRow[]>(
			`*[_type == "article"]{
				"slug": editorialOverview.field_slug,
				"title": editorialOverview.field_editorialTitle,
				"description": seo.field_metaDescription
			}`,
			{},
			{ next: { tags: ['article'] } },
		),
		sanityClient.fetch<SlugTitleDescRow[]>(
			`*[_type == "glossary"]{
				"slug": glossaryTermOverview.field_slug,
				"title": glossaryTermOverview.field_glossaryTerm,
				"description": seo.field_metaDescription
			}`,
			{},
			{ next: { tags: ['glossary'] } },
		),
		sanityClient.fetch<SlugTitleDescRow[]>(
			`*[_type == "goodpartyOrg_landingPages"]{
				"slug": detailPageOverviewNoHero.field_slug,
				"title": detailPageOverviewNoHero.field_pageName,
				"description": seo.field_metaDescription
			}`,
			{},
			{ next: { tags: ['goodpartyOrg_landingPages'] } },
		),
		sanityClient.fetch<SlugTitleDescRow[]>(
			`*[_type == "policy"]{
				"slug": policyOverview.field_slug,
				"title": policyOverview.field_policyName,
				"description": seo.field_metaDescription
			}`,
			{},
			{ next: { tags: ['policy'] } },
		),
	]);

	return {
		singletons: {
			home: Boolean(singletons.home),
			blog: Boolean(singletons.blog),
			contact: Boolean(singletons.contact),
			glossary: Boolean(singletons.glossary),
		},
		articles,
		glossary,
		landingPages,
		policies,
	};
}

export async function fetchLlmsTxtDoc(baseUrl: string): Promise<LlmsTxtDoc> {
	const data = await fetchLlmsTxtData();
	return buildLlmsTxtDoc(baseUrl, data);
}
