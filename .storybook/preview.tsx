import { Outfit } from 'next/font/google';
import { Open_Sans } from 'next/font/google';
import * as storybookAddonTagBadges from 'storybook-addon-tag-badges/preview';
import { definePreview, type NextJsParameters } from '@storybook/nextjs';
import addonA11y, { type A11yParameters } from '@storybook/addon-a11y';
import addonDocs, { type DocsTypes } from '@storybook/addon-docs';
import addonLinks from '@storybook/addon-links';
import type { Config } from '@storybook/addon-designs';
import addonThemes, { type ThemesTypes } from '@storybook/addon-themes';
import addonVite from '@storybook/addon-vitest';
import { definePreviewAddon } from 'storybook/internal/csf';
import '../src/ui/_styles/globals.css';

const primaryFont = Outfit({
	display: 'swap',
	preload: true,
	subsets: ['latin'],
	variable: '--font-primary',
	weight: ['400', '600'],
});

const secondaryFont = Open_Sans({
	display: 'swap',
	preload: true,
	subsets: ['latin'],
	variable: '--font-secondary',
	weight: ['400', '600'],
});
function addonDesigns() {
	return definePreviewAddon<{ parameters: { design?: Config } }>({ parameters: {} });
}
function addonTagBadge() {
	return definePreviewAddon<{ parameters: { tagBadges?: typeof storybookAddonTagBadges } }>({ parameters: {} });
}

export default definePreview({
	addons: [addonDesigns(), addonA11y(), addonLinks(), addonThemes(), addonDocs(), addonVite(), addonTagBadge()],
	parameters: {
		a11y: {
			disable: false,
			test: 'error',
		} satisfies A11yParameters,
		options: {
			storySort: {
				method: 'configure',
				includeNames: true,
				order: [
					'Base',
					'Atoms',
					['Button', ['Primary', 'Primary Color Bg', 'Secondary', 'Secondary Inverse', 'Ghost', 'Ghost Inverse']],
					'Molecules',
					'Components',
					'Page Sections',
					'Content Sections',
				],
			},
		},
		docs: {
			disable: false,
			codePanel: false,
		} satisfies DocsTypes['parameters']['docs'],
		themes: {
			disable: false,
		} satisfies ThemesTypes['parameters']['themes'],
		controls: {
			disable: false,
			sort: 'requiredFirst',
			disableSaveFromUI: false,
			exclude: ['style', 'className', 'children'],
			matchers: {
				// color: /(background|color)$/i,
				// date: /Date$/i,
			},
		},
		test: {
			dangerouslyIgnoreUnhandledErrors: false,
			throwPlayFunctionExceptions: true,
		},
		actions: {
			disable: false,
			// argTypesRegex: '^on[A-Z].*',
			// handles: []
		},
		backgrounds: {
			disable: false,
			options: {
				default: {
					name: 'default',
					value: 'var(--goodparty-cream)',
				},
			},
			default: 'default',
			grid: {
				cellSize: 4,
				opacity: 0.5,
				cellAmount: 4,
				offsetX: 0,
				offsetY: 0,
			},
		},
		highlight: {
			disable: false,
		},
		measure: {
			disable: false,
		},
		outline: {
			disable: false,
		},
		layout: undefined,
		viewport: {
			options: {
				se: {
					type: 'mobile',
					name: 'iPhone SE',
					styles: {
						height: '568px',
						width: '320px',
					},
				},
				mini: {
					type: 'mobile',
					name: 'iPhone Mini',
					styles: {
						height: '780px',
						width: '360px',
					},
				},
				iphone: {
					type: 'mobile',
					name: 'iPhone',
					styles: {
						height: '852px',
						width: '393px',
					},
				},
				max: {
					type: 'mobile',
					name: 'iPhone Max',
					styles: {
						height: '932px',
						width: '430px',
					},
				},
				ipad: {
					type: 'tablet',
					name: 'iPad Air 10.9"',
					styles: {
						height: '1180px',
						width: '820px',
					},
				},
				ipadPro: {
					type: 'tablet',
					name: 'iPad Pro 12.9"',
					styles: {
						height: '1366px',
						width: '1024px',
					},
				},
				macbook13: {
					type: 'desktop',
					name: 'Macbook Air 13"',
					styles: {
						height: '800px',
						width: '1280px',
					},
				},
				macbook16: {
					type: 'desktop',
					name: 'Macbook Pro 16"',
					styles: {
						height: '960px',
						width: '1536px',
					},
				},
				hd: {
					type: 'desktop',
					name: 'HD monitor',
					styles: {
						height: '1080px',
						width: '1920px',
					},
				},
			},
		},
		nextjs: {
			appDirectory: true,
		} satisfies NextJsParameters['nextjs'],
	},
	decorators: [
		Story => (
			<div
				id='__next'
				className={`bg-background-primary ${primaryFont.variable} ${primaryFont.className} ${secondaryFont.variable} ${secondaryFont.className} `}
			>
				<div className='font-primary'>
					<Story />
				</div>
			</div>
		),
	],
});
