import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * Guards the `<form id>` on both person-profile claim forms.
 *
 * These ids are an external contract with HubSpot, not decoration. The site-wide
 * tracking script collects submissions via the non-HubSpot forms tool, which keys
 * a form on its id and silently falls back to the class list when the id is
 * absent — filing submissions under a brand-new form and orphaning whatever
 * marketing workflow was attached to the old one. Nothing throws when that
 * happens, on the site or in HubSpot, so CI is the only place it can be caught.
 *
 * These mount the form components directly rather than driving the dialog open,
 * because Radix's click delegation has proven unreliable under JSDOM here. The id
 * lives on the form element either way, so opening the dialog buys nothing and
 * only adds a way for the test to fail on something other than the id.
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

	// These have to come from the JSDOM realm rather than Bun's natives, which
	// JSDOM rejects as foreign ("parameter 1 is not of type 'Event'").
	for (const name of DOM_GLOBALS) {
		(globalThis as Record<string, unknown>)[name] = (window as unknown as Record<string, unknown>)[name];
	}

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
		await new Promise<void>(resolve => {
			window.setTimeout(resolve, 0);
		});
	});
}

const bandProps = { personId: 'person-1', displayName: 'Example Person', isRunning: true };
const notifyProps = { personId: 'person-1', displayName: 'Example Person' };

describe('claim form HubSpot ids', () => {
	test('PersonClaimCTABand renders form#person-claim-owner', async () => {
		const { PersonClaimCTABand } = await import('./PersonClaimCTABand');

		await render(React.createElement(PersonClaimCTABand, bandProps));

		const form = document.querySelector('form#person-claim-owner');
		expect(form).not.toBeNull();
		// Field names are what HubSpot maps onto contact properties.
		expect(form?.querySelector('input[name="firstname"]')).not.toBeNull();
		expect(form?.querySelector('input[name="email"]')).not.toBeNull();
	});

	test('the claim dialog notify form renders form#person-claim-notify', async () => {
		const { NotifyForm } = await import('./ClaimProfileModal');

		await render(React.createElement(NotifyForm, notifyProps));

		const form = document.querySelector('form#person-claim-notify');
		expect(form).not.toBeNull();
		expect(form?.querySelector('input[name="firstname"]')).not.toBeNull();
		expect(form?.querySelector('input[name="email"]')).not.toBeNull();
	});

	test('the two ids differ, so HubSpot files owner claims apart from visitor nudges', async () => {
		const [{ PersonClaimCTABand }, { NotifyForm }] = await Promise.all([
			import('./PersonClaimCTABand'),
			import('./ClaimProfileModal'),
		]);

		// Both are reachable on an unclaimed empowered profile. Sharing an id would
		// collapse the two intents into one HubSpot form, besides being invalid markup.
		await render(
			React.createElement(
				React.Fragment,
				null,
				React.createElement(PersonClaimCTABand, bandProps),
				React.createElement(NotifyForm, notifyProps),
			),
		);

		const ids = [...document.querySelectorAll('form')].map(f => f.id);
		expect(ids).toContain('person-claim-owner');
		expect(ids).toContain('person-claim-notify');
		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe('claim form marketing consent', () => {
	/**
	 * The Figma dialog (1901:51851) draws this box ticked, so the unchecked default
	 * looks like a parity bug to anyone re-reading the frame and is a one-word revert
	 * away. It is deliberate: a pre-ticked box opts the sender in unless they notice
	 * and clear it, which is not consent under GDPR. Nothing else fails if it flips.
	 */
	test('the notify form does not pre-check the marketing opt-in', async () => {
		const { NotifyForm } = await import('./ClaimProfileModal');

		await render(React.createElement(NotifyForm, notifyProps));

		const consent = document.querySelector<HTMLInputElement>('input[name="marketingConsent"]');
		expect(consent).not.toBeNull();
		expect(consent?.type).toBe('checkbox');
		expect(consent?.checked).toBe(false);
	});
});
