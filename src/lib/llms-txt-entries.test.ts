import { describe, expect, test } from 'bun:test';
import {
	buildLlmsTxtDoc,
	joinUrl,
	normalizeDescription,
	renderLlmsTxt,
	type LlmsTxtDoc,
	type LlmsTxtItem,
	type LlmsTxtSection,
	type LlmsTxtSourceData,
} from './llms-txt-entries';

const BASE = 'https://goodparty.org';

const emptySingletons: LlmsTxtSourceData['singletons'] = {
	home: false,
	blog: false,
	contact: false,
	glossary: false,
};

function emptyData(overrides: Partial<LlmsTxtSourceData> = {}): LlmsTxtSourceData {
	return {
		singletons: { ...emptySingletons, ...(overrides.singletons ?? {}) },
		articles: overrides.articles ?? [],
		glossary: overrides.glossary ?? [],
		landingPages: overrides.landingPages ?? [],
		policies: overrides.policies ?? [],
	};
}

function getSection(doc: LlmsTxtDoc, name: string): LlmsTxtSection {
	const section = doc.sections.find(s => s.name === name);
	if (!section) throw new Error(`Section "${name}" not found in doc`);
	return section;
}

function firstItem(items: LlmsTxtItem[]): LlmsTxtItem {
	const [first] = items;
	if (!first) throw new Error('Expected at least one item');
	return first;
}

describe('joinUrl', () => {
	test('joins root path correctly', () => {
		expect(joinUrl(BASE, '/')).toBe(`${BASE}/`);
	});

	test('joins nested path correctly', () => {
		expect(joinUrl(BASE, '/blog/article/foo')).toBe(`${BASE}/blog/article/foo`);
	});

	test('strips trailing slash from base', () => {
		expect(joinUrl(`${BASE}/`, '/blog')).toBe(`${BASE}/blog`);
	});

	test('prefixes path with slash if missing', () => {
		expect(joinUrl(BASE, 'blog')).toBe(`${BASE}/blog`);
	});
});

describe('normalizeDescription', () => {
	test('returns undefined for nullish input', () => {
		expect(normalizeDescription(null)).toBeUndefined();
		expect(normalizeDescription(undefined)).toBeUndefined();
		expect(normalizeDescription('')).toBeUndefined();
	});

	test('collapses whitespace and newlines', () => {
		expect(normalizeDescription('a\nb\t  c')).toBe('a b c');
	});

	test('trims surrounding whitespace', () => {
		expect(normalizeDescription('   hello world   ')).toBe('hello world');
	});

	test('returns undefined when only whitespace', () => {
		expect(normalizeDescription('  \n\t  ')).toBeUndefined();
	});

	test('truncates with ellipsis past max length', () => {
		const long = 'x'.repeat(250);
		const out = normalizeDescription(long, 50);
		expect(out).toBeDefined();
		expect(out?.length).toBe(50);
		expect(out?.endsWith('…')).toBe(true);
	});

	test('does not truncate when under max length', () => {
		expect(normalizeDescription('short', 50)).toBe('short');
	});
});

describe('buildLlmsTxtDoc', () => {
	test('emits hard-coded site title and summary', () => {
		const doc = buildLlmsTxtDoc(BASE, emptyData());
		expect(doc.title).toBe('Good Party');
		expect(doc.summary.length).toBeGreaterThan(0);
	});

	test('includes hard-coded Elections and Candidates entries even with no Sanity data', () => {
		const doc = buildLlmsTxtDoc(BASE, emptyData());
		const urls = getSection(doc, 'Top-level pages').items.map(i => i.url);
		expect(urls).toContain(`${BASE}/elections`);
		expect(urls).toContain(`${BASE}/candidates`);
	});

	test('omits Home/Blog/Glossary/Contact when their singletons are missing', () => {
		const doc = buildLlmsTxtDoc(BASE, emptyData());
		const urls = getSection(doc, 'Top-level pages').items.map(i => i.url);
		expect(urls).not.toContain(`${BASE}/`);
		expect(urls).not.toContain(`${BASE}/blog`);
		expect(urls).not.toContain(`${BASE}/political-terms`);
		expect(urls).not.toContain(`${BASE}/contact`);
	});

	test('includes Home/Blog/Glossary/Contact when their singletons are present', () => {
		const doc = buildLlmsTxtDoc(
			BASE,
			emptyData({
				singletons: { home: true, blog: true, contact: true, glossary: true },
			}),
		);
		const urls = getSection(doc, 'Top-level pages').items.map(i => i.url);
		expect(urls).toContain(`${BASE}/`);
		expect(urls).toContain(`${BASE}/blog`);
		expect(urls).toContain(`${BASE}/political-terms`);
		expect(urls).toContain(`${BASE}/contact`);
	});

	test('builds article URLs under /blog/article and absolute base', () => {
		const doc = buildLlmsTxtDoc(
			BASE,
			emptyData({
				articles: [
					{ slug: 'why-independents-win', title: 'Why Independents Win', description: 'A short take.' },
				],
			}),
		);
		expect(getSection(doc, 'Articles').items).toEqual([
			{
				title: 'Why Independents Win',
				url: `${BASE}/blog/article/why-independents-win`,
				description: 'A short take.',
			},
		]);
	});

	test('builds glossary URLs under /political-terms', () => {
		const doc = buildLlmsTxtDoc(
			BASE,
			emptyData({
				glossary: [{ slug: 'gerrymandering', title: 'Gerrymandering', description: null }],
			}),
		);
		expect(getSection(doc, 'Political terms').items).toEqual([
			{
				title: 'Gerrymandering',
				url: `${BASE}/political-terms/gerrymandering`,
				description: undefined,
			},
		]);
	});

	test('builds landing page and policy URLs at site root', () => {
		const doc = buildLlmsTxtDoc(
			BASE,
			emptyData({
				landingPages: [{ slug: 'about', title: 'About', description: null }],
				policies: [{ slug: 'privacy', title: 'Privacy Policy', description: null }],
			}),
		);
		expect(firstItem(getSection(doc, 'Pages').items).url).toBe(`${BASE}/about`);
		expect(firstItem(getSection(doc, 'Policies').items).url).toBe(`${BASE}/privacy`);
	});

	test('skips rows with missing slug or missing title', () => {
		const doc = buildLlmsTxtDoc(
			BASE,
			emptyData({
				articles: [
					{ slug: null, title: 'No slug', description: null },
					{ slug: 'no-title', title: null, description: null },
					{ slug: 'good', title: 'Good', description: null },
				],
			}),
		);
		const articles = getSection(doc, 'Articles');
		expect(articles.items).toHaveLength(1);
		expect(firstItem(articles.items).url).toBe(`${BASE}/blog/article/good`);
	});

	test('omits a section entirely when it has no items', () => {
		const doc = buildLlmsTxtDoc(BASE, emptyData());
		const names = doc.sections.map(s => s.name);
		expect(names).not.toContain('Articles');
		expect(names).not.toContain('Political terms');
		expect(names).not.toContain('Pages');
		expect(names).not.toContain('Policies');
	});

	test('section order is stable: Top-level → Articles → Political terms → Pages → Policies', () => {
		const doc = buildLlmsTxtDoc(
			BASE,
			emptyData({
				articles: [{ slug: 'a', title: 'A', description: null }],
				glossary: [{ slug: 'g', title: 'G', description: null }],
				landingPages: [{ slug: 'p', title: 'P', description: null }],
				policies: [{ slug: 'po', title: 'Po', description: null }],
			}),
		);
		expect(doc.sections.map(s => s.name)).toEqual([
			'Top-level pages',
			'Articles',
			'Political terms',
			'Pages',
			'Policies',
		]);
	});

	test('deduplicates URLs across sections: top-level wins over later Sanity duplicates', () => {
		const doc = buildLlmsTxtDoc(
			BASE,
			emptyData({
				landingPages: [
					{ slug: 'elections', title: 'Elections (Sanity)', description: null },
					{ slug: 'about', title: 'About', description: null },
				],
			}),
		);
		const topLevelUrls = getSection(doc, 'Top-level pages').items.map(i => i.url);
		const pages = getSection(doc, 'Pages');
		expect(topLevelUrls).toContain(`${BASE}/elections`);
		expect(pages.items.map(i => i.url)).not.toContain(`${BASE}/elections`);
		expect(pages.items.map(i => i.url)).toContain(`${BASE}/about`);
	});

	test('deduplicates duplicate URLs within a section, preserving the first', () => {
		const doc = buildLlmsTxtDoc(
			BASE,
			emptyData({
				articles: [
					{ slug: 'dup', title: 'First', description: null },
					{ slug: 'dup', title: 'Second', description: null },
				],
			}),
		);
		const articles = getSection(doc, 'Articles');
		expect(articles.items).toHaveLength(1);
		expect(firstItem(articles.items).title).toBe('First');
	});

	test('all emitted URLs are absolute and use the provided base', () => {
		const doc = buildLlmsTxtDoc(
			BASE,
			emptyData({
				singletons: { home: true, blog: true, contact: true, glossary: true },
				articles: [{ slug: 'a', title: 'A', description: null }],
				glossary: [{ slug: 'g', title: 'G', description: null }],
				landingPages: [{ slug: 'p', title: 'P', description: null }],
				policies: [{ slug: 'po', title: 'Po', description: null }],
			}),
		);
		for (const section of doc.sections) {
			for (const item of section.items) {
				expect(item.url.startsWith(`${BASE}/`)).toBe(true);
			}
		}
	});
});

describe('renderLlmsTxt', () => {
	function makeDoc(overrides: Partial<LlmsTxtDoc> = {}): LlmsTxtDoc {
		return {
			title: 'Good Party',
			summary: 'Site summary.',
			sections: [],
			...overrides,
		};
	}

	test('starts with the H1 title and a blockquote summary line', () => {
		const out = renderLlmsTxt(makeDoc());
		const lines = out.split('\n');
		expect(lines[0]).toBe('# Good Party');
		expect(lines[1]).toBe('');
		expect(lines[2]).toBe('> Site summary.');
	});

	test('emits sections as ## headings with bullet items', () => {
		const out = renderLlmsTxt(
			makeDoc({
				sections: [
					{
						name: 'Top-level pages',
						items: [
							{ title: 'Home', url: 'https://goodparty.org/', description: 'Homepage.' },
							{ title: 'Blog', url: 'https://goodparty.org/blog' },
						],
					},
				],
			}),
		);
		expect(out).toContain('## Top-level pages');
		expect(out).toContain('- [Home](https://goodparty.org/): Homepage.');
		expect(out).toContain('- [Blog](https://goodparty.org/blog)');
	});

	test('omits the description suffix when an item has no description', () => {
		const out = renderLlmsTxt(
			makeDoc({
				sections: [
					{
						name: 'Articles',
						items: [{ title: 'A', url: 'https://goodparty.org/blog/article/a' }],
					},
				],
			}),
		);
		expect(out).toContain('- [A](https://goodparty.org/blog/article/a)\n');
		expect(out).not.toContain('- [A](https://goodparty.org/blog/article/a):');
	});

	test('includes optional details paragraph when present', () => {
		const out = renderLlmsTxt(makeDoc({ details: 'Optional context paragraph.' }));
		expect(out).toContain('Optional context paragraph.');
	});

	test('ends with exactly one trailing newline', () => {
		const out = renderLlmsTxt(
			makeDoc({
				sections: [
					{ name: 'Articles', items: [{ title: 'A', url: 'https://goodparty.org/x' }] },
				],
			}),
		);
		expect(out.endsWith('\n')).toBe(true);
		expect(out.endsWith('\n\n')).toBe(false);
	});

	test('round-trips a built doc into spec-shaped Markdown', () => {
		const doc = buildLlmsTxtDoc(BASE, {
			singletons: { home: true, blog: true, contact: false, glossary: true },
			articles: [
				{ slug: 'ranked-choice', title: 'Ranked Choice 101', description: 'Intro to RCV.' },
			],
			glossary: [{ slug: 'rcv', title: 'Ranked-choice voting', description: null }],
			landingPages: [],
			policies: [],
		});
		const out = renderLlmsTxt(doc);
		expect(out.split('\n')[0]).toBe('# Good Party');
		expect(out).toMatch(/^>\s.+/m);
		expect(out).toContain('## Top-level pages');
		expect(out).toContain('## Articles');
		expect(out).toContain('## Political terms');
		expect(out).toContain(`- [Ranked Choice 101](${BASE}/blog/article/ranked-choice): Intro to RCV.`);
		expect(out).toContain(`- [Ranked-choice voting](${BASE}/political-terms/rcv)`);
	});
});
