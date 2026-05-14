import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import {
	buildArticleSchema,
	buildBreadcrumbSchema,
	buildDefinedTermSchema,
	buildFAQSchema,
	buildOrganizationSchema,
	buildSchemaGraph,
	buildSoftwareApplicationSchema,
	buildWebPageSchema,
	buildWebSiteSchema,
	organizationId,
	resolveSameAs,
	softwareApplicationId,
	webPageId,
	webSiteId,
} from './schema';

const envKeys = ['NEXT_PUBLIC_APP_BASE', 'NEXT_PUBLIC_SITE_URL', 'VERCEL_ENV', 'VERCEL_URL', 'NODE_ENV'] as const;

let snapshot: Partial<Record<(typeof envKeys)[number], string | undefined>>;

beforeEach(() => {
	snapshot = {};
	for (const k of envKeys) snapshot[k] = process.env[k];
	process.env['NODE_ENV'] = 'development';
	delete process.env['VERCEL_ENV'];
	process.env['NEXT_PUBLIC_SITE_URL'] = 'https://goodparty.org';
});

afterEach(() => {
	for (const k of envKeys) {
		const v = snapshot[k];
		if (v === undefined) delete process.env[k];
		else process.env[k] = v;
	}
});

function asRecord(schema: object): Record<string, unknown> {
	return schema as Record<string, unknown>;
}

describe('organization id helpers', () => {
	test('organizationId is stable per base URL', () => {
		expect(organizationId('https://goodparty.org')).toBe('https://goodparty.org/#organization');
		expect(organizationId('https://goodparty.org/')).toBe('https://goodparty.org/#organization');
	});

	test('webSiteId and softwareApplicationId share base URL', () => {
		expect(webSiteId('https://goodparty.org')).toBe('https://goodparty.org/#website');
		expect(softwareApplicationId('https://goodparty.org')).toBe('https://goodparty.org/#software-application');
	});

	test('webPageId matches WebPage schema node ids', () => {
		expect(webPageId('/blog/article/foo')).toBe('https://goodparty.org/blog/article/foo#webpage');
		expect(webPageId('https://goodparty.org/blog/article/foo')).toBe(
			'https://goodparty.org/blog/article/foo#webpage',
		);
	});
});

describe('resolveSameAs', () => {
	test('keeps only absolute URLs, dedupes, and preserves order', () => {
		const out = resolveSameAs([
			{ url: 'https://example.com/a', name: 'X' },
			{ url: '  not a url  ', name: 'Y' },
			{ url: 'https://example.com/a', name: 'Z' },
			{ url: 'https://example.com/b', name: 'Q' },
		]);
		expect(out).toEqual(['https://example.com/a', 'https://example.com/b']);
	});

	test('handles null/undefined safely', () => {
		expect(resolveSameAs(undefined)).toEqual([]);
		expect(resolveSameAs(null)).toEqual([]);
		expect(resolveSameAs([])).toEqual([]);
	});
});

describe('buildOrganizationSchema', () => {
	test('includes stable @id, logo, and url', () => {
		const schema = asRecord(buildOrganizationSchema());
		expect(schema['@type']).toBe('Organization');
		expect(schema['@id']).toBe('https://goodparty.org/#organization');
		expect(schema['url']).toBe('https://goodparty.org');
		expect((schema['logo'] as Record<string, unknown>)['@type']).toBe('ImageObject');
	});

	test('emits sameAs only when provided', () => {
		const without = asRecord(buildOrganizationSchema());
		expect('sameAs' in without).toBe(false);

		const withChannels = asRecord(
			buildOrganizationSchema({ socialChannels: [{ url: 'https://twitter.com/goodparty' }] }),
		);
		expect(withChannels['sameAs']).toEqual(['https://twitter.com/goodparty']);
	});
});

describe('buildWebSiteSchema', () => {
	test('publisher references the Organization @id', () => {
		const schema = asRecord(buildWebSiteSchema());
		expect(schema['@type']).toBe('WebSite');
		expect((schema['publisher'] as Record<string, unknown>)['@id']).toBe(
			'https://goodparty.org/#organization',
		);
	});
});

describe('buildWebPageSchema', () => {
	test('absolutizes relative urls and references publisher Organization', () => {
		const schema = asRecord(
			buildWebPageSchema({ url: '/about', name: 'About', description: 'About GoodParty' }),
		);
		expect(schema['url']).toBe('https://goodparty.org/about');
		expect(schema['@id']).toBe('https://goodparty.org/about#webpage');
		expect((schema['publisher'] as Record<string, unknown>)['@id']).toBe(
			'https://goodparty.org/#organization',
		);
		expect(schema['description']).toBe('About GoodParty');
	});

	test('respects custom pageType', () => {
		const schema = asRecord(buildWebPageSchema({ url: '/blog', name: 'Blog', pageType: 'CollectionPage' }));
		expect(schema['@type']).toBe('CollectionPage');
	});
});

describe('buildArticleSchema', () => {
	test('sets mainEntityOfPage, publisher and optional author Person', () => {
		const schema = asRecord(
			buildArticleSchema({
				url: '/blog/article/foo',
				headline: 'Foo',
				description: 'Bar',
				datePublished: '2026-01-01',
				dateModified: '2026-01-02',
				authorName: 'Jane Doe',
				authorJobTitle: 'Civic Editor',
			}),
		);
		expect(schema['@type']).toBe('Article');
		expect(schema['headline']).toBe('Foo');
		expect((schema['mainEntityOfPage'] as Record<string, unknown>)['@id']).toBe(
			'https://goodparty.org/blog/article/foo#webpage',
		);
		const author = schema['author'] as Record<string, unknown>;
		expect(author['@type']).toBe('Person');
		expect(author['name']).toBe('Jane Doe');
		expect(author['jobTitle']).toBe('Civic Editor');
		expect(schema['datePublished']).toBe('2026-01-01');
		expect(schema['dateModified']).toBe('2026-01-02');
	});
});

describe('buildBreadcrumbSchema', () => {
	test('positions are 1-indexed and items only set when href is present', () => {
		const schema = asRecord(
			buildBreadcrumbSchema([
				{ href: '/blog', label: 'Blog' },
				{ href: '', label: 'Current' },
			]),
		);
		const items = schema['itemListElement'] as Array<Record<string, unknown>>;
		expect(items[0]?.['position']).toBe(1);
		expect(items[0]?.['item']).toBe('https://goodparty.org/blog');
		expect(items[1]?.['position']).toBe(2);
		expect('item' in (items[1] ?? {})).toBe(false);
	});
});

describe('buildFAQSchema', () => {
	test('returns null when no valid pairs remain', () => {
		expect(buildFAQSchema([])).toBeNull();
		expect(buildFAQSchema([{ title: '', copy: 'a' }, { title: 'q', copy: '' }])).toBeNull();
	});

	test('emits FAQPage with cleaned question/answer pairs', () => {
		const schema = asRecord(
			buildFAQSchema([
				{ title: '  Q1  ', copy: '  A1  ' },
				{ title: 'Q2', copy: 'A2' },
			]) as object,
		);
		expect(schema['@type']).toBe('FAQPage');
		const entity = schema['mainEntity'] as Array<Record<string, unknown>>;
		expect(entity.length).toBe(2);
		expect(entity[0]?.['name']).toBe('Q1');
		expect((entity[0]?.['acceptedAnswer'] as Record<string, unknown>)['text']).toBe('A1');
	});
});

describe('buildDefinedTermSchema', () => {
	test('includes name, description, url and optional set', () => {
		const schema = asRecord(
			buildDefinedTermSchema({
				url: '/political-terms/civic-tech',
				term: 'Civic Tech',
				description: 'Technology for civic engagement.',
				inDefinedTermSetName: 'Political Terms Glossary',
				inDefinedTermSetUrl: '/political-terms',
			}),
		);
		expect(schema['@type']).toBe('DefinedTerm');
		expect(schema['name']).toBe('Civic Tech');
		expect(schema['url']).toBe('https://goodparty.org/political-terms/civic-tech');
		const set = schema['inDefinedTermSet'] as Record<string, unknown>;
		expect(set['@type']).toBe('DefinedTermSet');
		expect(set['url']).toBe('https://goodparty.org/political-terms');
	});
});

describe('buildSoftwareApplicationSchema', () => {
	test('uses sensible defaults and references publisher Organization', () => {
		const schema = asRecord(
			buildSoftwareApplicationSchema({ description: 'Free campaign tools for independents.' }),
		);
		expect(schema['@type']).toBe('SoftwareApplication');
		expect(schema['applicationCategory']).toBe('BusinessApplication');
		expect((schema['offers'] as Record<string, unknown>)['price']).toBe('0');
		expect((schema['publisher'] as Record<string, unknown>)['@id']).toBe(
			'https://goodparty.org/#organization',
		);
	});
});

describe('buildSchemaGraph', () => {
	test('links Article mainEntityOfPage to the matching WebPage node id', () => {
		const graph = asRecord(
			buildSchemaGraph([
				buildArticleSchema({ url: '/blog/article/foo', headline: 'Foo' }),
				buildWebPageSchema({ url: '/blog/article/foo', name: 'Foo' }),
			]) as object,
		);
		const entries = graph['@graph'] as Array<Record<string, unknown>>;
		const article = entries.find(entry => entry['@type'] === 'Article');
		const webPage = entries.find(entry => entry['@type'] === 'WebPage');

		expect((article?.['mainEntityOfPage'] as Record<string, unknown>)['@id']).toBe(webPage?.['@id']);
	});

	test('strips inner @context fields and wraps results', () => {
		const graph = asRecord(
			buildSchemaGraph([
				buildOrganizationSchema(),
				buildBreadcrumbSchema([{ href: '/blog', label: 'Blog' }]),
				null,
				undefined,
			]) as object,
		);
		expect(graph['@context']).toBe('https://schema.org');
		const entries = graph['@graph'] as Array<Record<string, unknown>>;
		expect(entries.length).toBe(2);
		expect('@context' in entries[0]!).toBe(false);
		expect('@context' in entries[1]!).toBe(false);
		expect(entries[0]!['@type']).toBe('Organization');
		expect(entries[1]!['@type']).toBe('BreadcrumbList');
	});

	test('returns null when all entries are nullish', () => {
		expect(buildSchemaGraph([null, undefined])).toBeNull();
	});
});
