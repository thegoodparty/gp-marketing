import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * Pins the redesigned location hero (Figma 3096-2855, built 2026-09-17): the stat
 * cards beside the headline, and the search input that moved out to its own block.
 *
 * Drives the real section off the shipped template seed rather than hand-built
 * props, because the wiring is the risk: the cards come from the shared `stats`
 * group, so the seed, the schema and the field names `resolveStats` reads all have
 * to agree. A block that renders nothing is this repo's classic failure mode, and
 * it is not a type error.
 */

const DOM_GLOBALS = [
	'Node',
	'NodeFilter',
	'Element',
	'HTMLElement',
	'HTMLAnchorElement',
	'DocumentFragment',
	'DOMRect',
	'Event',
	'CustomEvent',
	'MouseEvent',
	'KeyboardEvent',
	'FocusEvent',
	'MutationObserver',
] as const;

let dom: JSDOM;
let root: Root | null = null;

beforeEach(() => {
	dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
		url: 'http://localhost/elections/il',
		pretendToBeVisual: true,
	});
	const { window } = dom;

	globalThis.window = window as unknown as Window & typeof globalThis;
	globalThis.document = window.document;
	globalThis.navigator = window.navigator;
	globalThis.getComputedStyle = window.getComputedStyle.bind(window);

	for (const name of DOM_GLOBALS) {
		(globalThis as Record<string, unknown>)[name] = (window as unknown as Record<string, unknown>)[name];
	}

	(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(async () => {
	await unmount();
	dom.window.close();
});

async function unmount() {
	const current = root;
	root = null;
	if (!current) return;
	await act(async () => {
		current.unmount();
	});
}

async function render(element: React.ReactElement) {
	await unmount();
	await act(async () => {
		root = createRoot(document.getElementById('root')!);
		root.render(element);
		await new Promise<void>(resolve => {
			dom.window.setTimeout(resolve, 0);
		});
	});
}

/** The location hero exactly as the state index template seed ships it. */
async function renderSeededHero(withStats = true) {
	const { tmplElectionsStateIndexSections } = await import('~/lib/electionsTemplateSeedSections');
	const { LocationLandingPageHeroSection } = await import('./LocationLandingPageHeroSection');

	const seeded = tmplElectionsStateIndexSections.find(s => s._type === 'component_locationLandingPageHero');
	if (!seeded) throw new Error('no location hero in tmplElectionsStateIndexSections');

	const section = withStats ? seeded : { ...seeded, stats: undefined };
	const props = {
		...section,
		locationOverride: { locationLevel: 'state' as const, stateName: 'Illinois' },
		tokens: { '[State]': 'Illinois' },
	} as Parameters<typeof LocationLandingPageHeroSection>[0];

	await render(<LocationLandingPageHeroSection {...props} />);
	const hero = document.querySelector('[data-component="LocationLandingPageHero"]');
	if (!hero) throw new Error('location hero did not render');
	return hero;
}

describe('the location landing page hero', () => {
	test('renders the four seeded stat cards', async () => {
		const hero = await renderSeededHero();
		const cards = [...hero.querySelectorAll('[data-component="Stat"]')];

		expect(cards.map(card => card.textContent)).toEqual([
			'[##]days until the next election',
			'[##]positions up for election',
			'[##]independents on the ballot',
			'[##]uncontested elections in Illinois',
		]);
	});

	test('gives each card its design color', async () => {
		const hero = await renderSeededHero();
		const cards = [...hero.querySelectorAll('[data-component="Stat"]')];

		expect(cards.map(card => card.className)).toEqual([
			expect.stringContaining('bg-bright-yellow-100'),
			expect.stringContaining('bg-halo-green-100'),
			expect.stringContaining('bg-lavender-100'),
			expect.stringContaining('bg-blue-100'),
		]);
	});

	/**
	 * The cards are pastel, so white text inherited from the midnight section
	 * would make their copy invisible rather than fail anything.
	 */
	test('keeps the white text on the copy column, not the whole section', async () => {
		const hero = await renderSeededHero();

		expect(hero.className).not.toContain('text-white');
		expect(hero.querySelector('h1')?.parentElement?.className).toContain('text-white');
	});

	test('renders as a single column when no stats are authored', async () => {
		const hero = await renderSeededHero(false);

		expect(hero.querySelectorAll('[data-component="Stat"]').length).toBe(0);
		expect(hero.innerHTML).not.toContain('lg:grid-cols-');
	});

	test('has no search input, which now lives in its own block', async () => {
		const hero = await renderSeededHero();

		expect(hero.querySelectorAll('input').length).toBe(0);
	});
});
