import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * Guards that the claim band on a person profile collects nothing for HubSpot.
 *
 * Both person-profile forms are gone: the owner form became a sign-up link
 * (2026-08-17) and the visitor notify form went with the "ask [Name] to complete
 * their profile" card (2026-10-16), whose requests piled up in HubSpot as voter
 * contacts nobody followed up on. Their HubSpot collected forms
 * (`person-claim-owner`, `person-claim-notify`) receive nothing now.
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

const bandProps = { displayName: 'Example Person' };

describe('claim form HubSpot ids', () => {
	/**
	 * The owner form was retired deliberately (marketing, 2026-08-17): the band
	 * sends the candidate to Win sign-up instead of collecting their address, so
	 * HubSpot's `person-claim-owner` collected form stops receiving submissions.
	 *
	 * This is the assertion that would fail if someone re-added a form to the band
	 * without re-deciding that, which matters because a second owner form under a
	 * new HubSpot name would silently split the history of the old one.
	 */
	test('the claim band no longer collects anything for HubSpot', async () => {
		const { PersonClaimCTABand } = await import('./PersonClaimCTABand');

		await render(React.createElement(PersonClaimCTABand, bandProps));

		expect(document.querySelector('form')).toBeNull();
	});
});
