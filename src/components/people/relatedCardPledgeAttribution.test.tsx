import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * Pins what the related-person cards on a person profile say about the people on
 * them: the pledge, when the spine affirms it, and otherwise nothing.
 *
 * They used to read "Empowered by GoodParty.org" — word for word the line the
 * hero carried until marketing replaced it with the three pledge lines
 * (2026-08-17, approved by Emily and Jack; see `pledgeAttributionCopy.test.tsx`).
 * The hero was rewritten and these were missed.
 *
 * Only the affirmative line comes across. The negative and ineligible lines the
 * hero renders are pinned OUT here, deliberately — `relatedCardAttribution`
 * carries the reasoning and the production evidence.
 *
 * Drives the real `buildPersonSectionOverrides` output rather than hand-built
 * props, because the mapping is the thing that was missing, and mounts the
 * section's own content node like the other DOM tests in this folder.
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

const PLEDGED = 'Has Taken the GoodParty.org Pledge';
const NOT_PLEDGED = 'Has Not Taken the GoodParty.org Pledge';
const INELIGIBLE = 'Ineligible for the GoodParty.org Pledge Due to Partisan Affiliation';
const EMPOWERED = 'Empowered by GoodParty.org';

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

type Rail = 'otherCandidates' | 'nearbyOfficials';

const RAIL_HEADING: Record<Rail, string> = {
	otherCandidates: 'Other Candidates',
	nearbyOfficials: 'Nearby Officials',
};

/**
 * Renders one rail of a dev fixture profile and hands back the source cards, so
 * every case can state its premise against the data rather than hoping the
 * fixture still seeds what the assertion needs.
 */
async function renderRail(slug: string, rail: Rail) {
	const { getDevPersonProfileView } = await import('~/lib/devPeopleProfileFixtures');
	const { buildPersonSectionOverrides } = await import('./personSectionOverrides');

	const view = getDevPersonProfileView(slug);
	if (!view) throw new Error(`no dev fixture for ${slug}`);
	const source = view[rail];
	const cards = buildPersonSectionOverrides(view).component_profileContentBlock?.contentCards ?? [];
	const section = cards.find(card => card.heading?.startsWith(RAIL_HEADING[rail]));
	if (!section) throw new Error(`no "${RAIL_HEADING[rail]}…" section on ${slug}`);

	await render(<>{section.content}</>);
	return { source };
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

function countOf(text: string): number {
	return cards().filter(card => card.textContent?.includes(text)).length;
}

describe('a related-person card states the pledge when the spine affirms it', () => {
	for (const [slug, rail] of [
		['allen-slagle-74eee01a', 'otherCandidates'],
		['tracy-good-ecff49d3', 'nearbyOfficials'],
	] as const) {
		test(`${RAIL_HEADING[rail]} names every pledged person, and only those`, async () => {
			const { source } = await renderRail(slug, rail);

			// The premise, stated against the data: without it the equality below
			// could hold at 0 === 0 and the case would pass having tested nothing.
			const pledged = source.filter(card => card.isPledged);
			expect(pledged.length).toBeGreaterThan(0);
			expect(pledged.length).toBeLessThan(source.length);

			expect(countOf(PLEDGED)).toBe(pledged.length);
			for (const card of pledged) {
				const rendered = cards().find(node => node.textContent?.includes(card.name));
				expect(rendered?.textContent).toContain(PLEDGED);
			}
		});

		test(`${RAIL_HEADING[rail]} makes no other claim about anyone`, async () => {
			const { source } = await renderRail(slug, rail);

			expect(cards().length).toBeGreaterThan(0);
			// The negative line is false for anyone who pledged through Serve or by
			// hand, and the ETL has never written the flag it would be keyed to, so
			// it would be published about every person on the rail. The ineligible
			// line belongs to the profile the card links to, not to a summary of it.
			expect(document.body.textContent).not.toContain(NOT_PLEDGED);
			expect(document.body.textContent).not.toContain(INELIGIBLE);
			// The retired wording, which is what was missed in the first place.
			expect(document.body.textContent).not.toContain(EMPOWERED);
			expect(source.some(card => card.isEmpowered)).toBe(true);
		});
	}

	// The line follows the pledge and the frame follows empowerment. They are
	// different facts from different sources, and the fixtures seed them on
	// different cycles precisely so a card that ties them together fails here.
	test('the pledge line does not ride on the GoodParty badge', async () => {
		const { source } = await renderRail('allen-slagle-74eee01a', 'otherCandidates');

		const pledgedNotEmpowered = source.filter(card => card.isPledged && !card.isEmpowered);
		const empoweredNotPledged = source.filter(card => card.isEmpowered && !card.isPledged);
		expect(pledgedNotEmpowered.length).toBeGreaterThan(0);
		expect(empoweredNotPledged.length).toBeGreaterThan(0);

		for (const card of pledgedNotEmpowered) {
			const node = cards().find(el => el.textContent?.includes(card.name));
			expect(node?.textContent).toContain(PLEDGED);
			expect(node?.className).not.toContain('border-bright-yellow-600');
		}
		for (const card of empoweredNotPledged) {
			const node = cards().find(el => el.textContent?.includes(card.name));
			expect(node?.textContent).not.toContain(PLEDGED);
			expect(node?.className).toContain('border-bright-yellow-600');
		}
	});

	// Branding, not an assertion — a change that dropped the whole GoodParty
	// treatment must not pass as a copy fix.
	test('the badge and the yellow frame survive', async () => {
		await renderRail('allen-slagle-74eee01a', 'otherCandidates');

		const branded = goodPartyCards();
		expect(branded.length).toBeGreaterThan(0);
		for (const card of branded) {
			expect(markCount(card)).toBe(1);
		}
	});
});

describe('the shared card is unchanged off /people', () => {
	// The Sanity claim block's example card and /candidate/[...slug] still mean
	// "Empowered by GoodParty.org" by the badge; marketing scoped the pledge copy
	// to the person profiles. An edit that keyed the shared component to the
	// pledge instead of adding to it fails here.
	test('a GoodParty candidate still reads as empowered by default', async () => {
		const { CandidatesCard } = await import('~/ui/CandidatesCard');

		await render(
			<CandidatesCard name='Example Person' partyAffiliation='Independent' href='/people/example-person' isGoodPartyCandidate />,
		);

		expect(document.body.textContent).toContain(EMPOWERED);
	});

	test('the pledge is the more specific fact when a card is both', async () => {
		const { CandidatesCard } = await import('~/ui/CandidatesCard');

		await render(
			<CandidatesCard
				name='Example Person'
				partyAffiliation='Independent'
				href='/people/example-person'
				isGoodPartyCandidate
				attribution='pledged'
			/>,
		);

		expect(document.body.textContent).toContain(PLEDGED);
		expect(document.body.textContent).not.toContain(EMPOWERED);
	});
});
