/**
 * Sanity content contract tests.
 *
 * Runs real GROQ queries against the Sanity dataset and validates that every
 * published document has the fields the frontend requires. Fails loudly when a
 * content editor removes or empties a field that a page template assumes exists.
 *
 * Usage:
 *   bun test integration/sanity-contracts.test.ts
 *   SANITY_TEST_DATASET=staging bun test integration/sanity-contracts.test.ts
 *
 * Environment variables:
 *   SANITY_TEST_DATASET   Dataset to query (default: production)
 *   SANITY_TEST_TOKEN     Read-only Sanity API token (optional for public datasets)
 *
 * CI recommendation: run on every PR alongside unit tests. Queries are fast
 * (milliseconds each) and hit the Sanity CDN, not the Next.js app server.
 */

import { describe, test, expect } from 'bun:test';
import { createClient } from '@sanity/client';
import {
	articleRequiredSchema,
	categoryRequiredSchema,
	topicRequiredSchema,
	glossaryTermRequiredSchema,
	faqRequiredSchema,
	landingPageRequiredSchema,
	singletonExistsSchema,
} from '../src/sanity/contracts';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Client setup
// ---------------------------------------------------------------------------

const PROJECT_ID = '3rbseux7';
const DATASET = process.env['SANITY_TEST_DATASET'] ?? 'production';
const TOKEN = process.env['SANITY_TEST_TOKEN'];

const client = createClient({
	projectId: PROJECT_ID,
	dataset: DATASET,
	apiVersion: '2025-10-08',
	useCdn: !TOKEN, // use CDN for public read; bypass for token-authenticated reads
	perspective: 'published',
	...(TOKEN ? { token: TOKEN } : {}),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Formats a Zod validation error into a readable failure report listing the
 * offending document IDs so editors can find and fix them quickly.
 */
function formatIssues(issues: z.ZodIssue[]): string {
	return issues
		.map(issue => {
			const path = issue.path.join('.');
			return `  [${path}] ${issue.message}`;
		})
		.join('\n');
}

/**
 * Validates every item in an array against a schema. Collects all failures
 * instead of stopping at the first, so the report shows the full scope.
 */
function validateAll<T>(
	rows: unknown[],
	schema: z.ZodObject<z.ZodRawShape>,
): { passed: number; failures: { id: string; issues: z.ZodIssue[] }[] } {
	const failures: { id: string; issues: z.ZodIssue[] }[] = [];
	for (const row of rows) {
		const result = schema.safeParse(row);
		if (!result.success) {
			const id = (row as { _id?: string })._id ?? '(unknown)';
			failures.push({ id, issues: result.error.issues });
		}
	}
	return { passed: rows.length - failures.length, failures };
}

/** Checks that no two rows share the same slug value. */
function findDuplicateSlugs(rows: Array<{ _id: string; slug: string }>): Map<string, string[]> {
	const seen = new Map<string, string[]>();
	for (const row of rows) {
		const ids = seen.get(row.slug) ?? [];
		ids.push(row._id);
		seen.set(row.slug, ids);
	}
	const duplicates = new Map<string, string[]>();
	for (const [slug, ids] of seen) {
		if (ids.length > 1) duplicates.set(slug, ids);
	}
	return duplicates;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Sanity content contracts', () => {
	describe('articles (/blog/article/[slug])', () => {
		test('no article has a null or empty slug', async () => {
			// A null slug causes generateStaticParams to silently drop the article.
			const rows = await client.fetch<unknown[]>(
				`*[_type == "article"]{ _id, "slug": editorialOverview.field_slug, "title": editorialOverview.field_editorialTitle }`,
			);
			const { failures } = validateAll(rows, articleRequiredSchema);
			if (failures.length > 0) {
				const report = failures
					.map(f => `  _id=${f.id}\n${formatIssues(f.issues)}`)
					.join('\n');
				throw new Error(`${failures.length} article(s) have invalid required fields:\n${report}`);
			}
			expect(failures).toHaveLength(0);
		});

		test('no two articles share the same slug', async () => {
			// Duplicate slugs mean one article silently 404s; only the first match is returned.
			const rows = await client.fetch<Array<{ _id: string; slug: string }>>(
				`*[_type == "article" && defined(editorialOverview.field_slug)]{ _id, "slug": editorialOverview.field_slug }`,
			);
			const duplicates = findDuplicateSlugs(rows);
			if (duplicates.size > 0) {
				const report = Array.from(duplicates.entries())
					.map(([slug, ids]) => `  slug="${slug}" used by: ${ids.join(', ')}`)
					.join('\n');
				throw new Error(`${duplicates.size} duplicate article slug(s):\n${report}`);
			}
			expect(duplicates.size).toBe(0);
		});
	});

	describe('categories (/blog/section/[slug])', () => {
		test('no category has a null or empty slug', async () => {
			const rows = await client.fetch<unknown[]>(
				`*[_type == "categories"]{ _id, "slug": tagOverview.field_slug }`,
			);
			const { failures } = validateAll(rows, categoryRequiredSchema);
			if (failures.length > 0) {
				const report = failures.map(f => `  _id=${f.id}\n${formatIssues(f.issues)}`).join('\n');
				throw new Error(`${failures.length} category/categories have invalid required fields:\n${report}`);
			}
			expect(failures).toHaveLength(0);
		});

		test('no two categories share the same slug', async () => {
			const rows = await client.fetch<Array<{ _id: string; slug: string }>>(
				`*[_type == "categories" && defined(tagOverview.field_slug)]{ _id, "slug": tagOverview.field_slug }`,
			);
			const duplicates = findDuplicateSlugs(rows);
			if (duplicates.size > 0) {
				const report = Array.from(duplicates.entries())
					.map(([slug, ids]) => `  slug="${slug}" used by: ${ids.join(', ')}`)
					.join('\n');
				throw new Error(`${duplicates.size} duplicate category slug(s):\n${report}`);
			}
			expect(duplicates.size).toBe(0);
		});
	});

	describe('topics (/blog/tag/[slug])', () => {
		test('no topic has a null or empty slug', async () => {
			const rows = await client.fetch<unknown[]>(
				`*[_type == "topics"]{ _id, "slug": tagOverview.field_slug }`,
			);
			const { failures } = validateAll(rows, topicRequiredSchema);
			if (failures.length > 0) {
				const report = failures.map(f => `  _id=${f.id}\n${formatIssues(f.issues)}`).join('\n');
				throw new Error(`${failures.length} topic(s) have invalid required fields:\n${report}`);
			}
			expect(failures).toHaveLength(0);
		});

		test('no two topics share the same slug', async () => {
			const rows = await client.fetch<Array<{ _id: string; slug: string }>>(
				`*[_type == "topics" && defined(tagOverview.field_slug)]{ _id, "slug": tagOverview.field_slug }`,
			);
			const duplicates = findDuplicateSlugs(rows);
			if (duplicates.size > 0) {
				const report = Array.from(duplicates.entries())
					.map(([slug, ids]) => `  slug="${slug}" used by: ${ids.join(', ')}`)
					.join('\n');
				throw new Error(`${duplicates.size} duplicate topic slug(s):\n${report}`);
			}
			expect(duplicates.size).toBe(0);
		});
	});

	describe('glossary terms (/political-terms/[slug])', () => {
		test('no glossary term has a null slug or null term text', async () => {
			// A null slug drops the term from generateStaticParams.
			// A null term text produces a blank <h1> on the term page.
			const rows = await client.fetch<unknown[]>(
				`*[_type == "glossary"]{ _id, "slug": glossaryTermOverview.field_slug, "term": glossaryTermOverview.field_glossaryTerm }`,
			);
			const { failures } = validateAll(rows, glossaryTermRequiredSchema);
			if (failures.length > 0) {
				const report = failures.map(f => `  _id=${f.id}\n${formatIssues(f.issues)}`).join('\n');
				throw new Error(`${failures.length} glossary term(s) have invalid required fields:\n${report}`);
			}
			expect(failures).toHaveLength(0);
		});

		test('no two glossary terms share the same slug', async () => {
			const rows = await client.fetch<Array<{ _id: string; slug: string }>>(
				`*[_type == "glossary" && defined(glossaryTermOverview.field_slug)]{ _id, "slug": glossaryTermOverview.field_slug }`,
			);
			const duplicates = findDuplicateSlugs(rows);
			if (duplicates.size > 0) {
				const report = Array.from(duplicates.entries())
					.map(([slug, ids]) => `  slug="${slug}" used by: ${ids.join(', ')}`)
					.join('\n');
				throw new Error(`${duplicates.size} duplicate glossary slug(s):\n${report}`);
			}
			expect(duplicates.size).toBe(0);
		});
	});

	describe('FAQs (/frequently-asked-questions/[faqSlug])', () => {
		test('no FAQ has a null or empty question', async () => {
			// The question is the page <h1> and drives the computed slug for generateStaticParams.
			const rows = await client.fetch<unknown[]>(
				`*[_type == "faq"]{ _id, "question": faqOverview.field_question }`,
			);
			const { failures } = validateAll(rows, faqRequiredSchema);
			if (failures.length > 0) {
				const report = failures.map(f => `  _id=${f.id}\n${formatIssues(f.issues)}`).join('\n');
				throw new Error(`${failures.length} FAQ(s) have invalid required fields:\n${report}`);
			}
			expect(failures).toHaveLength(0);
		});
	});

	describe('landing pages (/[slug])', () => {
		test('no landing page has a null or empty slug', async () => {
			// A null slug makes the page unreachable; /[slug] looks up by this value.
			const rows = await client.fetch<unknown[]>(
				`*[_type == "goodpartyOrg_landingPages"]{ _id, "slug": detailPageOverviewNoHero.field_slug }`,
			);
			const { failures } = validateAll(rows, landingPageRequiredSchema);
			if (failures.length > 0) {
				const report = failures.map(f => `  _id=${f.id}\n${formatIssues(f.issues)}`).join('\n');
				throw new Error(`${failures.length} landing page(s) have invalid required fields:\n${report}`);
			}
			expect(failures).toHaveLength(0);
		});

		test('no two landing pages share the same slug', async () => {
			const rows = await client.fetch<Array<{ _id: string; slug: string }>>(
				`*[_type == "goodpartyOrg_landingPages" && defined(detailPageOverviewNoHero.field_slug)]{ _id, "slug": detailPageOverviewNoHero.field_slug }`,
			);
			const duplicates = findDuplicateSlugs(rows);
			if (duplicates.size > 0) {
				const report = Array.from(duplicates.entries())
					.map(([slug, ids]) => `  slug="${slug}" used by: ${ids.join(', ')}`)
					.join('\n');
				throw new Error(`${duplicates.size} duplicate landing page slug(s):\n${report}`);
			}
			expect(duplicates.size).toBe(0);
		});
	});

	describe('singleton documents (affect every page)', () => {
		test('goodpartyOrg_navigation document exists', async () => {
			// Missing navigation document breaks the header on every page.
			const doc = await client.fetch<unknown>(
				`*[_type == "goodpartyOrg_navigation"][0]{ _id }`,
			);
			const result = singletonExistsSchema.safeParse(doc);
			expect(result.success, 'goodpartyOrg_navigation document is missing').toBe(true);
		});

		test('goodpartyOrg_footer document exists', async () => {
			// Missing footer document breaks the footer on every page.
			const doc = await client.fetch<unknown>(
				`*[_type == "goodpartyOrg_footer"][0]{ _id }`,
			);
			const result = singletonExistsSchema.safeParse(doc);
			expect(result.success, 'goodpartyOrg_footer document is missing').toBe(true);
		});

		test('goodpartyOrg_home document exists', async () => {
			const doc = await client.fetch<unknown>(
				`*[_type == "goodpartyOrg_home"][0]{ _id }`,
			);
			const result = singletonExistsSchema.safeParse(doc);
			expect(result.success, 'goodpartyOrg_home document is missing').toBe(true);
		});

		test('goodpartyOrg_seoSettings document exists', async () => {
			// Used in root layout metadata; missing breaks OG/Twitter cards on every page.
			const doc = await client.fetch<unknown>(
				`*[_type == "goodpartyOrg_seoSettings"][0]{ _id }`,
			);
			const result = singletonExistsSchema.safeParse(doc);
			expect(result.success, 'goodpartyOrg_seoSettings document is missing').toBe(true);
		});
	});
});
