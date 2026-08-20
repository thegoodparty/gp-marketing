import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * Pins that the related-candidate cards on a person profile say nothing about
 * GoodParty.org's relationship to the people on them.
 *
 * They read "Empowered by GoodParty.org" — word for word the line the hero
 * carried until marketing replaced it with the three pledge lines (2026-08-17,
 * approved by Emily and Jack; see `pledgeAttributionCopy.test.tsx`). The hero
 * was rewritten and these were missed, so the retired sentence went on being
 * published about other named people on the very same page.
 *
 * None of the three replacements can go here. `RelatedPersonCard` carries no
 * pledge flag — neither `buildOtherCandidateCards` nor `buildNearbyOfficialCards`
 * reads one — so a card cannot tell "has not taken the pledge" from "we never
 * looked", and the negative line is already false for anyone who pledged through
 * Serve or by hand rather than on a candidacy.
 *
 * The GoodParty badge and yellow frame are branding, not an assertion, and stay
 * — the same split ProfileHero draws between `showBrandMark` and `attribution`.
 * They are asserted here too, so a change that dropped the whole GoodParty
 * treatment cannot pass as a copy fix.
 *
 * Mounts the section's own content node, like the other DOM tests in this folder.
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

/** Every case renders more than once, and React allows one root per container. */
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

/**
 * Renders the profile section whose heading starts with `headingPrefix`, driving
 * the real `buildPersonSectionOverrides` output rather than hand-built card
 * props — the mapping is the thing that was wrong, so the test has to go through
 * it.
 */
async function renderSection(slug: string, headingPrefix: string) {
	const { getDevPersonProfileView } = await import('~/lib/devPeopleProfileFixtures');
	const { buildPersonSectionOverrides } = await import('./personSectionOverrides');

	const view = getDevPersonProfileView(slug);
	if (!view) throw new Error(`no dev fixture for ${slug}`);
	const cards = buildPersonSectionOverrides(view).component_profileContentBlock?.contentCards ?? [];
	const section = cards.find(card => card.heading?.startsWith(headingPrefix));
	if (!section) throw new Error(`no "${headingPrefix}…" section on ${slug}`);

	await render(<>{section.content}</>);
}

function cards(): Element[] {
	return [...document.querySelectorAll("[data-component='CandidatesCard']")];
}

/** Cards carrying the GoodParty treatment, by the yellow frame the variant paints. */
function goodPartyCards(): Element[] {
	return cards().filter(card => card.className.includes('border-bright-yellow-600'));
}

/** The GoodParty.org mark, by the viewBox of its artwork. */
function markCount(scope: ParentNode = document): number {
	return scope.querySelectorAll("svg[viewBox='35 42 137 116']").length;
}

describe('the related-candidate cards make no GoodParty.org claim about the people on them', () => {
	test('a candidate\u2019s "Other Candidates" cards', async () => {
		await renderSection('allen-slagle-74eee01a', 'Other Candidates');

		// The premise: the fixture really does seed an empowered card here, so the
		// assertion below cannot pass by there being nothing to say it about.
		expect(goodPartyCards().length).toBeGreaterThan(0);
		expect(document.body.textContent).not.toContain('Empowered by GoodParty.org');
	});

	test('an officeholder\u2019s "Nearby Officials" cards', async () => {
		await renderSection('tracy-good-ecff49d3', 'Nearby Officials');

		expect(goodPartyCards().length).toBeGreaterThan(0);
		expect(document.body.textContent).not.toContain('Empowered by GoodParty.org');
	});

	test('the badge and the yellow frame survive \u2014 only the sentence goes', async () => {
		await renderSection('allen-slagle-74eee01a', 'Other Candidates');

		for (const card of goodPartyCards()) {
			expect(markCount(card)).toBe(1);
		}
	});
});

describe('the line is retired on /people, not everywhere', () => {
	test('the shared card still carries it by default', async () => {
		// The Sanity claim block's example card still means "Empowered by
		// GoodParty.org" by the badge; marketing scoped the pledge copy to the
		// person profiles. A future edit that deletes the string from the shared
		// component rather than suppressing it on this one surface fails here.
		const { CandidatesCard } = await import('~/ui/CandidatesCard');

		await render(
			<CandidatesCard name='Example Person' partyAffiliation='Independent' href='/people/example-person' isGoodPartyCandidate />,
		);

		expect(document.body.textContent).toContain('Empowered by GoodParty.org');
	});
});
