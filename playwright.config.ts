import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env['CI'],
	retries: process.env['CI'] ? 2 : 0,
	workers: process.env['CI'] ? 1 : undefined,
	reporter: 'html',
	use: {
		baseURL: process.env['E2E_BASE_URL'] ?? 'https://goodparty.org',
		trace: 'on-first-retry',
	},
	expect: {
		toHaveScreenshot: {
			// Allow up to 3% pixel difference to absorb minor anti-aliasing and
			// sub-pixel rendering differences between machines/OS versions.
			// Increase to 0.05 if font rendering differences cause flakiness
			// between environments — the Playwright Docker image eliminates this.
			maxDiffPixelRatio: 0.03,
			// Animated elements are frozen by stabilizePage() before snapshots
			// are taken, but this provides a second layer of protection.
			animations: 'disabled',
		},
	},
	projects: [
		{
			name: 'chromium-desktop',
			use: { ...devices['Desktop Chrome'] }, // 1280×720
		},
		{
			name: 'chromium-mobile',
			use: { ...devices['iPhone 14'] }, // 390×844
		},
	],
	snapshotPathTemplate: '{testDir}/snapshots/{testFilePath}/{arg}-{projectName}{ext}',
});
