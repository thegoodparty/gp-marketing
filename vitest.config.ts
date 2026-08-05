import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

const currentDir = dirname(fileURLToPath(import.meta.url));

// Runs Storybook stories (their `play`/a11y assertions) as headless Vitest
// browser tests. This is intentionally scoped to ONLY stories via the
// storybookTest plugin's default include — the repo's `*.test.ts` files run
// under `bun test` and must not be picked up here.
export default defineConfig({
	test: {
		// Vitest 3.x: use `projects` to isolate the Storybook test project from
		// any other Vitest usage.
		projects: [
			{
				extends: true,
				plugins: [
					storybookTest({
						// Location of the Storybook config (main.ts).
						configDir: join(currentDir, '.storybook'),
						// Matches the package.json script used to run Storybook.
						storybookScript: 'bun run sb:dev --no-open',
					}),
				],
				test: {
					name: 'storybook',
					// Never let this project capture the bun-native `*.test.ts` files.
					exclude: ['**/node_modules/**', '**/*.test.{ts,tsx,js,jsx}'],
					browser: {
						enabled: true,
						provider: 'playwright',
						headless: true,
						instances: [{ browser: 'chromium' }],
					},
					setupFiles: ['./.storybook/vitest.setup.ts'],
				},
			},
		],
	},
});
