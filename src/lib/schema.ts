import { getBaseUrl, toAbsoluteUrl, DEFAULT_SHARE_IMAGE } from './url';
import type { BreadcrumbItem } from '~/ui/BreadcrumbBlock';

export type { BreadcrumbItem };

const ORGANIZATION_ID_FRAGMENT = '#organization';
const WEBSITE_ID_FRAGMENT = '#website';
const WEBPAGE_ID_FRAGMENT = '#webpage';
const SOFTWARE_APPLICATION_ID_FRAGMENT = '#software-application';

function trimTrailingSlash(value: string): string {
	return value.replace(/\/$/, '');
}

/** Stable `@id` for the global Organization entity. Used to link other schema back to one canonical node. */
export function organizationId(baseUrl: string = getBaseUrl()): string {
	return `${trimTrailingSlash(baseUrl)}/${ORGANIZATION_ID_FRAGMENT}`;
}

/** Stable `@id` for the WebSite entity. */
export function webSiteId(baseUrl: string = getBaseUrl()): string {
	return `${trimTrailingSlash(baseUrl)}/${WEBSITE_ID_FRAGMENT}`;
}

/** Stable `@id` for a WebPage entity at the given URL. */
export function webPageId(url: string): string {
	const absoluteUrl = url.startsWith('http') ? url : toAbsoluteUrl(url);
	return `${absoluteUrl}${WEBPAGE_ID_FRAGMENT}`;
}

/** Stable `@id` for the SoftwareApplication entity (campaign platform). */
export function softwareApplicationId(baseUrl: string = getBaseUrl()): string {
	return `${trimTrailingSlash(baseUrl)}/${SOFTWARE_APPLICATION_ID_FRAGMENT}`;
}

export type SocialChannelLike = {
	url?: string | null | undefined;
	name?: string | null | undefined;
};

/** Resolves a list of verified absolute `sameAs` URLs from Sanity social channel records. */
export function resolveSameAs(channels: ReadonlyArray<SocialChannelLike> | null | undefined): string[] {
	if (!channels) return [];
	const seen = new Set<string>();
	const out: string[] = [];
	for (const channel of channels) {
		const url = channel?.url;
		if (typeof url !== 'string') continue;
		const trimmed = url.trim();
		if (!trimmed || !trimmed.startsWith('http')) continue;
		if (seen.has(trimmed)) continue;
		seen.add(trimmed);
		out.push(trimmed);
	}
	return out;
}

export type OrganizationSchemaParams = {
	baseUrl?: string;
	name?: string;
	legalName?: string;
	logoUrl?: string;
	description?: string;
	sameAs?: ReadonlyArray<string>;
	socialChannels?: ReadonlyArray<SocialChannelLike>;
};

/**
 * Schema.org Organization with stable `@id` so other page schemas can reference it
 * with `{ "@id": organizationId() }` and avoid duplicating brand fields.
 */
export function buildOrganizationSchema(params: OrganizationSchemaParams = {}): object {
	const baseUrl = trimTrailingSlash(params.baseUrl ?? getBaseUrl());
	const name = params.name ?? 'GoodParty.org';
	const logo = params.logoUrl ?? `${baseUrl}/web-app-manifest-192x192.png`;
	const explicitSameAs = params.sameAs ? [...params.sameAs] : [];
	const fromChannels = resolveSameAs(params.socialChannels);
	const sameAs = Array.from(new Set([...explicitSameAs, ...fromChannels]));

	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		'@id': organizationId(baseUrl),
		name,
		url: baseUrl,
		logo: {
			'@type': 'ImageObject',
			url: logo,
		},
	};

	if (params.legalName) schema['legalName'] = params.legalName;
	if (params.description) schema['description'] = params.description;
	if (sameAs.length > 0) schema['sameAs'] = sameAs;

	return schema;
}

export type WebSiteSchemaParams = {
	baseUrl?: string;
	name?: string;
	description?: string;
	publisherId?: string;
};

/**
 * Schema.org WebSite entity. Lets AI engines understand the site root and link
 * the publisher Organization via `@id` reference.
 */
export function buildWebSiteSchema(params: WebSiteSchemaParams = {}): object {
	const baseUrl = trimTrailingSlash(params.baseUrl ?? getBaseUrl());
	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': webSiteId(baseUrl),
		url: baseUrl,
		name: params.name ?? 'GoodParty.org',
		publisher: { '@id': params.publisherId ?? organizationId(baseUrl) },
	};
	if (params.description) schema['description'] = params.description;
	return schema;
}

export type WebPageSchemaParams = {
	url: string;
	name: string;
	description?: string;
	image?: string;
	datePublished?: string;
	dateModified?: string;
	/** Schema type override; defaults to `WebPage`. Use `CollectionPage` for index/archive pages. */
	pageType?: 'WebPage' | 'CollectionPage' | 'AboutPage' | 'ContactPage' | 'FAQPage';
	publisherId?: string;
	isPartOfId?: string;
};

/** Generic WebPage builder reused across Sanity-driven marketing pages. */
export function buildWebPageSchema(params: WebPageSchemaParams): object {
	const url = params.url.startsWith('http') ? params.url : toAbsoluteUrl(params.url);
	const baseUrl = getBaseUrl();
	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': params.pageType ?? 'WebPage',
		'@id': webPageId(url),
		url,
		name: params.name,
		isPartOf: { '@id': params.isPartOfId ?? webSiteId(baseUrl) },
		publisher: { '@id': params.publisherId ?? organizationId(baseUrl) },
	};
	if (params.description) schema['description'] = params.description;
	if (params.image) schema['primaryImageOfPage'] = { '@type': 'ImageObject', url: params.image };
	if (params.datePublished) schema['datePublished'] = params.datePublished;
	if (params.dateModified) schema['dateModified'] = params.dateModified;
	return schema;
}

export type ArticleSchemaParams = {
	url: string;
	headline: string;
	description?: string;
	image?: string;
	datePublished?: string;
	dateModified?: string;
	authorName?: string;
	authorUrl?: string;
	authorJobTitle?: string;
	publisherId?: string;
	pageType?: 'Article' | 'BlogPosting' | 'NewsArticle';
};

/**
 * Enriched Article schema with publisher reference, mainEntityOfPage, and optional Person author.
 * Uses `BlogPosting` when called from the blog routes for higher AI-citation specificity.
 */
export function buildArticleSchema(params: ArticleSchemaParams): object {
	const url = params.url.startsWith('http') ? params.url : toAbsoluteUrl(params.url);
	const baseUrl = getBaseUrl();
	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': params.pageType ?? 'Article',
		headline: params.headline,
		url,
		mainEntityOfPage: { '@type': 'WebPage', '@id': webPageId(url) },
		publisher: { '@id': params.publisherId ?? organizationId(baseUrl) },
	};

	if (params.description) schema['description'] = params.description;
	if (params.image) schema['image'] = params.image;
	if (params.datePublished) schema['datePublished'] = params.datePublished;
	if (params.dateModified) schema['dateModified'] = params.dateModified;

	if (params.authorName) {
		const author: Record<string, unknown> = { '@type': 'Person', name: params.authorName };
		if (params.authorUrl) author['url'] = params.authorUrl;
		if (params.authorJobTitle) author['jobTitle'] = params.authorJobTitle;
		schema['author'] = author;
	}

	return schema;
}

/**
 * Schema.org BreadcrumbList built from breadcrumb items. Items without an `href`
 * are still emitted (no `item` field) so the trail count matches the visible UI.
 */
export function buildBreadcrumbSchema(
	breadcrumbs: ReadonlyArray<BreadcrumbItem>,
	toAbsolute: (path: string) => string = toAbsoluteUrl,
): object {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: breadcrumbs.map((crumb, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: crumb.label,
			...(crumb.href && { item: toAbsolute(crumb.href) }),
		})),
	};
}

export type FAQItemLike = { title: string; copy: string };

/**
 * Schema.org FAQPage built from plain-text question/answer pairs.
 * Items missing either side are dropped; returns `null` if no usable items remain
 * so callers can skip emitting an empty `FAQPage`.
 */
export function buildFAQSchema(items: ReadonlyArray<FAQItemLike>): object | null {
	const filtered = items
		.map(item => ({
			title: typeof item?.title === 'string' ? item.title.trim() : '',
			copy: typeof item?.copy === 'string' ? item.copy.trim() : '',
		}))
		.filter(item => item.title && item.copy);

	if (filtered.length === 0) return null;

	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: filtered.map(item => ({
			'@type': 'Question',
			name: item.title,
			acceptedAnswer: {
				'@type': 'Answer',
				text: item.copy,
			},
		})),
	};
}

export type DefinedTermSchemaParams = {
	url: string;
	term: string;
	description: string;
	inDefinedTermSetName?: string;
	inDefinedTermSetUrl?: string;
};

/** Schema.org DefinedTerm — the canonical type for glossary entries. */
export function buildDefinedTermSchema(params: DefinedTermSchemaParams): object {
	const url = params.url.startsWith('http') ? params.url : toAbsoluteUrl(params.url);
	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'DefinedTerm',
		'@id': `${url}#term`,
		name: params.term,
		description: params.description,
		url,
	};

	if (params.inDefinedTermSetName || params.inDefinedTermSetUrl) {
		const set: Record<string, unknown> = { '@type': 'DefinedTermSet' };
		if (params.inDefinedTermSetName) set['name'] = params.inDefinedTermSetName;
		if (params.inDefinedTermSetUrl) {
			set['url'] = params.inDefinedTermSetUrl.startsWith('http')
				? params.inDefinedTermSetUrl
				: toAbsoluteUrl(params.inDefinedTermSetUrl);
		}
		schema['inDefinedTermSet'] = set;
	}

	return schema;
}

export type SoftwareApplicationSchemaParams = {
	baseUrl?: string;
	name?: string;
	description: string;
	applicationCategory?: string;
	operatingSystem?: string;
	offerPrice?: string;
	offerCurrency?: string;
	image?: string;
	publisherId?: string;
};

/**
 * Schema.org SoftwareApplication for the GoodParty.org candidate platform.
 * Only emit when on-page copy clearly identifies the campaign tools product so
 * the schema mirrors visible content.
 */
export function buildSoftwareApplicationSchema(params: SoftwareApplicationSchemaParams): object {
	const baseUrl = trimTrailingSlash(params.baseUrl ?? getBaseUrl());
	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		'@id': softwareApplicationId(baseUrl),
		name: params.name ?? 'GoodParty.org Campaign Platform',
		description: params.description,
		url: baseUrl,
		applicationCategory: params.applicationCategory ?? 'BusinessApplication',
		operatingSystem: params.operatingSystem ?? 'Web',
		publisher: { '@id': params.publisherId ?? organizationId(baseUrl) },
		image: params.image ?? DEFAULT_SHARE_IMAGE,
		offers: {
			'@type': 'Offer',
			price: params.offerPrice ?? '0',
			priceCurrency: params.offerCurrency ?? 'USD',
		},
	};
	return schema;
}

/**
 * Bundle multiple schema objects into a single JSON-LD `@graph`.
 * Strips per-entry `@context` since it is hoisted to the wrapper.
 * Returns `null` when no usable entries remain so callers can skip rendering.
 */
export function buildSchemaGraph(entries: ReadonlyArray<object | null | undefined>): object | null {
	const cleaned = entries
		.filter((entry): entry is object => entry !== null && entry !== undefined)
		.map(entry => {
			const { ['@context']: _ignored, ...rest } = entry as Record<string, unknown>;
			return rest;
		});

	if (cleaned.length === 0) return null;

	return {
		'@context': 'https://schema.org',
		'@graph': cleaned,
	};
}
