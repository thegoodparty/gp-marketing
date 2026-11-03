import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * Covers the claim card on an unclaimed person profile: the Person Profile
 * template's Claim Profile Block, rendered with the overrides the profile hands
 * it. Its button opens a pop-up (Figma 2684:9074, Nov 2026) with two halves: the
 * candidate's sign-up button, and a form for a voter to ask the candidate to
 * complete the page, which posts to the claim-request endpoint as `notify` and
 * is collected by HubSpot as `#person-claim-notify`.
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
let fetchOk: boolean;
let fetchBody: Record<string, unknown> | null;

/** gp-api's stored-lead id, echoed back through the proxy. */
const CLAIM_REQUEST_ID = 'clr_01HZY8QK5M';

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
	fetchOk = true;
	fetchBody = { ok: true, claimRequestId: CLAIM_REQUEST_ID };

	// React DOM decides once per process, when it is first imported, whether the
	// browser fires `input` events, by looking for a `window` global. Every DOM
	// test imports react-dom before its JSDOM exists, so it falls back to its
	// Internet Explorer path (`attachEvent` / `detachEvent` and `keyup`), which
	// JSDOM lacks, and focusing an input throws inside React; the dialog focuses
	// one on open. These no-ops let that path run.
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
		// `fetchBody === null` stands for a 2xx whose body cannot be read, which
		// must still report the submission.
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
 * Types into a react-hook-form field. The value goes through the prototype
 * setter so React's value tracker notices the change; `input` and `keyup` cover
 * whichever event path React took (see the shims in `beforeEach`).
 */
function setInputValue(input: HTMLInputElement, value: string) {
	const setter = Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value')!.set!;
	input.focus();
	setter.call(input, value);
	input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
	input.dispatchEvent(new dom.window.KeyboardEvent('keyup', { bubbles: true }));
	input.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
}

async function kimByrd() {
	const { getDevPersonProfileView } = await import('~/lib/devPeopleProfileFixtures');
	const view = getDevPersonProfileView('kim-byrd-b77f912d');
	if (!view) throw new Error('no dev fixture for kim-byrd-b77f912d');
	return view;
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

/**
 * The claim link says where it came from, so the app can show the claim
 * variation of its sign-up page to these visitors only (see
 * `PERSON_CLAIM_SIGNUP_SOURCE`).
 */
const CLAIM_SIGNUP_HREF = 'https://app.goodparty.org/sign-up?signup_source=profile_claim';

async function renderBlock(section: object = templateSection) {
	const [{ ClaimProfileBlockSection }, { buildPersonSectionOverrides }, view] = await Promise.all([
		import('~/PageSections/ClaimProfileBlockSection'),
		import('./personSectionOverrides'),
		kimByrd(),
	]);
	await render(
		React.createElement(ClaimProfileBlockSection, {
			...(section as unknown as React.ComponentProps<typeof ClaimProfileBlockSection>),
			claimProfileOverride: buildPersonSectionOverrides(view).component_claimProfileBlock,
			tokens: { '[candidate name]': view.displayName },
		}),
	);
	return document.querySelector('[data-component="ClaimProfileBlock"] button')!;
}

/** Opens the pop-up from the card and returns the candidate half's sign-up link. */
async function openAndFindClaimLink(section?: object) {
	await click(await renderBlock(section));
	return document.querySelector('[role="dialog"] a')!;
}

describe('the claim card opens the claim pop-up', () => {
	test('the card’s button opens a pop-up rather than leaving the page', async () => {
		const trigger = await renderBlock();

		expect(trigger.tagName).toBe('BUTTON');
		expect(trigger.textContent).toContain('Claim this profile');
		expect(document.querySelector('[data-component="ClaimProfileBlock"] a')).toBeNull();
		expect(document.querySelector('[role="dialog"]')).toBeNull();

		await click(trigger);

		expect(document.querySelector('[role="dialog"][data-component="ProfileRequestModal"]')).not.toBeNull();
		expect(dataLayer).toEqual([{ event: 'voter_guide_claim_modal_open', page_path: '/people/example-person', source: 'claim_block' }]);
	});

	test('the pop-up speaks to the candidate by name and to voters by place', async () => {
		const { personPledgeLocation } = await import('./personSectionOverrides');
		const location = personPledgeLocation(await kimByrd());
		await click(await renderBlock());

		const headings = [...document.querySelectorAll('[role="dialog"] h2')].map(h => h.textContent);
		expect(headings).toEqual([`Are you a ${location} voter?`, 'Are you Kim Byrd?']);
		expect(document.querySelector('[role="dialog"]')?.textContent).toContain('Ask Kim Byrd to complete their profile');
	});
});

describe('the pop-up hands the candidate to Win sign-up', () => {
	test('the candidate half is a link to sign-up', async () => {
		const cta = await openAndFindClaimLink();

		expect(cta.getAttribute('href')).toBe(CLAIM_SIGNUP_HREF);
		expect(cta.textContent).toContain('Claim your profile');
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
		const cta = await openAndFindClaimLink();
		dataLayer.length = 0;

		await click(cta);

		const signUp = trackedEvents.filter(e => e.name === 'Sign Up Clicked');
		expect(signUp).toHaveLength(1);
		expect(signUp[0]?.props).toMatchObject({ href: CLAIM_SIGNUP_HREF, label: 'Claim your profile' });
		expect(dataLayer).toEqual([
			{ event: 'sign_up_click', formId: 'person-claim-owner' },
			{
				event: 'voter_guide_claim_profile_click',
				page_path: '/people/example-person',
				source: 'claim_block',
				label: 'Claim your profile',
				href: CLAIM_SIGNUP_HREF,
				// The profile's claim card is the inset one at the top of the content column.
				layout: 'inset',
			},
		]);
		expect(segmentEvents.map(e => e.name)).toEqual(['Voter Guide - Claim Profile Clicked']);
	});

	/**
	 * The candidate's own way in stays sign-up, not an email capture: only the
	 * voter half posts, and it posts as `notify`.
	 */
	test('claiming posts nothing to the claim-request endpoint', async () => {
		await click(await openAndFindClaimLink());

		expect(fetchCalls).toEqual([]);
	});

	// The code default runs when Studio has no Person Profile template, without
	// the page query, so its button arrives in schema field names, not projected.
	test('the code-default template also sends the candidate to sign-up', async () => {
		const { PERSON_PROFILE_SECTIONS, PERSON_SECTION_KEYS } = await import('./personProfileSections');
		const codeDefault = PERSON_PROFILE_SECTIONS.find(section => section._key === PERSON_SECTION_KEYS.claim);
		if (!codeDefault) throw new Error('no claim section in the code default');
		const cta = await openAndFindClaimLink(codeDefault);

		expect(cta.getAttribute('href')).toBe(CLAIM_SIGNUP_HREF);
		expect(document.querySelector('[data-component="ClaimProfileBlock"] h2')?.textContent).toBe('This profile is incomplete.');
	});

	// The fallback is the plain sign-up button, which carries no source, so these
	// visitors see the original sign-up page. That is the safe side to fail on.
	test('an unusable Studio button still falls back to sign-up under the form id', async () => {
		const cta = await openAndFindClaimLink({
			...templateSection,
			ctaAction: { _type: 'ctaActionWithShared', action: null, text: 'Claim this profile' },
		});

		expect(cta.getAttribute('href')).toBe('https://app.goodparty.org/sign-up');
		dataLayer.length = 0;
		await click(cta);
		expect(dataLayer[0]).toEqual({ event: 'sign_up_click', formId: 'person-claim-owner' });
	});

	// The pledge band's sign-up is the voter's way in, not the candidate's, so the
	// app must keep showing it the original sign-up page.
	test('the pledge band’s sign-up does not carry the claim source', async () => {
		const [{ buildPersonSectionOverrides }, { getDevPersonProfileView }] = await Promise.all([
			import('./personSectionOverrides'),
			import('~/lib/devPeopleProfileFixtures'),
		]);
		const view = getDevPersonProfileView('kim-byrd-b77f912d');
		if (!view) throw new Error('no dev fixture for kim-byrd-b77f912d');
		const overrides = buildPersonSectionOverrides(view);

		expect(overrides.component_claimProfileBlock?.signupSource).toBe('profile_claim');
		expect(JSON.stringify(overrides.component_goodPartyOrgPledge)).not.toContain('signup_source');
		expect(JSON.stringify(overrides.component_goodPartyOrgPledge)).not.toContain('profile_claim');
	});
});

/**
 * The voter half of the pop-up. The form is mounted directly: the submission
 * path is the same either way, and it keeps these tests off Radix's portal.
 */
describe('a voter asks the candidate to complete their profile', () => {
	const NOTIFY_EVENT = 'Person Profile Notify Submitted';
	const personId = '11111111-1111-4111-8111-111111111111';

	async function renderForm() {
		const { ProfileRequestForm } = await import('~/ui/ProfileRequestModal');
		await render(React.createElement(ProfileRequestForm, { personId, candidateName: 'Kim Byrd' }));
		return document.querySelector<HTMLFormElement>('form#person-claim-notify')!;
	}

	async function submit(form: HTMLFormElement, values: Record<string, string>) {
		await act(async () => {
			for (const [name, value] of Object.entries(values)) {
				setInputValue(form.querySelector<HTMLInputElement>(`input[name="${name}"]`)!, value);
			}
			await flush();
		});
		await act(async () => {
			form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
			await flush();
			await flush();
		});
	}

	/**
	 * HubSpot keys a collected form on the selector built from the form's id AND
	 * its classes, so one styling class on the `<form>` would file submissions
	 * under a new form and orphan the workflows on `#person-claim-notify`. The
	 * input names are the HubSpot contact properties they fill.
	 */
	test('HubSpot collects it as #person-claim-notify, with its contact property names', async () => {
		const form = await renderForm();

		expect(form).not.toBeNull();
		expect(form.getAttributeNames().sort()).toEqual(['id', 'novalidate']);
		expect([...form.querySelectorAll('input')].map(i => i.name)).toEqual(['firstname', 'lastname', 'email', 'city']);
	});

	test('it posts a notify request for the person and reports it once accepted', async () => {
		const form = await renderForm();

		await submit(form, { firstname: 'Ada', lastname: 'Lovelace', email: 'ada@example.com', city: 'Austin' });

		expect(fetchCalls).toEqual([
			{ url: '/api/people/claim-request', body: { personId, firstname: 'Ada', email: 'ada@example.com', source: 'notify' } },
		]);
		const reported = { personId, claimRequestId: CLAIM_REQUEST_ID, page_path: '/people/example-person' };
		expect(segmentEvents).toEqual([{ name: NOTIFY_EVENT, props: reported }]);
		expect(trackedEvents.filter(e => e.name === NOTIFY_EVENT)).toEqual([{ name: NOTIFY_EVENT, props: reported }]);
		expect(document.querySelector('[role="status"]')?.textContent).toContain('Kim Byrd');
	});

	test('still reports the ask when the id cannot be read back', async () => {
		fetchBody = null;
		const form = await renderForm();

		await submit(form, { email: 'ada@example.com' });

		expect(segmentEvents).toEqual([{ name: NOTIFY_EVENT, props: { personId, claimRequestId: null, page_path: '/people/example-person' } }]);
	});

	test('stays silent and shows an error when gp-api rejects it', async () => {
		fetchOk = false;
		const form = await renderForm();

		await submit(form, { email: 'ada@example.com' });

		expect(fetchCalls).toHaveLength(1);
		expect(segmentEvents).toEqual([]);
		expect(document.querySelector('[role="alert"]')?.textContent).toBe('Something went wrong. Please try again.');
	});

	test('an email is required before anything is sent', async () => {
		const form = await renderForm();

		await submit(form, { firstname: 'Ada' });

		expect(fetchCalls).toEqual([]);
		expect(form.textContent).toContain('Email is required');
	});

	/**
	 * With a site key the button waits for the tick, and the token rides along to
	 * the proxy. Google's script never loads under JSDOM, so the test stands in
	 * for it. One test on purpose: the script load is cached for the process.
	 */
	test('with reCAPTCHA on, nothing is sent until the box is ticked', async () => {
		type Callback<Args extends unknown[]> = (...args: Args) => void;
		type WidgetParams = { callback: Callback<[string]>; 'expired-callback': Callback<[]> };
		const widgets: WidgetParams[] = [];
		(window as unknown as { grecaptcha: unknown }).grecaptcha = {
			ready: (callback: () => void) => callback(),
			render: (_el: HTMLElement, params: WidgetParams) => widgets.push(params) - 1,
		};
		const { ProfileRequestForm } = await import('~/ui/ProfileRequestModal');
		await render(React.createElement(ProfileRequestForm, { personId, candidateName: 'Kim Byrd', recaptchaSiteKey: 'site-key' }));
		const form = document.querySelector<HTMLFormElement>('form#person-claim-notify')!;
		const button = document.querySelector<HTMLButtonElement>('button[form="person-claim-notify"]')!;

		// Google's hidden field must land outside the form HubSpot collects.
		expect(form.querySelector('[data-component="RecaptchaCheckbox"]')).toBeNull();
		expect(button.disabled).toBe(true);
		await submit(form, { email: 'ada@example.com' });
		expect(fetchCalls).toEqual([]);

		await act(async () => {
			document.querySelector('script[src*="recaptcha/api.js"]')?.dispatchEvent(new dom.window.Event('load'));
			await flush();
		});
		await act(async () => {
			widgets[0]?.callback('tok');
			await flush();
		});
		expect(button.disabled).toBe(false);

		// A failed send spends the token, so the box is replaced and must be ticked again.
		fetchOk = false;
		await submit(form, {});
		expect(button.disabled).toBe(true);
		expect(widgets).toHaveLength(2);

		await act(async () => {
			widgets[1]?.callback('tok-2');
			await flush();
		});
		// The replaced box's expiry must not wipe the new tick.
		await act(async () => {
			widgets[0]?.['expired-callback']();
			await flush();
		});
		expect(button.disabled).toBe(false);

		fetchOk = true;
		await submit(form, {});

		expect(fetchCalls.map(call => call.body['recaptchaToken'])).toEqual(['tok', 'tok-2']);
		expect(fetchCalls[1]).toEqual({
			url: '/api/people/claim-request',
			body: { personId, firstname: '', email: 'ada@example.com', source: 'notify', recaptchaToken: 'tok-2' },
		});
	});
});
