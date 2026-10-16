import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * Covers the claim band on an unclaimed person profile, the person's own ask.
 *
 * The band used to collect a name and email and branch on the person's product
 * (Win into sign-up, Serve into "a human will be in touch"). Both halves of that
 * are gone: the band is candidate-only now, so there is no Serve branch, and it
 * sends people to sign-up instead of taking their address. The visitor-facing
 * "ask [Name] to complete their profile" card that sat above it was removed
 * (2026-10-16), so nothing on the page posts to the claim-request endpoint.
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

const displayName = 'Example Person';

describe('the claim band hands the candidate to Win sign-up', () => {
	async function renderBand() {
		const { PersonClaimCTABand } = await import('./PersonClaimCTABand');
		await render(React.createElement(PersonClaimCTABand, { displayName }));
		return document.getElementById('person-claim-signup')!;
	}

	test('the call to action is a link to sign-up, not a form', async () => {
		const cta = await renderBand();

		expect(cta.tagName).toBe('A');
		expect(cta.getAttribute('href')).toBe('https://app.goodparty.org/sign-up');
		expect(document.querySelector('form')).toBeNull();
	});

	/**
	 * The GTM Data Layer Variable behind the sign-up conversion is keyed on this
	 * id. It used to arrive from the band's HubSpot form; the form is gone but the
	 * key has to survive it, or the conversion stops resolving for this surface.
	 */
	test('clicking it reports a sign-up under the surface’s existing form id', async () => {
		const cta = await renderBand();

		await click(cta);

		const signUp = trackedEvents.filter(e => e.name === 'Sign Up Clicked');
		expect(signUp).toHaveLength(1);
		expect(signUp[0]?.props).toMatchObject({ href: 'https://app.goodparty.org/sign-up', label: 'Claim profile' });
		expect(dataLayer).toEqual([
			{ event: 'sign_up_click', formId: 'person-claim-owner' },
			{
				event: 'voter_guide_claim_profile_click',
				page_path: '/people/example-person',
				source: 'claim_band',
				label: 'Claim this profile',
				href: 'https://app.goodparty.org/sign-up',
				layout: null,
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
	test('nothing is posted to the claim-request endpoint from the band', async () => {
		const cta = await renderBand();

		await click(cta);

		expect(fetchCalls).toEqual([]);
	});
});
