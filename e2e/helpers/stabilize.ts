/**
 * stabilizePage — prepares a Playwright page for a deterministic screenshot.
 *
 * Steps:
 *  1. Inject CSS that disables all animations, transitions, and scroll-triggered
 *     effects so elements render in their final state.
 *  2. Scroll to the bottom of the page to trigger lazy-loaded images and then
 *     back to the top so the screenshot starts from position 0.
 *  3. Wait for document.fonts.ready so web fonts are fully applied.
 *  4. Wait for all <img> elements to finish loading so no broken-image icons
 *     appear in snapshots.
 *  5. Replace date-like text patterns with the literal string "[DATE]" so that
 *     article publication/update dates, election dates, and similar volatile
 *     strings do not cause snapshot mismatches on every run.
 *
 * Limitations: content changes (new hero text, reordered article cards) will
 * still produce diffs. See docs/testing-plan.md §Layer 4 for the trade-off
 * between masked/frozen content and a frozen Sanity test dataset.
 */

import type { Page } from '@playwright/test';

const DISABLE_ANIMATIONS_CSS = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    scroll-behavior: auto !important;
  }
`;

/** Matches formatted dates produced by date-fns: "Jun 11, 2026", "Updated: Jun 11, 2026" */
const DATE_PATTERN =
	/(?:Updated:\s+)?(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}/g;

export async function stabilizePage(page: Page): Promise<void> {
	// 1. Disable animations before any rendering so they never start.
	await page.addStyleTag({ content: DISABLE_ANIMATIONS_CSS });

	// 2. Lazy-load trigger: scroll to bottom then back to top.
	await page.evaluate(() => {
		window.scrollTo({ top: document.body.scrollHeight });
	});
	await page.evaluate(() => {
		window.scrollTo({ top: 0 });
	});

	// 3. Wait for web fonts.
	await page.evaluate(() => document.fonts.ready);

	// 4. Wait for all images to settle (loaded or errored).
	await page.evaluate(() => {
		const imgs = [...document.querySelectorAll('img')] as HTMLImageElement[];
		const pending = imgs.filter(img => !img.complete);
		if (pending.length === 0) return;
		return Promise.all(
			pending.map(
				img =>
					new Promise<void>(resolve => {
						img.addEventListener('load', () => resolve(), { once: true });
						img.addEventListener('error', () => resolve(), { once: true });
					}),
			),
		);
	});

	// 5. Replace volatile date strings with a fixed placeholder so that
	//    publication/update dates don't trigger snapshot diffs on every run.
	await page.evaluate(pattern => {
		const re = new RegExp(pattern, 'g');
		function walk(node: Node) {
			if (node.nodeType === Node.TEXT_NODE) {
				const text = node.textContent ?? '';
				if (re.test(text)) {
					// Reset lastIndex after test() consumed it.
					re.lastIndex = 0;
					node.textContent = text.replace(re, '[DATE]');
				}
				re.lastIndex = 0;
			} else {
				for (const child of [...node.childNodes]) {
					walk(child);
				}
			}
		}
		walk(document.body);
	}, DATE_PATTERN.source);
}
