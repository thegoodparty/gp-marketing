import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const DOM_GLOBALS = ['Node', 'NodeFilter', 'Element', 'HTMLElement', 'DocumentFragment', 'DOMRect', 'Event', 'MouseEvent', 'MutationObserver'] as const;

let dom: JSDOM;
let root: Root | undefined;

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
	if (root) {
		await act(async () => {
			root?.unmount();
		});
		root = undefined;
	}
	dom.window.close();
});

async function render(element: React.ReactElement) {
	await act(async () => {
		root = createRoot(document.getElementById('root')!);
		root.render(element);
	});
}

/**
 * Where the claim card sits on the page (Voter Guide round, 2626:120137 desktop /
 * 2626:128927 phone, 2026-10-22): first in the content block's card column, above
 * Why I'm Running, even though the template lists the claim block after the well.
 */
describe('the claim card leads the profile content column', () => {
	async function renderProfile(slug: string, edit: (view: object) => object = view => view) {
		const [{ PersonProfile }, { getDevPersonProfileView }] = await Promise.all([
			import('./PersonProfile'),
			import('~/lib/devPeopleProfileFixtures'),
		]);
		const view = getDevPersonProfileView(slug);
		if (!view) throw new Error(`no dev fixture for ${slug}`);
		await render(React.createElement(PersonProfile, { view: edit(view) as typeof view }));
	}

	test('an unclaimed candidate sees one claim card, first in the card column', async () => {
		await renderProfile('kim-byrd-b77f912d');

		const claims = document.querySelectorAll('[data-component="ClaimProfileBlock"]');
		expect(claims).toHaveLength(1);
		const claim = claims[0]!;
		expect(claim.getAttribute('data-layout')).toBe('inset');
		const section = claim.closest('[data-section="Claim Profile Block"]')!;
		const column = section.parentElement!;
		expect(section.closest('[data-component="ProfileContentBlock"]')).not.toBeNull();
		expect(column.firstElementChild).toBe(section);
		expect(column.previousElementSibling?.tagName).toBe('ASIDE');
		expect(claim.querySelector('h2')?.textContent).toBe('Are you Kim Byrd? Complete your profile now.');
	});

	test('nothing is left behind where the template lists the claim block', async () => {
		await renderProfile('kim-byrd-b77f912d');

		const sections = document.querySelectorAll('[data-section="Claim Profile Block"]');
		expect(sections).toHaveLength(1);
		expect(sections[0]?.closest('[data-section="Profile Content Block"]')).not.toBeNull();
	});

	test('a pledged candidate gets no claim card', async () => {
		await renderProfile('kim-byrd-b77f912d', view => ({ ...view, pledged: true }));

		expect(document.querySelector('[data-component="ClaimProfileBlock"]')).toBeNull();
	});
});

describe('the inset claim card falls back to the template position', () => {
	test('without a profile content block on the page it renders where the template lists it', async () => {
		const [{ findInsetClaimSection }, { PERSON_PROFILE_SECTIONS }] = await Promise.all([
			import('~/PageSections'),
			import('./personProfileSections'),
		]);
		const overrides = { component_claimProfileBlock: { claimed: false, layout: 'inset' as const } };

		expect(findInsetClaimSection(PERSON_PROFILE_SECTIONS, overrides)?._type).toBe('component_claimProfileBlock');
		expect(findInsetClaimSection(PERSON_PROFILE_SECTIONS.filter(s => s._type !== 'component_profileContentBlock'), overrides)).toBeUndefined();
		expect(
			findInsetClaimSection(PERSON_PROFILE_SECTIONS, { ...overrides, component_profileContentBlock: { hidden: true } }),
		).toBeUndefined();
		expect(findInsetClaimSection(PERSON_PROFILE_SECTIONS, { component_claimProfileBlock: { claimed: false } })).toBeUndefined();
	});
});
