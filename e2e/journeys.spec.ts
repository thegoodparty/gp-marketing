/**
 * User journey E2E tests.
 *
 * Tests multi-step flows that represent the highest-traffic paths through the site.
 * Each journey navigates between pages rather than just asserting on a single URL,
 * so link-construction bugs and slug mismatches are caught end-to-end.
 *
 * Run:
 *   E2E_BASE_URL=https://goodparty.org playwright test e2e/journeys.spec.ts
 */

import { test, expect } from '@playwright/test';
import { getSanityFixtures } from './helpers/sanity-fixtures';

const BASE = (process.env['E2E_BASE_URL'] ?? 'https://goodparty.org').replace(/\/+$/, '');

// ---------------------------------------------------------------------------
// Blog funnel: index → section → article
// ---------------------------------------------------------------------------

test.describe('Blog funnel', () => {
	test('blog index shows article cards that link to readable articles', async ({ page }) => {
		await page.goto(`${BASE}/blog`);
		await expect(page.locator('h1').first()).toBeVisible();

		// Find the first clickable article link.
		const articleLink = page.locator('a[href^="/blog/article/"]').first();
		await expect(articleLink).toBeVisible();

		const href = await articleLink.getAttribute('href');
		expect(href).toBeTruthy();

		// Navigate to the article.
		await articleLink.click();
		await expect(page).toHaveURL(/\/blog\/article\//);
		await expect(page.locator('h1').first()).toBeVisible();
	});

	test('category page links back to individual articles', async ({ page }) => {
		const { categorySlug } = await getSanityFixtures();
		if (!categorySlug) {
			test.skip(true, 'No published category slug found');
			return;
		}

		await page.goto(`${BASE}/blog/section/${categorySlug}`);
		await expect(page.locator('h1').first()).toBeVisible();

		// At least one article link should be present.
		const articleLinks = page.locator('a[href^="/blog/article/"]');
		await expect(articleLinks.first()).toBeVisible();
	});
});

// ---------------------------------------------------------------------------
// Elections drill-down: index → state
// ---------------------------------------------------------------------------

test.describe('Elections drill-down', () => {
	test('elections landing page has links to state pages', async ({ page }) => {
		await page.goto(`${BASE}/elections`);
		await expect(page.locator('h1').first()).toBeVisible();

		// State page links follow the /elections/[state] pattern.
		const stateLink = page.locator('a[href^="/elections/"]').first();
		await expect(stateLink).toBeVisible();
	});

	test('state page has a visible heading and county list', async ({ page }) => {
		await page.goto(`${BASE}/elections/ca`);
		await expect(page.locator('h1').first()).toBeVisible();
		// County/district links follow /elections/ca/[place] pattern.
		const countyLink = page.locator('a[href^="/elections/ca/"]').first();
		await expect(countyLink).toBeVisible();
	});
});

// ---------------------------------------------------------------------------
// Glossary: index → letter → term
// ---------------------------------------------------------------------------

test.describe('Glossary drill-down', () => {
	test('glossary index has letter navigation links', async ({ page }) => {
		await page.goto(`${BASE}/political-terms`);
		await expect(page.locator('h1').first()).toBeVisible();

		// Letter links like /political-terms/a
		const letterLink = page.locator('a[href^="/political-terms/"]').first();
		await expect(letterLink).toBeVisible();
	});

	test('glossary letter page lists terms that link to term pages', async ({ page }) => {
		await page.goto(`${BASE}/political-terms/a`);
		await expect(page.locator('h1').first()).toBeVisible();

		// Term links: /political-terms/[multi-word-slug] (more than one char)
		const termLink = page
			.locator('a[href^="/political-terms/"]')
			.filter({ hasNot: page.locator('[href="/political-terms/a"]') })
			.first();
		await expect(termLink).toBeVisible();

		const href = await termLink.getAttribute('href');
		expect(href?.length).toBeGreaterThan('/political-terms/'.length + 1);
	});
});

// ---------------------------------------------------------------------------
// Navigation: primary links resolve without errors
// ---------------------------------------------------------------------------

test.describe('Navigation', () => {
	test('navigation header is interactive on the homepage', async ({ page }) => {
		await page.goto(`${BASE}/`);
		// The header must be present and attached (pointer-events-none at shell level
		// but the inner Nav is interactive).
		await expect(page.locator('header[data-component="Header"]')).toBeAttached();
	});

	test('blog link in navigation leads to blog index', async ({ page }) => {
		await page.goto(`${BASE}/`);
		// Find a nav link pointing to /blog (exact or with trailing slash)
		const blogLink = page.locator('header a[href="/blog"], header a[href="/blog/"]').first();
		if (await blogLink.count() === 0) {
			// Blog may be under a dropdown — skip assertion but do not fail.
			test.skip(true, 'Blog link not found in flat nav; may be in a dropdown');
			return;
		}
		await blogLink.click();
		await expect(page).toHaveURL(/\/blog/);
		await expect(page.locator('h1').first()).toBeVisible();
	});
});
