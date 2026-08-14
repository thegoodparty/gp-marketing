import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * Covers the claim flow on an unclaimed person profile. Per the Figma frames the
 * page has exactly two claim-related surfaces and they do different jobs: the
 * card at the top of the content well is visitor-facing and only opens the
 * notify dialog, and the band at the bottom is the person's own claim form,
 * which branches on their product — Win (currently running) into sign-up, Serve
 * (in office only) into a "a human will be in touch" confirmation.
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
	// focusing an input throws inside React. These no-ops let that path run;
	// `setInputValue` below then fires the events both paths listen for, which is
	// what keeps this file independent of which test file bun happens to load
	// first.
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

async function submitClaimForm({ name, email }: { name: string; email: string }) {
	const firstname = document.querySelector<HTMLInputElement>('#person-claim-owner input[name="firstname"]')!;
	const address = document.querySelector<HTMLInputElement>('#person-claim-owner input[name="email"]')!;

	await act(async () => {
		setInputValue(firstname, name);
		setInputValue(address, email);
		await flush();
	});
	await act(async () => {
		document.querySelector('form#person-claim-owner')!.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
		await flush();
		await flush();
	});
}

/**
 * Types into a react-hook-form field.
 *
 * The value goes through the prototype setter so it bypasses the setter React
 * installs on the element, which is what makes React's value tracker notice a
 * change. `input` is what React listens to normally; the focus and `keyup` are
 * what its Internet Explorer fallback listens to (see the shims in
 * `beforeEach`). Firing all of them makes this work whichever path React took,
 * and the tracker means only one change is delivered either way.
 */
function setInputValue(input: HTMLInputElement, value: string) {
	const setter = Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value')!.set!;
	input.focus();
	setter.call(input, value);
	input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
	input.dispatchEvent(new dom.window.KeyboardEvent('keyup', { bubbles: true }));
	input.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
}

const personId = '11111111-1111-4111-8111-111111111111';
const displayName = 'Example Person';

/** Win: currently running (persona `candidate` or `both`). */
const winProps = { personId, displayName, isRunning: true };
/** Serve: in office only (persona `officeholder`). */
const serveProps = { personId, displayName, isRunning: false };

async function renderProfileClaimSurfaces(isRunning: boolean) {
	const [{ ClaimProfileModal }, { PersonClaimCTABand }] = await Promise.all([import('./ClaimProfileModal'), import('./PersonClaimCTABand')]);

	await render(
		React.createElement(
			React.Fragment,
			null,
			React.createElement(ClaimProfileModal, {
				personId,
				displayName,
				persona: isRunning ? 'candidate' : 'officeholder',
			}),
			React.createElement(PersonClaimCTABand, { personId, displayName, isRunning }),
		),
	);
}

function claimPromptButton() {
	return document.querySelector(`[data-component='ClaimPromptCard'] button`)!;
}

describe('the top of the content well is notify-only', () => {
	/**
	 * The frames put ONE card at the top of the content well and it is
	 * visitor-facing. An owner-facing "are you [Name]?" prompt was added here
	 * once and had to be taken back out; a second card, or this one turning into
	 * a claim shortcut, is the regression this guards.
	 */
	test('the prompt opens the notify dialog rather than the claim form', async () => {
		await renderProfileClaimSurfaces(true);

		expect(document.querySelectorAll(`[data-component='ClaimPromptCard']`)).toHaveLength(1);
		expect(document.querySelector('[role="dialog"]')).toBeNull();

		await click(claimPromptButton());

		expect(document.querySelector('[role="dialog"]')).not.toBeNull();
		expect(document.querySelector('[role="dialog"] form#person-claim-notify')).not.toBeNull();
		// Nothing up here reaches the person's own claim form.
		expect(scrollCalls).toEqual([]);
		expect(document.querySelector('[role="dialog"] form#person-claim-owner')).toBeNull();
	});

	test('the dialog closes without submitting when the visitor cancels', async () => {
		await renderProfileClaimSurfaces(true);
		await click(claimPromptButton());

		const cancel = [...document.querySelectorAll('[role="dialog"] button')].find(b => b.textContent?.includes('Cancel'))!;
		await click(cancel);

		expect(document.querySelector('[role="dialog"]')).toBeNull();
		expect(fetchCalls).toEqual([]);
	});
});

describe('submitting the claim form branches on the person’s product', () => {
	test('Win stores the claim request and then routes to sign-up', async () => {
		const { PersonClaimCTABand } = await import('./PersonClaimCTABand');
		await render(React.createElement(PersonClaimCTABand, winProps));

		await submitClaimForm({ name: 'Example', email: 'example@example.org' });

		expect(fetchCalls).toHaveLength(1);
		expect(fetchCalls[0]?.url).toBe('/api/people/claim-request');
		expect(fetchCalls[0]?.body).toEqual({ personId, firstname: 'Example', email: 'example@example.org', source: 'owner' });
		// The lead is stored first, so an abandoned sign-up still leaves a lead.
		expect(navigations).toEqual(['https://app.goodparty.org/sign-up']);
	});

	test('Win fires the sign-up event at the point it navigates', async () => {
		const { PersonClaimCTABand } = await import('./PersonClaimCTABand');
		await render(React.createElement(PersonClaimCTABand, winProps));

		await submitClaimForm({ name: 'Example', email: 'example@example.org' });

		const signUp = trackedEvents.filter(e => e.name === 'Sign Up Clicked');
		expect(signUp).toHaveLength(1);
		expect(signUp[0]?.props).toMatchObject({ href: 'https://app.goodparty.org/sign-up' });
		expect(dataLayer).toEqual([{ event: 'sign_up_click', formId: 'person-claim-owner' }]);
	});

	test('Serve stores the claim request and promises a human, not self-serve access', async () => {
		const { PersonClaimCTABand } = await import('./PersonClaimCTABand');
		await render(React.createElement(PersonClaimCTABand, serveProps));

		await submitClaimForm({ name: 'Example', email: 'example@example.org' });

		expect(fetchCalls).toHaveLength(1);
		expect(fetchCalls[0]?.body).toEqual({ personId, firstname: 'Example', email: 'example@example.org', source: 'owner' });
		expect(navigations).toEqual([]);
		expect(trackedEvents.filter(e => e.name === 'Sign Up Clicked')).toHaveLength(0);

		const status = document.querySelector('[role="status"]')?.textContent ?? '';
		expect(status).toContain('someone from our team will email you');
		expect(status).toContain('link to access your profile');
	});

	test('a failed submission neither navigates nor claims success', async () => {
		fetchOk = false;
		const { PersonClaimCTABand } = await import('./PersonClaimCTABand');
		await render(React.createElement(PersonClaimCTABand, winProps));

		await submitClaimForm({ name: 'Example', email: 'example@example.org' });

		expect(navigations).toEqual([]);
		expect(document.querySelector('form#person-claim-owner')).not.toBeNull();
		expect(document.querySelector('[role="alert"]')?.textContent).toContain('Something went wrong');
	});
});
