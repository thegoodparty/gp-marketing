/**
 * Shared assertion helper used by E2E page specs.
 *
 * assertPageHealth navigates to a URL and checks that:
 *   1. The server responds with a non-error status (< 400).
 *   2. The page <h1> is visible.
 *   3. The site header and main content area are present.
 *   4. No React hydration errors appear in the console.
 *   5. No first-party network requests fail.
 *
 * Third-party script errors (Amplitude, GTM, HubSpot, VWO) are filtered out
 * because those scripts may not initialise in test environments without API keys.
 */

import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

const THIRD_PARTY_ERROR_PATTERNS = [
	/amplitude/i,
	/gtm/i,
	/hubspot/i,
	/hs-scripts/i,
	/hsforms/i,
	/vwo/i,
	/segment/i,
	/facebook/i,
	/fbevents/i,
];

function isThirdPartyError(text: string): boolean {
	return THIRD_PARTY_ERROR_PATTERNS.some(re => re.test(text));
}

export async function assertPageHealth(page: Page, url: string): Promise<void> {
	const appErrors: string[] = [];
	const failedRequests: string[] = [];

	const origin = new URL(url).origin;

	page.on('console', msg => {
		if (msg.type() !== 'error') return;
		const text = msg.text();
		// Hydration errors are always app errors regardless of origin.
		const isHydration = /hydrat|did not match/i.test(text);
		if (isHydration || !isThirdPartyError(text)) {
			appErrors.push(text);
		}
	});

	page.on('requestfailed', req => {
		try {
			if (new URL(req.url()).origin === origin) {
				failedRequests.push(req.url());
			}
		} catch {
			// Malformed URL — ignore.
		}
	});

	const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

	expect(response?.status() ?? 0, `Expected non-error status for ${url}`).toBeLessThan(400);

	// Page must have a visible <h1>.
	await expect(page.locator('h1').first()).toBeVisible();

	// Site shell: header and main content area must be present.
	await expect(page.locator('header[data-component="Header"]')).toBeAttached();
	await expect(page.locator('main[role="main"]')).toBeAttached();

	// Wait briefly for any async console messages to fire.
	await page.waitForTimeout(500);

	expect(appErrors, `App-level console errors on ${url}:\n${appErrors.join('\n')}`).toHaveLength(0);
	expect(failedRequests, `Failed first-party requests on ${url}:\n${failedRequests.join('\n')}`).toHaveLength(0);
}
