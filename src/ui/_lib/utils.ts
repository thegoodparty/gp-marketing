import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge, type ConfigExtension } from 'tailwind-merge';
import { createTV } from 'tailwind-variants';

/*
 * Every font-size utility in our type scale has to be listed here by name.
 * tailwind-merge's `text-color` group matches any `text-*` value, so a size it
 * does not recognise is treated as a colour: `text-body-2 text-neutral-900`
 * merges as two colours and the SIZE IS SILENTLY DROPPED, leaving text at the
 * inherited size. It still renders plausibly, so it is invisible without
 * measuring. The list must stay in sync with the `--text-*` tokens in
 * `_styles/typography.css`; `typeScaleMerge.test.ts` fails if it drifts.
 *
 * `extend` (not `override`) so tailwind-merge keeps its own font-size handling
 * — notably arbitrary lengths like `text-[0.875rem]`, which an override drops
 * into the colour group and loses the same way.
 */
const fontSizeUtilities = [
	'heading-xl',
	'heading-lg',
	'heading-md',
	'heading-sm',
	'heading-xs',
	'section-heading',
	'section-subheading',
	'subtitle-1',
	'subtitle-2',
	'body-1',
	'body-xl',
	'body-2',
	'body-large',
	'overline',
	'caption',
	'text-9xl',
	'text-8xl',
	'text-7xl',
	'text-6xl',
	'text-5xl',
	'text-4xl',
	'text-3xl',
	'text-2xl',
	'text-xl',
	'text-lg',
	'text-md',
	'text-sm',
	'text-xs',
	'text-875',
];

const tailwindMergeConfig: ConfigExtension<never, never> = {
	extend: {
		classGroups: {
			'font-size': [
				{
					// Check if string ends with a shirt size
					text: [...fontSizeUtilities, (value: string) => /^([a-z-]+-)?(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/.test(value)],
				},
			],
		},
	},
};

const twMerge = extendTailwindMerge(tailwindMergeConfig);

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const tv = createTV({ twMergeConfig: tailwindMergeConfig });