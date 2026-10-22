import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * Covers the claim prompt on an unclaimed person profile, the person's own ask:
 * the Person Profile template's Claim Profile Block, rendered with the overrides
 * the profile hands it.
 *
 * It used to be a hard-coded band that collected a name and email and branched
 * on the person's product (Win into sign-up, Serve into "a human will be in
 * touch"). Both halves of that are gone: the prompt is candidate-only, so there
 * is no Serve branch, and it sends people to sign-up instead of taking their
 * address. The visitor-facing "ask [Name] to complete their profile" card was
 * removed (2026-10-16), so nothing on the page posts to the claim-request
 * endpoint.
 *
 * Nothing here mocks `~/lib/analytics`: a partial module mock of it drops the
 * exports other importers rely on. The analytics assertions read the
 * `window.amplitude` / `window.dataLayer` sinks the real functions write to.
 */

const DOM_GLOBALS = [
	'Node',
	'NodeFilter',
	'Element',
	'HTMLElement',
	'HTMLInputElement',
	'HTMLButtonElement',
	'HTMLFormElement',
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
let root: Root;
let navigations: string[];
let trackedEvents: { name: string; props?: Record<string, unknown> }[];
let segmentEvents: { name: string; props?: Record<string, unknown> }[];
let dataLayer: Record<string, unknown>[];
let fetchCalls: { url: string; body: Record<string, unknown> }[];

beforeEach(() => {
	dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
		url: 'http://localhost/people/example-person',
		pretendToBeVisual: true,
	});
	const { window } = dom;

	globalThis.document = window.document;
	globalThis.navigator = window.navigator;
	globalThis.getComputedStyle = window.getComputedStyle.bind(window);

	for (const name of DOM_GLOBALS) {
		(globalThis as Record<string, unknown>)[name] = (window as unknown as Record<string, unknown>)[name];
	}

	navigations = [];
	trackedEvents = [];
	segmentEvents = [];
	dataLayer = [];
	fetchCalls = [];

	(window as unknown as { amplitude: unknown }).amplitude = {
		track: (name: string, props?: Record<string, unknown>) => trackedEvents.push({ name, props }),
	};
	(window as unknown as { analytics: unknown }).analytics = {
		track: (name: string, props?: Record<string, unknown>) => segmentEvents.push({ name, props }),
	};
	(window as unknown as { dataLayer: unknown }).dataLayer = dataLayer;

	globalThis.fetch = (async (url: string, init?: { body?: string }) => {
		fetchCalls.push({ url: String(url), body: JSON.parse(init?.body ?? '{}') as Record<string, unknown> });
		return { ok: true, json: async () => ({}) } as Response;
	}) as unknown as typeof fetch;

	// `window.location` is unforgeable in JSDOM — it cannot be reassigned or
	// redefined — so the Win redirect is only observable by handing the code under
	// test a window whose `location` is ours. Everything else passes straight
	// through, and `document.defaultView` still points at the real window, which
	// is what React reads.
	const fakeLocation = { assign: (url: string) => navigations.push(url), href: window.location.href, pathname: window.location.pathname };
	globalThis.window = new Proxy(window, {
		get: (target, prop) => (prop === 'location' ? fakeLocation : Reflect.get(target, prop, target)),
	}) as unknown as Window & typeof globalThis;

	(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(async () => {
	if (root) {
		await act(async () => {
			root.unmount();
		});
	}
	dom.window.close();
});

async function render(element: React.ReactElement) {
	await act(async () => {
		root = createRoot(document.getElementById('root')!);
		root.render(element);
		await flush();
	});
}

async function flush() {
	await new Promise<void>(resolve => {
		dom.window.setTimeout(resolve, 0);
	});
}

async function click(element: Element) {
	await act(async () => {
		element.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
		await flush();
	});
}

/**
 * The Person Profile global template's block (2026-10-16), in the shape the page
 * query projects it to: `ctaAction` arrives as `action`/`text`.
 */
const templateSection = {
	_key: 'person-claim',
	_type: 'component_claimProfileBlock',
	claimProfileBlockContent: {
		exampleCard: { field_showBadge: true },
		field_headline: 'Are you [candidate name]? Complete your profile now.',
		field_body:
			'Your community deserves accountable leadership. Claim your profile and share your top priorities with residents. Create a free GoodParty.org account to get started.',
	},
	claimProfileBlockDesignSettings: { field_blockColorCreamMidnight: 'cream' },
	ctaAction: { _type: 'ctaActionWithShared', action: 'SignUp', text: 'Claim this profile' },
};

describe('the claim block hands the candidate to Win sign-up', () => {
	async function renderBlock(section: object = templateSection) {
		const [{ ClaimProfileBlockSection }, { buildPersonSectionOverrides }, { getDevPersonProfileView }] = await Promise.all([
			import('~/PageSections/ClaimProfileBlockSection'),
			import('./personSectionOverrides'),
			import('~/lib/devPeopleProfileFixtures'),
		]);
		const view = getDevPersonProfileView('kim-byrd-b77f912d');
		if (!view) throw new Error('no dev fixture for kim-byrd-b77f912d');
		await render(
			React.createElement(ClaimProfileBlockSection, {
				...(section as unknown as React.ComponentProps<typeof ClaimProfileBlockSection>),
				claimProfileOverride: buildPersonSectionOverrides(view).component_claimProfileBlock,
				tokens: { '[candidate name]': view.displayName },
			}),
		);
		return document.querySelector('[data-component="ClaimProfileBlock"] a')!;
	}

	test('the call to action is a link to sign-up, not a form', async () => {
		const cta = await renderBlock();

		expect(cta.tagName).toBe('A');
		expect(cta.getAttribute('href')).toBe('https://app.goodparty.org/sign-up');
		expect(document.querySelector('form')).toBeNull();
	});

	test('the template copy names the person', async () => {
		await renderBlock();

		expect(document.querySelector('h2')?.textContent).toBe('Are you Kim Byrd? Complete your profile now.');
	});

	// The sample candidate card is for landing pages; the profile already shows
	// the person's name and photo above it (Emily, 2026-10-16).
	test('the block shows no sample candidate card', async () => {
		await renderBlock();

		expect(document.querySelector('[data-component="ClaimProfileBlock"]')?.textContent).not.toContain('View profile');
	});

	/**
	 * The GTM Data Layer Variable behind the sign-up conversion is keyed on this
	 * id. It arrived from the hard-coded band, and before that its HubSpot form;
	 * the key has to survive both, or the conversion stops resolving for this
	 * surface.
	 */
	test('clicking it reports a sign-up under the surface’s existing form id', async () => {
		const cta = await renderBlock();

		await click(cta);

		const signUp = trackedEvents.filter(e => e.name === 'Sign Up Clicked');
		expect(signUp).toHaveLength(1);
		expect(signUp[0]?.props).toMatchObject({ href: 'https://app.goodparty.org/sign-up', label: 'Claim this profile' });
		expect(dataLayer).toEqual([
			{ event: 'sign_up_click', formId: 'person-claim-owner' },
			{
				event: 'voter_guide_claim_profile_click',
				page_path: '/people/example-person',
				source: 'claim_block',
				label: 'Claim this profile',
				href: 'https://app.goodparty.org/sign-up',
				// The profile's claim card is the inset one at the top of the content column.
				layout: 'inset',
			},
		]);
		expect(segmentEvents.map(e => e.name)).toEqual(['Voter Guide - Claim Profile Clicked']);
	});

	/**
	 * Owner-side email capture on this surface is deliberately gone — marketing
	 * chose the sign-up funnel over the lead. Pinned because a well-meaning
	 * "restore the lead capture" change would quietly reintroduce a second,
	 * conflicting owner path and a HubSpot form nobody is watching.
	 */
	test('nothing is posted to the claim-request endpoint from the block', async () => {
		const cta = await renderBlock();

		await click(cta);

		expect(fetchCalls).toEqual([]);
	});

	// The code default runs when Studio has no Person Profile template, without
	// the page query, so its button arrives in schema field names, not projected.
	test('the code-default template also sends the candidate to sign-up', async () => {
		const { PERSON_PROFILE_SECTIONS, PERSON_SECTION_KEYS } = await import('./personProfileSections');
		const codeDefault = PERSON_PROFILE_SECTIONS.find(section => section._key === PERSON_SECTION_KEYS.claim);
		if (!codeDefault) throw new Error('no claim section in the code default');
		const cta = await renderBlock(codeDefault);

		expect(cta.getAttribute('href')).toBe('https://app.goodparty.org/sign-up');
		expect(document.querySelector('h2')?.textContent).toBe('Are you Kim Byrd? Complete your profile now.');
	});

	test('an unusable Studio button still falls back to sign-up under the form id', async () => {
		const cta = await renderBlock({
			...templateSection,
			ctaAction: { _type: 'ctaActionWithShared', action: null, text: 'Claim this profile' },
		});

		expect(cta.getAttribute('href')).toBe('https://app.goodparty.org/sign-up');
		await click(cta);
		expect(dataLayer[0]).toEqual({ event: 'sign_up_click', formId: 'person-claim-owner' });
	});
});
