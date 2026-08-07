/**
 * Page health E2E tests.
 *
 * Verifies that every route renders without a server error, has a visible <h1>,
 * and does not produce React hydration errors or failed first-party requests.
 *
 * Dynamic slugs are fetched from Sanity at runtime via getSanityFixtures() so
 * the tests remain valid as content changes.
 *
 * Run:
 *   E2E_BASE_URL=https://goodparty.org playwright test e2e/pages.spec.ts
 *   E2E_BASE_URL=http://localhost:3009 playwright test e2e/pages.spec.ts
 */

import { test, expect } from '@playwright/test';
import { getSanityFixtures } from './helpers/sanity-fixtures';
import { assertPageHealth } from './helpers/page-health';

const BASE = (process.env['E2E_BASE_URL'] ?? 'https://goodparty.org').replace(/\/+$/, '');

// ---------------------------------------------------------------------------
// Fixed pages
// ---------------------------------------------------------------------------

test.describe('Fixed pages', () => {
	test('homepage renders', async ({ page }) => {
		await assertPageHealth(page, `${BASE}/`);
	});

	test('blog index renders', async ({ page }) => {
		await assertPageHealth(page, `${BASE}/blog`);
	});

	test('contact page renders', async ({ page }) => {
		await assertPageHealth(page, `${BASE}/contact`);
	});

	test('glossary index renders', async ({ page }) => {
		await assertPageHealth(page, `${BASE}/political-terms`);
	});

	test('elections index renders', async ({ page }) => {
		await assertPageHealth(page, `${BASE}/elections`);
	});
});

// ---------------------------------------------------------------------------
// Dynamic templates — representative slugs from Sanity
// ---------------------------------------------------------------------------

test.describe('Blog article template', () => {
	test('most recently updated article renders', async ({ page }) => {
		const { articleSlugRecent } = await getSanityFixtures();
		if (!articleSlugRecent) {
			test.skip(true, 'No published article with a slug found in dataset');
			return;
		}
		await assertPageHealth(page, `${BASE}/blog/article/${articleSlugRecent}`);
	});

	test('article with longest title renders (headline overflow guard)', async ({ page }) => {
		const { articleSlugLongestTitle } = await getSanityFixtures();
		if (!articleSlugLongestTitle) {
			test.skip(true, 'No article with a title found');
			return;
		}
		await assertPageHealth(page, `${BASE}/blog/article/${articleSlugLongestTitle}`);
	});

	test('article without a featured image renders (null image guard)', async ({ page }) => {
		const { articleSlugNoImage } = await getSanityFixtures();
		if (!articleSlugNoImage) {
			test.skip(true, 'All articles in dataset have a featured image');
			return;
		}
		await assertPageHealth(page, `${BASE}/blog/article/${articleSlugNoImage}`);
		// Verify the article body still renders even without a hero image.
		await expect(page.locator('main[role="main"]')).toBeVisible();
	});
});

test.describe('Blog section/category template', () => {
	test('category page renders', async ({ page }) => {
		const { categorySlug } = await getSanityFixtures();
		if (!categorySlug) {
			test.skip(true, 'No published category with a slug found');
			return;
		}
		await assertPageHealth(page, `${BASE}/blog/section/${categorySlug}`);
	});
});

test.describe('Blog tag/topic template', () => {
	test('topic page renders', async ({ page }) => {
		const { topicSlug } = await getSanityFixtures();
		if (!topicSlug) {
			test.skip(true, 'No published topic with a slug found');
			return;
		}
		await assertPageHealth(page, `${BASE}/blog/tag/${topicSlug}`);
	});
});

test.describe('Glossary term template', () => {
	test('glossary term page renders', async ({ page }) => {
		const { glossaryTermSlug } = await getSanityFixtures();
		if (!glossaryTermSlug) {
			test.skip(true, 'No published glossary term found');
			return;
		}
		await assertPageHealth(page, `${BASE}/political-terms/${glossaryTermSlug}`);
		// Term heading must be visible (it is the <h1>).
		await expect(page.locator('h1').first()).toBeVisible();
	});

	test('glossary letter-index page renders', async ({ page }) => {
		// The "a" letter page is the most populated — safe to hardcode.
		await assertPageHealth(page, `${BASE}/political-terms/a`);
	});
});

test.describe('Landing page template (/[slug])', () => {
	test('landing page renders', async ({ page }) => {
		const { landingPageSlug } = await getSanityFixtures();
		if (!landingPageSlug) {
			test.skip(true, 'No non-special landing page found');
			return;
		}
		await assertPageHealth(page, `${BASE}/${landingPageSlug}`);
	});
});

test.describe('Elections pages', () => {
	test('state elections page renders', async ({ page }) => {
		// California is large and consistently populated — stable test target.
		await assertPageHealth(page, `${BASE}/elections/ca`);
	});

	test('unknown slug returns 404 (not 500)', async ({ page }) => {
		// Guards against the /[slug] catch-all accidentally throwing instead of calling notFound().
		const response = await page.goto(`${BASE}/this-slug-does-not-exist-e2e-test`);
		expect(response?.status()).toBe(404);
	});
});

// ---------------------------------------------------------------------------
// Shell: header and footer on every page
// ---------------------------------------------------------------------------

test.describe('Site shell', () => {
	test('header is present on the homepage', async ({ page }) => {
		await page.goto(`${BASE}/`);
		await expect(page.locator('header[data-component="Header"]')).toBeAttached();
	});

	test('footer is present on the homepage', async ({ page }) => {
		await page.goto(`${BASE}/`);
		await expect(page.locator('footer')).toBeAttached();
	});
});
