import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * Pins the single-column presentation the person-profile pledge band moved to
 * (2026-09-15, requested by Emily): one centered column of left-aligned pledge
 * elements, and one "Learn more" button under the whole band instead of one per
 * element.
 *
 * Drives the real section component off the shipped code seed rather than
 * hand-built props, because the wiring is the risk: `field_columnLayout12Columns`
 * and the section-level buttons are read with dot access here, but a block that
 * silently renders nothing is this repo's classic failure mode, and a green
 * typecheck does not prove the Sanity field names line up.
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
		url: 'http://localhost/people/example-person',
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

/** The pledge block exactly as the person-profile seed ships it. */
async function renderSeededPledge(pledgeOverride?: { button?: unknown }) {
	const { PERSON_PROFILE_SECTIONS } = await import('~/components/people/personProfileSections');
	const { GoodPartyOrgPledgeSection } = await import('./GoodPartyOrgPledgeSection');

	const section = PERSON_PROFILE_SECTIONS.find(s => s._type === 'component_goodPartyOrgPledge');
	if (!section) throw new Error('no pledge block in PERSON_PROFILE_SECTIONS');

	const props = { ...section, pledgeOverride } as Parameters<typeof GoodPartyOrgPledgeSection>[0];
	await render(<GoodPartyOrgPledgeSection {...props} />);
	const band = document.querySelector('[data-component="GoodPartyOrgPledge"]');
	if (!band) throw new Error('pledge band did not render');
	return band;
}

describe('the person-profile pledge band', () => {
	test('stacks the pledge elements in one centered column', async () => {
		const band = await renderSeededPledge();
		const grid = band.querySelector('.grid');
		if (!grid) throw new Error('no pledge grid');

		expect(grid.className).toContain('md:grid-cols-1');
		expect(grid.className).not.toContain('md:grid-cols-2');
		// A capped width plus auto side margins is what centers the column.
		expect(grid.className).toContain('mx-auto');
	});

	test('shows the three pledge elements, and not the retired Civility one', async () => {
		const band = await renderSeededPledge();
		const titles = [...band.querySelectorAll('h3')].map(h => h.textContent);

		expect(titles).toEqual(['Independent', 'People-First', 'Anti-Corruption']);
	});

	test('carries the intro line that frames the pledge', async () => {
		const band = await renderSeededPledge();

		expect(band.textContent).toContain('as long as they pledge to be:');
	});

	/**
	 * The band runs on every profile, including people who have not taken the
	 * pledge, so the copy has to describe the pledge rather than voice it. First
	 * person ("I will run and serve…") would make it a false statement about
	 * those people — the reason the band used to be claimed-only.
	 */
	test('describes the pledge in the third person', async () => {
		const band = await renderSeededPledge();
		const text = band.textContent ?? '';

		expect(text).toContain('Candidates run and serve as nonpartisan');
		expect(text).not.toMatch(/\bI will\b|\bmy funding\b|\bmy constituents\b/);
	});

	test('has one Learn more link for the whole band, pointing at /about', async () => {
		const band = await renderSeededPledge();
		const links = [...band.querySelectorAll('a')];

		expect(links.map(a => [a.textContent, a.getAttribute('href')])).toEqual([['Learn more', '/about']]);
	});

	test('carries the anchor the hero pledge line scrolls to', async () => {
		const { GOODPARTY_PLEDGE_ANCHOR_ID } = await import('./GoodPartyOrgPledgeSection');
		await renderSeededPledge();

		expect(document.getElementById(GOODPARTY_PLEDGE_ANCHOR_ID)).not.toBeNull();
	});

	test('a per-profile button override replaces the authored one', async () => {
		const band = await renderSeededPledge({ button: { buttonType: 'signup', label: 'Take the pledge' } });
		const links = [...band.querySelectorAll('a')];

		// One button still, and the authored "Learn more" is gone rather than joined.
		// `signup` adds the out-to-the-app arrow glyph, so match the label loosely.
		expect(links.length).toBe(1);
		expect(links[0]?.textContent).toContain('Take the pledge');
		expect(links[0]?.textContent).not.toContain('Learn more');
		expect(links[0]?.getAttribute('href')).toBe('https://app.goodparty.org/sign-up');
	});

	test('renders no per-element buttons', async () => {
		const band = await renderSeededPledge();
		// Every card is a direct child of the grid; the single band button lives
		// outside it, so any link or button inside the grid is a per-element CTA.
		const grid = band.querySelector('.grid');
		if (!grid) throw new Error('no pledge grid');

		expect(grid.querySelectorAll('a, button').length).toBe(0);
	});
});
