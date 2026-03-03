import { defineMain } from '@storybook/nextjs/node';
import type { FrameworkOptions } from '@storybook/nextjs-vite';
import { mergeConfig } from 'vite';

export default defineMain({
	stories: [
		'../src/ui/**/*.@(mdx|stories.@(js|jsx|ts|tsx))',
		'../src/PageSections/**/*.@(mdx|stories.@(js|jsx|ts|tsx))',
		'../src/stories/*.@(mdx|stories.@(js|jsx|ts|tsx))',
		'../src/sanity/**/*.@(mdx|stories.@(js|jsx|ts|tsx))',
	],
	addons: [
		"@storybook/addon-designs",
		"@storybook/addon-themes",
		"@storybook/addon-a11y",
		"storybook-addon-tag-badges",
		"@storybook/addon-links",
		"@storybook/addon-docs",
		"@storybook/addon-vitest",
		// "@chromatic-com/storybook"
	],
	framework: {
		name: "@storybook/nextjs-vite",
		options: {

		} satisfies FrameworkOptions
	},
	staticDirs: [
		"../public"
	],
	async viteFinal(config) {
		const storybookHost = process.env.STORYBOOK_HOST || 'localhost';
		const isCustomHost = storybookHost !== 'localhost';

		return mergeConfig(config, {
			server: {
				host: '0.0.0.0', // listen on all interfaces
				...(isCustomHost && {
					hmr: {
						host: storybookHost,
						clientPort: 443, // HTTPS port for tunneling services
					},
					origin: `https://${storybookHost}`, // HTTPS origin for tunneling services
				}),
			},
		});
	},
});