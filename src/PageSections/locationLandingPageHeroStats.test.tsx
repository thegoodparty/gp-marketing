import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * Pins the redesigned location hero (Figma 2032-21473, updated 2026-09-24): the
 * stat cards and jump buttons beside and under the copy, the search input that
 * moved out to its own block, and the headline the page hands in.
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

	// The animated value watches for the card scrolling into view; jsdom has no
	// observer, and one that never fires leaves the count at its starting zero.
	class NoopIntersectionObserver {
		public observe() {}
		public unobserve() {}
		public disconnect() {}
		public takeRecords() {
			return [];
		}
	}
	(globalThis as { IntersectionObserver?: unknown }).IntersectionObserver = NoopIntersectionObserver;
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

	// The seed array is a union of every block on the template, so name the one shape this reads.
	type SeededHero = {
		locationLandingPageHeroContent?: {
			list_buttons?: Array<{
				_key: string;
				field_ctaActionWithShared: string;
				field_buttonHierarchy: string;
				field_buttonText: string;
				field_anchorId: string;
			}>;
		};
	};
	const seeded = tmplElectionsStateIndexSections.find(s => s._type === 'component_locationLandingPageHero');
	if (!seeded) throw new Error('no location hero in tmplElectionsStateIndexSections');
	const seededContent = (seeded as SeededHero).locationLandingPageHeroContent;

	// GROQ turns the seed's `field_anchorId` into the `anchor` the button
	// transformer reads, so the buttons go in the way the query hands them over.
	const projectedButtons = (seededContent?.list_buttons ?? []).map(button => ({
		_key: button._key,
		action: button.field_ctaActionWithShared,
		hierarchy: button.field_buttonHierarchy,
		text: button.field_buttonText,
		anchor: `#${button.field_anchorId}`,
	}));
	const section = withStats
		? {
				...seeded,
				locationLandingPageHeroContent: { ...seededContent, list_buttons: projectedButtons },
			}
		: { ...seeded, stats: undefined, locationLandingPageHeroContent: undefined };
	const props = {
		...section,
		locationOverride: {
			headline: 'Upcoming elections in Illinois',
			locationLevel: 'state' as const,
			stateName: 'Illinois',
		},
		tokens: { '[State]': 'Illinois' },
	} as unknown as Parameters<typeof LocationLandingPageHeroSection>[0];

	await render(<LocationLandingPageHeroSection {...props} />);
	const hero = document.querySelector('[data-component="LocationLandingPageHero"]');
	if (!hero) throw new Error('location hero did not render');
	return hero;
}

describe('the location landing page hero', () => {
	test('renders the three seeded stat cards', async () => {
		const hero = await renderSeededHero();
		const cards = [...hero.querySelectorAll('[data-component="Stat"]')];

		expect(cards.map(card => card.textContent)).toEqual([
			'[Date]Election day',
			'[##]Races on the ballot',
			'[##]Independent candidates',
		]);
	});

	test('gives each card its design color', async () => {
		const hero = await renderSeededHero();
		const cards = [...hero.querySelectorAll('[data-component="Stat"]')];

		expect(cards.map(card => card.className)).toEqual([
			expect.stringContaining('bg-bright-yellow-100'),
			expect.stringContaining('bg-halo-green-100'),
			expect.stringContaining('bg-lavender-100'),
		]);
	});

	/**
	 * The route phrases the headline. When the block rebuilt it from the location
	 * parts instead, county pages published "Kane County, Upcoming elections in
	 * Kane County, Illinois".
	 */
	test('shows the headline the page hands in, verbatim', async () => {
		const hero = await renderSeededHero();

		expect(hero.querySelector('h1')?.textContent).toBe('Upcoming elections in Illinois');
	});

	test('renders the seeded jump buttons as anchors', async () => {
		const hero = await renderSeededHero();
		const links = [...hero.querySelectorAll('a')];

		expect(links.map(a => a.getAttribute('href'))).toEqual(['#local-races', '#all-elections']);
		expect(links.map(a => a.textContent)).toEqual([
			expect.stringContaining('Browse local races'),
			expect.stringContaining('Search all elections'),
		]);
		// The arrow is decoration, so it must not end up in the button's name.
		expect(links.every(a => a.querySelector('svg')?.getAttribute('aria-hidden') === 'true')).toBe(true);
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

	test('renders as a single column when nothing but copy is authored', async () => {
		const hero = await renderSeededHero(false);

		expect(hero.querySelectorAll('[data-component="Stat"]').length).toBe(0);
		expect(hero.querySelectorAll('a').length).toBe(0);
		expect(hero.innerHTML).not.toContain('lg:grid-cols-');
	});

	test('has no search input, which now lives in its own block', async () => {
		const hero = await renderSeededHero();

		expect(hero.querySelectorAll('input').length).toBe(0);
	});
});

describe('the hero stat cards', () => {
	/**
	 * The card values are a mix of counts and an election date. Counting a date up
	 * from zero renders "Nov. 0, 2026" on the way, which reads as broken data.
	 */
	test('counts a plain number up but leaves a date alone', async () => {
		const { Stat } = await import('~/ui/Stat');

		await render(
			<>
				<Stat value='1,240' description='Races on the ballot' size='compact' />
				<Stat value='Nov. 4, 2026' description='Election day' size='compact' />
			</>,
		);
		const [count, date] = [...document.querySelectorAll('[data-component="Stat"]')];

		// A count that has not scrolled into view yet still sits at its starting zero,
		// which is how we know it took the animated path. The date never should.
		expect(count?.textContent).toBe('0Races on the ballot');
		expect(date?.textContent).toBe('Nov. 4, 2026Election day');
	});
});
