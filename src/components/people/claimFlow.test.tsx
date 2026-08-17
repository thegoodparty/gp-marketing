import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * Covers the claim flow on an unclaimed person profile: the owner-facing prompt
 * at the top of the content well scrolls down to the claim band rather than
 * opening the dialog, and the band's call to action hands the person straight to
 * Win sign-up.
 *
 * The band used to collect a name and email and branch on the person's product
 * (Win into sign-up, Serve into "a human will be in touch"). Both halves of that
 * are gone: the band is candidate-only now, so there is no Serve branch, and it
 * sends people to sign-up instead of taking their address.
 *
 * Like claimFormIds.test.tsx these mount components directly instead of driving
 * the Radix dialog, whose click delegation has proven unreliable under JSDOM,
 * and nothing here mocks `~/lib/analytics`: a partial module mock of it drops
 * the exports other importers rely on. The analytics assertions read the
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

type ScrollCall = { behavior?: string; id: string };

let dom: JSDOM;
let root: Root;
let scrollCalls: ScrollCall[];
let navigations: string[];
let trackedEvents: { name: string; props?: Record<string, unknown> }[];
let dataLayer: Record<string, unknown>[];
let fetchCalls: { url: string; body: Record<string, unknown> }[];
let fetchOk: boolean;

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

	scrollCalls = [];
	navigations = [];
	trackedEvents = [];
	dataLayer = [];
	fetchCalls = [];
	fetchOk = true;

	// JSDOM ships no scrollIntoView at all, so the component would silently skip
	// the optional call. Standing one up is what makes the scroll observable.
	(window.Element.prototype as unknown as { scrollIntoView(o?: ScrollIntoViewOptions): void }).scrollIntoView = function (
		this: Element,
		options?: ScrollIntoViewOptions,
	) {
		scrollCalls.push({ behavior: options?.behavior, id: this.id });
	};

	// React DOM decides once per process, when it is first imported, whether the
	// browser fires `input` events — and it answers by looking for a `window`
	// global. Whichever `.test.tsx` file bun loads first sets that answer for the
	// whole DOM suite, and every one of them (this file included) imports
	// react-dom before its JSDOM exists, so react-dom concludes "no" and falls
	// back to its Internet Explorer path: change tracking via `attachEvent` /
	// `detachEvent` and `keyup` rather than `input`. JSDOM has neither method, so
	// focusing an input throws inside React — which the notify dialog does on
	// open. These no-ops let that path run, keeping this file independent of
	// which test file bun happens to load first.
	const shim = window.HTMLElement.prototype as unknown as Record<string, unknown>;
	shim['attachEvent'] = () => {};
	shim['detachEvent'] = () => {};

	(window as unknown as { amplitude: unknown }).amplitude = {
		track: (name: string, props?: Record<string, unknown>) => trackedEvents.push({ name, props }),
	};
	(window as unknown as { dataLayer: unknown }).dataLayer = dataLayer;

	globalThis.fetch = (async (url: string, init?: { body?: string }) => {
		fetchCalls.push({ url: String(url), body: JSON.parse(init?.body ?? '{}') as Record<string, unknown> });
		return { ok: fetchOk } as Response;
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

const personId = '11111111-1111-4111-8111-111111111111';
const displayName = 'Example Person';

async function renderProfileClaimSurfaces(variant: 'owner-card' | 'voter-card') {
	const [{ ClaimProfileModal }, { PersonClaimCTABand }] = await Promise.all([import('./ClaimProfileModal'), import('./PersonClaimCTABand')]);

	await render(
		React.createElement(
			React.Fragment,
			null,
			React.createElement(ClaimProfileModal, {
				personId,
				displayName,
				// Only the running personas still see a claim surface, so this is the
				// pairing the band is ever rendered beside.
				persona: 'candidate',
				variant,
			}),
			React.createElement(PersonClaimCTABand, { displayName }),
		),
	);
}

function claimPromptButton(variant: 'owner-card' | 'voter-card') {
	return document.querySelector(`[data-component='ClaimPromptCard'][data-variant='${variant}'] button`)!;
}

describe('the top claim prompt pulls the person down to the claim band', () => {
	test('the owner prompt scrolls to the claim band instead of opening the dialog', async () => {
		await renderProfileClaimSurfaces('owner-card');

		await click(claimPromptButton('owner-card'));

		expect(scrollCalls).toEqual([{ behavior: 'smooth', id: 'person-claim-form' }]);
		expect(document.querySelector('[role="dialog"]')).toBeNull();
	});

	/**
	 * The prompt's whole job is to hand the person to the next step, so it has to
	 * land on the step itself. With the form replaced by a link there is no field
	 * to focus, and focusing the band wrapper instead would leave a keyboard user
	 * one unexplained Tab short of the button they were sent to.
	 */
	test('the owner prompt moves keyboard focus onto the band call to action', async () => {
		await renderProfileClaimSurfaces('owner-card');

		await click(claimPromptButton('owner-card'));

		const active = document.activeElement;
		expect(active?.id).toBe('person-claim-signup');
		expect(active?.getAttribute('href')).toBe('https://app.goodparty.org/sign-up');
	});

	test('the scroll is instant when the visitor asks for reduced motion', async () => {
		(dom.window as unknown as { matchMedia: unknown }).matchMedia = (query: string) => ({ matches: query.includes('reduce'), media: query });

		await renderProfileClaimSurfaces('owner-card');
		await click(claimPromptButton('owner-card'));

		expect(scrollCalls.map(c => c.behavior)).toEqual(['auto']);
	});

	/**
	 * Reachable rather than theoretical: the code-default template fallback strips
	 * the CTA banner block the claim band renders into, which would leave the
	 * prompt on a page with no form to scroll to. The prompt falls back to the
	 * dialog there, so it is never a button that does nothing.
	 */
	test('the scroll reports failure when the claim band is not on the page', async () => {
		const { scrollToPersonClaimForm } = await import('./claimFormAnchor');

		expect(scrollToPersonClaimForm()).toBe(false);
		expect(scrollCalls).toEqual([]);
	});

	/**
	 * The counterpart to the owner-prompt test above: this is the entry point the
	 * notify form is left with, so it has to be shown opening the dialog, not
	 * merely not scrolling.
	 */
	test('the voter prompt still opens the dialog and its notify form', async () => {
		await renderProfileClaimSurfaces('voter-card');

		expect(document.querySelector('[role="dialog"]')).toBeNull();

		await click(claimPromptButton('voter-card'));

		expect(document.querySelector('[role="dialog"]')).not.toBeNull();
		expect(document.querySelector('[role="dialog"] form#person-claim-notify')).not.toBeNull();
		expect(scrollCalls).toEqual([]);
	});
});

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
		expect(dataLayer).toEqual([{ event: 'sign_up_click', formId: 'person-claim-owner' }]);
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
