import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { cn } from './_lib/utils.ts';
import { TextInput } from './Inputs/TextInput.tsx';

/**
 * Guards the type scale against tailwind-merge's `text-color` group, which
 * matches any `text-*` value. A font size the merge config does not know by
 * name is treated as a colour, so `text-body-2 text-neutral-900` merges as two
 * colours and the SIZE IS DROPPED — text falls back to the inherited size and
 * still looks plausible, which is why this went unnoticed in `TextInput`,
 * `ListOfOfficesBlock` and `FAQLinksBlock` until it was measured. It cut both
 * ways: written colour-first, the COLOUR was dropped instead, which is how
 * every `Button` lost the `text-black` in its base.
 *
 * The parity test below is the important one: it fails when a `--text-*` token
 * is added to `_styles/typography.css` without being added to
 * `fontSizeUtilities` in `_lib/utils.ts`, which is the only way this class of
 * bug can come back.
 */

const typographyCss = readFileSync(new URL('./_styles/typography.css', import.meta.url), 'utf8');

// Base tokens only — skip the `--line-height` / `--letter-spacing` /
// `--font-weight` sub-properties, which are not utility names.
const scaleTokens = [
	...new Set([...typographyCss.matchAll(/^\s*--text-([a-z0-9-]+):/gim)].flatMap(match => (match[1] ? [match[1]] : []))),
].filter(token => token !== '*' && !token.includes('--'));

describe('type scale survives class merging', () => {
	test('typography.css and the merge config agree on every token', () => {
		expect(scaleTokens.length).toBeGreaterThan(0);

		const dropped = scaleTokens.filter(token => !cn(`text-${token} text-neutral-900`).includes(`text-${token}`));

		expect(dropped).toEqual([]);
	});

	test('a size survives a colour whichever order they are written in', () => {
		expect(cn('text-body-2 text-neutral-900')).toBe('text-body-2 text-neutral-900');
		expect(cn('text-neutral-900 text-body-2')).toBe('text-neutral-900 text-body-2');
	});

	// An `override` config drops tailwind-merge's own font-size handling, which
	// loses arbitrary lengths the same way named tokens were being lost.
	test('arbitrary font sizes survive a colour', () => {
		expect(cn('text-[0.875rem] text-white')).toBe('text-[0.875rem] text-white');
		expect(cn('text-[14px] text-black')).toBe('text-[14px] text-black');
	});

	test('genuine conflicts still collapse', () => {
		expect(cn('text-body-2 text-body-1')).toBe('text-body-1');
		expect(cn('text-neutral-600 text-neutral-900')).toBe('text-neutral-900');
		// arbitrary COLOUR, not a length — must lose to the later colour
		expect(cn('text-[#fff] text-neutral-900')).toBe('text-neutral-900');
	});

	test('sizes at different breakpoints do not collide', () => {
		expect(cn('text-heading-md md:text-heading-lg')).toBe('text-heading-md md:text-heading-lg');
	});

	test('non-size text utilities are left alone', () => {
		expect(cn('text-body-2 text-center text-neutral-900')).toBe('text-body-2 text-center text-neutral-900');
	});
});

describe('components keep their type scale', () => {
	test('TextInput renders its input and error sizes', () => {
		const markup = renderToStaticMarkup(createElement(TextInput, { label: 'Email', error: 'Required' }));

		expect(markup).toContain('text-body-2');
		expect(markup).toContain('text-caption');
	});
});
