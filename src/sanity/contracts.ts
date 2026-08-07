/**
 * Zod schemas for Sanity content contracts.
 *
 * Each schema captures only the fields that page templates require to render
 * without layout holes or silent 404s. They are intentionally narrow — extra
 * fields from GROQ results are stripped, not rejected.
 *
 * Used by integration/sanity-contracts.test.ts.
 */
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** Non-empty string — the common shape of every slug field. */
const nonEmptyString = z.string().min(1);

const idRow = z.object({ _id: z.string() });

// ---------------------------------------------------------------------------
// Per-document-type required-field schemas
// ---------------------------------------------------------------------------

/**
 * article — slug is required for generateStaticParams (a null slug silently
 * drops the page from the build, creating a 404 for that article).
 */
export const articleRequiredSchema = idRow.extend({
	slug: nonEmptyString,
	title: z.string().nullable().optional(), // warn if blank but not fatal
});

/**
 * categories (blog sections) — slug drives /blog/section/[slug] routes.
 */
export const categoryRequiredSchema = idRow.extend({
	slug: nonEmptyString,
});

/**
 * topics (blog tags) — slug drives /blog/tag/[slug] routes.
 */
export const topicRequiredSchema = idRow.extend({
	slug: nonEmptyString,
});

/**
 * glossary terms — slug drives /political-terms/[slug] routes.
 * field_glossaryTerm is the page <h1>; missing it produces a blank heading.
 */
export const glossaryTermRequiredSchema = idRow.extend({
	slug: nonEmptyString,
	term: nonEmptyString,
});

/**
 * faq — field_question is shown as the page <h1>. A missing question produces
 * a blank heading and an invalid FAQ schema.org block.
 */
export const faqRequiredSchema = idRow.extend({
	question: nonEmptyString,
});

/**
 * goodpartyOrg_landingPages — slug drives /[slug] routes. Missing slug means
 * the landing page 404s for all visitors.
 */
export const landingPageRequiredSchema = idRow.extend({
	slug: nonEmptyString,
});

/**
 * Singleton documents — these drive the shared shell (nav, footer) and the
 * homepage. The check is simply that the document exists.
 */
export const singletonExistsSchema = idRow;
