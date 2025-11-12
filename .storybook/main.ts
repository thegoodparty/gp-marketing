import { defineMain } from '@storybook/nextjs/node';
import type { FrameworkOptions } from '@storybook/nextjs-vite';

export default defineMain({
	stories: [
		'../src/ui/**/*.@(mdx|stories.@(js|jsx|ts|tsx))',
		'../src/stories/*.@(mdx|stories.@(js|jsx|ts|tsx))',
	],
	addons: [
		"@storybook/addon-designs",
		"@storybook/addon-themes",
		"@storybook/addon-a11y",
		"storybook-addon-tag-badges",
		"@storybook/addon-links",
		"@storybook/addon-docs",
		"@storybook/addon-vitest",
		"storybook-addon-tag-badges",
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
});