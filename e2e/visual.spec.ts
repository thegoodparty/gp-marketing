/**
 * Visual regression tests.
 *
 * Takes full-page screenshots at desktop (1280×720) and mobile (390×844) and
 * compares them against committed baselines. The `stabilizePage()` helper is
 * called before every snapshot to ensure a deterministic render state:
 *   - All CSS animations and transitions are disabled.
 *   - Web fonts are fully loaded.
 *   - All images have settled (loaded or errored).
 *   - Date strings are replaced with "[DATE]" to prevent churn on publish.
 *
 * FIRST RUN — creating baselines:
 *   E2E_BASE_URL=https://goodparty.org playwright test e2e/visual.spec.ts --update-snapshots
 *
 *   Commit the generated files in e2e/snapshots/ to source control. They are
 *   the reference every future run compares against.
 *
 * UPDATING BASELINES after an intentional design change:
 *   playwright test e2e/visual.spec.ts --update-snapshots
 *   Review the diff with: playwright show-report
 *   Commit the updated snapshots with a note in the PR description.
 *
 * ENVIRONMENT NOTE:
 *   Snapshots are pixel-perfect against the machine that generated them. Font
 *   rendering differs between macOS, Windows, and Linux. Run baseline generation
 *   inside the official Playwright Docker image to produce baselines that match
 *   CI exactly:
 *     docker run --rm -v $(pwd):/work -w /work mcr.microsoft.com/playwright:v1.49.0-jammy \
 *       playwright test e2e/visual.spec.ts --update-snapshots
 *
 * CONTENT VOLATILITY NOTE:
 *   Dynamic sections (homepage blog block, "latest articles") will still cause
 *   diffs when new articles are published because the article titles and images
 *   change. maxDiffPixelRatio: 0.03 absorbs minor rendering noise but not
 *   content changes. If this proves too noisy:
 *   - Option A: Use a frozen Sanity dataset (SANITY_TEST_DATASET=snapshot).
 *     Pro: fully deterministic. Con: needs manual maintenance to stay representative.
 *   - Option B: Mask the blog block sections using their bounding boxes.
 *     Pro: no extra dataset. Con: masks real content changes in those areas.
 *   Raise the trade-off with the team before choosing.
 */

import { test, expect } from '@playwright/test';
import { getSanityFixtures } from './helpers/sanity-fixtures';
import { stabilizePage } from './helpers/stabilize';

const BASE = (process.env['E2E_BASE_URL'] ?? 'https://goodparty.org').replace(/\/+$/, '');

// ---------------------------------------------------------------------------
// Shared screenshot helper
// ---------------------------------------------------------------------------

async function snapshot(
	context: Parameters<typeof test.step>[1] extends (args: infer A) => unknown ? A : never,
	name: string,
	url: string,
) {
	const { page } = context as { page: ReturnType<typeof test['info']> extends { page: infer P } ? P : never };
	return page;
}

// The test runner provides `page` as a fixture; we use a closure to keep DRY.

// ---------------------------------------------------------------------------
// Fixed pages
// ---------------------------------------------------------------------------

test.describe('Homepage', () => {
	test('full-page snapshot', async ({ page }) => {
		await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
		await stabilizePage(page);
		await expect(page).toHaveScreenshot('homepage.png', { fullPage: true });
	});
});

test.describe('Blog index', () => {
	test('full-page snapshot', async ({ page }) => {
		await page.goto(`${BASE}/blog`, { waitUntil: 'domcontentloaded' });
		await stabilizePage(page);
		await expect(page).toHaveScreenshot('blog-index.png', { fullPage: true });
	});
});

test.describe('Contact page', () => {
	test('full-page snapshot', async ({ page }) => {
		await page.goto(`${BASE}/contact`, { waitUntil: 'domcontentloaded' });
		await stabilizePage(page);
		await expect(page).toHaveScreenshot('contact.png', { fullPage: true });
	});
});

test.describe('Glossary index', () => {
	test('full-page snapshot', async ({ page }) => {
		await page.goto(`${BASE}/political-terms`, { waitUntil: 'domcontentloaded' });
		await stabilizePage(page);
		await expect(page).toHaveScreenshot('glossary-index.png', { fullPage: true });
	});
});

// ---------------------------------------------------------------------------
// Dynamic templates — one stable instance per template
// ---------------------------------------------------------------------------

test.describe('Blog article template', () => {
	test('oldest article snapshot (most stable content)', async ({ page }) => {
		// The oldest article changes least often — best baseline stability.
		const { articleSlugOldest } = await getSanityFixtures();
		if (!articleSlugOldest) {
			test.skip(true, 'No article found in dataset');
			return;
		}
		await page.goto(`${BASE}/blog/article/${articleSlugOldest}`, { waitUntil: 'domcontentloaded' });
		await stabilizePage(page);
		await expect(page).toHaveScreenshot('article.png', { fullPage: true });
	});
});

test.describe('Blog category/section template', () => {
	test('category page snapshot', async ({ page }) => {
		const { categorySlug } = await getSanityFixtures();
		if (!categorySlug) {
			test.skip(true, 'No category found in dataset');
			return;
		}
		await page.goto(`${BASE}/blog/section/${categorySlug}`, { waitUntil: 'domcontentloaded' });
		await stabilizePage(page);
		await expect(page).toHaveScreenshot('blog-category.png', { fullPage: true });
	});
});

test.describe('Blog topic/tag template', () => {
	test('topic page snapshot', async ({ page }) => {
		const { topicSlug } = await getSanityFixtures();
		if (!topicSlug) {
			test.skip(true, 'No topic found in dataset');
			return;
		}
		await page.goto(`${BASE}/blog/tag/${topicSlug}`, { waitUntil: 'domcontentloaded' });
		await stabilizePage(page);
		await expect(page).toHaveScreenshot('blog-topic.png', { fullPage: true });
	});
});

test.describe('Glossary term template', () => {
	test('glossary term snapshot', async ({ page }) => {
		const { glossaryTermSlug } = await getSanityFixtures();
		if (!glossaryTermSlug) {
			test.skip(true, 'No glossary term found in dataset');
			return;
		}
		await page.goto(`${BASE}/political-terms/${glossaryTermSlug}`, { waitUntil: 'domcontentloaded' });
		await stabilizePage(page);
		await expect(page).toHaveScreenshot('glossary-term.png', { fullPage: true });
	});
});

test.describe('Landing page template', () => {
	test('landing page snapshot', async ({ page }) => {
		const { landingPageSlug } = await getSanityFixtures();
		if (!landingPageSlug) {
			test.skip(true, 'No landing page found in dataset');
			return;
		}
		await page.goto(`${BASE}/${landingPageSlug}`, { waitUntil: 'domcontentloaded' });
		await stabilizePage(page);
		await expect(page).toHaveScreenshot('landing-page.png', { fullPage: true });
	});
});
