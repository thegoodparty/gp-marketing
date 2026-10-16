import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * Pins the claim band to the Figma unclaimed frame (1922:92593).
 *
 * The visitor-facing "ask [Name] to complete their profile" card and its notify
 * dialog used to be pinned here too. Marketing removed them (2026-10-16), so the
 * band is the only claim surface left on an unclaimed profile.
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

/** Several cases render more than once, and React only allows one root per container. */
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
			window.setTimeout(resolve, 0);
		});
	});
}

const displayName = 'Example Person';

describe('the claim band matches Figma 1922:92593', () => {
	async function renderBand() {
		const { PersonClaimCTABand } = await import('./PersonClaimCTABand');
		await render(React.createElement(PersonClaimCTABand, { displayName }));
	}

	/**
	 * The heading is the frame's, verbatim, and it is the page's ONLY "Are you
	 * [Name]?".
	 *
	 * The body's last clause is not the frame's. Figma ends "Enter your email to
	 * get started" because the frame draws an inline form here; marketing replaced
	 * that form with a link into Win sign-up (2026-08-17), so the sentence had to
	 * name what the button actually does. The rest is the frame's one body for
	 * every unclaimed state — it does not branch on running vs in office, and the
	 * band takes no prop it could branch on.
	 */
	test('the band is the page’s only place to claim, and says so in Figma’s words', async () => {
		await renderBand();

		expect(document.querySelector('h2')?.textContent).toBe(`Are you ${displayName}? Complete your profile now.`);
		expect(document.querySelector('h2 + div')?.textContent).toBe(
			'Your community deserves accountable leadership. Claim your profile and share why you\u2019re running and your top priorities with residents. Create a free GoodParty.org account to get started.',
		);
	});
});
