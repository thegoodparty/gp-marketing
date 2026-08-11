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
 * Analytics is deliberately left unmocked: these cases only mount and open, never
 * submit or click through, so no tracking call is reached.
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

	// These have to come from the JSDOM realm rather than Bun's natives. Radix's
	// dialog constructs events and walks the tree using the *global* constructors,
	// and JSDOM rejects foreign instances ("parameter 1 is not of type 'Event'").
	for (const name of DOM_GLOBALS) {
		(globalThis as Record<string, unknown>)[name] = (window as unknown as Record<string, unknown>)[name];
	}

	// Not implemented by JSDOM, and Radix's scroll lock expects it.
	globalThis.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as unknown as typeof ResizeObserver;

	(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(async () => {
	// Unmount inside act so the dialog's dismissable-layer teardown settles here
	// rather than warning after the test has finished.
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

describe('claim form HubSpot ids', () => {
	test('PersonClaimCTABand renders form#person-claim-owner', async () => {
		const { PersonClaimCTABand } = await import('./PersonClaimCTABand');

		await render(
			React.createElement(PersonClaimCTABand, {
				personId: 'person-1',
				displayName: 'Example Person',
				isRunning: true,
			}),
		);

		const form = document.querySelector('form#person-claim-owner');
		expect(form).not.toBeNull();
		// Field names are what HubSpot maps onto contact properties.
		expect(form?.querySelector('input[name="firstname"]')).not.toBeNull();
		expect(form?.querySelector('input[name="email"]')).not.toBeNull();
	});

	test('ClaimProfileModal renders form#person-claim-notify once opened', async () => {
		const { ClaimProfileModal } = await import('./ClaimProfileModal');

		await render(
			React.createElement(ClaimProfileModal, {
				personId: 'person-1',
				displayName: 'Example Person',
				persona: 'candidate',
				variant: 'voter-card',
			}),
		);

		// The notify form only exists once the dialog is open.
		expect(document.querySelector('form#person-claim-notify')).toBeNull();

		const trigger = [...document.querySelectorAll('button')].find(b => b.textContent?.includes('Notify'));
		expect(trigger).toBeDefined();

		await act(async () => {
			trigger!.click();
			await new Promise<void>(resolve => {
				window.setTimeout(resolve, 0);
			});
		});

		const form = document.querySelector('form#person-claim-notify');
		expect(form).not.toBeNull();
		expect(form?.querySelector('input[name="firstname"]')).not.toBeNull();
		expect(form?.querySelector('input[name="email"]')).not.toBeNull();
	});

	test('the two ids differ, so HubSpot files owner claims apart from visitor nudges', async () => {
		const [{ PersonClaimCTABand }, { ClaimProfileModal }] = await Promise.all([
			import('./PersonClaimCTABand'),
			import('./ClaimProfileModal'),
		]);

		await render(
			React.createElement(
				React.Fragment,
				null,
				React.createElement(PersonClaimCTABand, {
					personId: 'person-1',
					displayName: 'Example Person',
					isRunning: true,
				}),
				React.createElement(ClaimProfileModal, {
					personId: 'person-1',
					displayName: 'Example Person',
					persona: 'candidate',
					variant: 'voter-card',
				}),
			),
		);

		const trigger = [...document.querySelectorAll('button')].find(b => b.textContent?.includes('Notify'));
		await act(async () => {
			trigger!.click();
			await new Promise<void>(resolve => {
				window.setTimeout(resolve, 0);
			});
		});

		// Both forms coexist on an unclaimed empowered profile; duplicate ids would
		// collapse the two intents into one HubSpot form (and be invalid markup).
		const ids = [...document.querySelectorAll('form')].map(f => f.id);
		expect(ids).toContain('person-claim-owner');
		expect(ids).toContain('person-claim-notify');
		expect(new Set(ids).size).toBe(ids.length);
	});
});
