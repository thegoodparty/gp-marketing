import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * Covers the claim flow on an unclaimed person profile. Per the Figma frames the
 * page has exactly two claim-related surfaces and they do different jobs: the
 * card at the top of the content well is visitor-facing and only opens the
 * notify dialog, and the band at the bottom is the person's own ask.
 *
 * That band used to collect a name and email and branch on the person's product
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
let segmentEvents: { name: string; props?: Record<string, unknown> }[];
let dataLayer: Record<string, unknown>[];
let fetchCalls: { url: string; body: Record<string, unknown> }[];
let fetchOk: boolean;
let fetchBody: Record<string, unknown> | null;

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
	segmentEvents = [];
	dataLayer = [];
	fetchCalls = [];
	fetchOk = true;
	fetchBody = { ok: true, claimRequestId: CLAIM_REQUEST_ID };

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
	(window as unknown as { analytics: unknown }).analytics = {
		track: (name: string, props?: Record<string, unknown>) => segmentEvents.push({ name, props }),
	};
	(window as unknown as { dataLayer: unknown }).dataLayer = dataLayer;

	globalThis.fetch = (async (url: string, init?: { body?: string }) => {
		fetchCalls.push({ url: String(url), body: JSON.parse(init?.body ?? '{}') as Record<string, unknown> });
		// `fetchBody === null` stands for a 2xx whose body cannot be read, which is
		// the case that must still report the submission.
		return {
			ok: fetchOk,
			json: async () => {
				if (fetchBody === null) throw new Error('unreadable body');
				return fetchBody;
			},
		} as Response;
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
/** gp-api's stored-lead id, echoed back through the proxy. */
const CLAIM_REQUEST_ID = 'clr_01HZY8QK5M';

async function renderProfileClaimSurfaces() {
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
			}),
			React.createElement(PersonClaimCTABand, { displayName }),
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
		await renderProfileClaimSurfaces();

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
		await renderProfileClaimSurfaces();
		await click(claimPromptButton());

		const cancel = [...document.querySelectorAll('[role="dialog"] button')].find(b => b.textContent?.includes('Cancel'))!;
		await click(cancel);

		expect(document.querySelector('[role="dialog"]')).toBeNull();
		expect(fetchCalls).toEqual([]);
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

/**
 * The notify count marketing automates on.
 *
 * gp-api also files these into the subject's HubSpot `candidate_profile_requests`,
 * but only for a subject the civics mart resolves to exactly one HubSpot contact —
 * a person with none, or with an ambiguous cluster, is skipped without an error
 * anywhere. Notify is aimed at exactly those thinly-known people, so the CRM
 * number is a lower bound of unknown tightness and this event is the honest one.
 *
 * The form is mounted directly rather than through the dialog, as in
 * claimFormIds.test.tsx: Radix's click delegation is unreliable under JSDOM and
 * the submission path is identical either way.
 */
describe('a completed notify submission is reported to marketing', () => {
	const NOTIFY_EVENT = 'Person Profile Notify Submitted';
	const email = 'visitor@example.com';

	async function submitNotifyForm() {
		const { NotifyForm } = await import('./ClaimProfileModal');
		await render(React.createElement(NotifyForm, { personId, displayName }));

		const form = document.querySelector<HTMLFormElement>('form#person-claim-notify')!;

		await act(async () => {
			setInputValue(form.querySelector<HTMLInputElement>('input[name="email"]')!, email);
			await flush();
		});
		await act(async () => {
			form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
			await flush();
			await flush();
		});
	}

	test('fires to Segment with the subject and the page, once gp-api has accepted it', async () => {
		await submitNotifyForm();

		expect(fetchCalls).toHaveLength(1);
		expect(segmentEvents).toEqual([
			{
				name: NOTIFY_EVENT,
				props: { personId, claimRequestId: CLAIM_REQUEST_ID, page_path: '/people/example-person' },
			},
		]);
	});

	/**
	 * `personId` is the join key marketing resolves to the subject's HubSpot
	 * contact (`mart_civics.people.gp_person_id` → `hs_contact_id`), so it has to
	 * survive on the event even though the contact id itself is never fetched
	 * here. Losing it would leave the event with nothing to join on.
	 */
	test('carries the subject id the CRM join needs', async () => {
		await submitNotifyForm();

		expect(segmentEvents[0]?.props?.['personId']).toBe(personId);
	});

	/**
	 * The id is a convenience for tying an event back to its row, never a
	 * precondition for reporting the ask. A 2xx we cannot parse still means the
	 * lead was stored, so the event must fire with a null rather than vanish.
	 */
	test('still reports the ask when the id cannot be read back', async () => {
		fetchBody = null;

		await submitNotifyForm();

		expect(segmentEvents).toEqual([
			{ name: NOTIFY_EVENT, props: { personId, claimRequestId: null, page_path: '/people/example-person' } },
		]);
	});

	/**
	 * Amplitude carried this event before Segment did. Both sinks are kept, and
	 * kept identical, so a marketing audience and a product funnel built on the
	 * same name cannot disagree about what a notify is.
	 */
	test('fires the same event to Amplitude', async () => {
		await submitNotifyForm();

		expect(trackedEvents.filter(e => e.name === NOTIFY_EVENT)).toEqual([
			{
				name: NOTIFY_EVENT,
				props: { personId, claimRequestId: CLAIM_REQUEST_ID, page_path: '/people/example-person' },
			},
		]);
	});

	/**
	 * Firing on click instead of on the response would make the number "people who
	 * pressed Submit", which is not what a nudge count means and is not something
	 * an automation can act on.
	 */
	test('stays silent when gp-api rejects the submission', async () => {
		fetchOk = false;

		await submitNotifyForm();

		expect(fetchCalls).toHaveLength(1);
		expect(segmentEvents).toEqual([]);
		expect(trackedEvents.filter(e => e.name === NOTIFY_EVENT)).toEqual([]);
	});
});
