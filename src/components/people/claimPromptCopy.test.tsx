import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * Pins the voter-facing claim prompt card to the Figma unclaimed frames:
 *   D 1958:108619 (candidate only)   E 1928:99467 (elected official only)
 *   F 1928:100987 (serving and running — word-for-word identical to E)
 * Past-election profiles (H 1970:113629) show the voter-guide disclaimer instead
 * of a claim prompt, so no card copy exists for that persona.
 *
 * The copy drifted once already (the shipped card asked "Want to hear from
 * [Name]?" while the frames ask visitors to send a request), which nothing
 * caught because no test read the card's words. The persona split is the part
 * most likely to regress: it is NOT the owner card's running/not-running one.
 *
 * Like claimFormIds.test.tsx these mount the component directly rather than
 * driving the Radix dialog, whose click delegation has proven unreliable under
 * JSDOM, and nothing here mocks `~/lib/analytics` (a partial mock of it drops
 * exports other importers rely on).
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

async function renderPromptCard(options: {
	persona: 'candidate' | 'officeholder' | 'both';
	variant?: 'voter-card' | 'owner-card';
	locationLabel?: string | null;
}) {
	const { ClaimProfileModal } = await import('./ClaimProfileModal');

	await render(
		React.createElement(ClaimProfileModal, {
			personId: '11111111-1111-4111-8111-111111111111',
			displayName,
			persona: options.persona,
			locationLabel: options.locationLabel ?? null,
			variant: options.variant ?? 'voter-card',
		}),
	);
}

function card(variant: 'voter-card' | 'owner-card' = 'voter-card') {
	const element = document.querySelector(`[data-component='ClaimPromptCard'][data-variant='${variant}']`);
	if (!element) throw new Error(`expected the ${variant} claim prompt to render`);
	return {
		heading: element.querySelector('h2')?.textContent ?? '',
		body: element.querySelector('h2 + div')?.textContent ?? '',
		// The label sits in Button's own wrapper div; reading the whole button
		// would pick up the arrow icon's <title> text too.
		button: element.querySelector('button > div')?.textContent ?? '',
	};
}

describe('the voter claim prompt card matches the Figma frames', () => {
	test('a candidate asks the visitor to vote informed (D 1958:108619)', async () => {
		await renderPromptCard({ persona: 'candidate', locationLabel: 'Springfield' });

		expect(card().heading).toBe(
			`Want to learn more about this candidate? Ask ${displayName} to complete their profile.`,
		);
		expect(card().body).toBe(
			`Step into the voting booth fully informed. Send a message to ${displayName} to share their top issues.`,
		);
	});

	test('an elected official asks for transparency in their place (E 1928:99467)', async () => {
		await renderPromptCard({ persona: 'officeholder', locationLabel: 'Springfield' });

		expect(card().heading).toBe(
			`Springfield deserves greater transparency. Ask ${displayName} to complete their profile.`,
		);
		expect(card().body).toBe(
			`Advocate for transparency in local government. Send a message to ${displayName} to share their top priorities and accomplishments with constituents like you.`,
		);
	});

	/**
	 * The trap this file exists for. `both` is running, so the owner card treats
	 * it as a candidate — but frame F copies E word for word, because what a
	 * visitor wants from someone already in office is their record.
	 */
	test('serving and running takes the officeholder copy, not the candidate copy (F 1928:100987)', async () => {
		await renderPromptCard({ persona: 'both', locationLabel: 'Springfield' });
		const both = card();

		await renderPromptCard({ persona: 'officeholder', locationLabel: 'Springfield' });

		expect(both).toEqual(card());
	});

	test('a profile with no resolvable place still reads as a sentence', async () => {
		await renderPromptCard({ persona: 'officeholder', locationLabel: null });

		expect(card().heading).toBe(
			`Your community deserves greater transparency. Ask ${displayName} to complete their profile.`,
		);
		expect(card().heading).not.toContain('undefined');
		expect(card().heading).not.toContain('null');
	});

	/** The frames label this "Send request"; it used to read "Notify [Name]". */
	test('every persona sends the visitor to the same "Send request" button', async () => {
		for (const persona of ['candidate', 'officeholder', 'both'] as const) {
			await renderPromptCard({ persona, locationLabel: 'Springfield' });
			expect([persona, card().button]).toEqual([persona, 'Send request']);
		}
	});
});

describe('the owner claim prompt card is untouched by the voter copy', () => {
	/**
	 * The two cards share a component and sit next to each other in the content
	 * well, so voter copy leaking into the owner card would be easy to miss.
	 */
	test('the owner card keeps its own heading and button', async () => {
		await renderPromptCard({ persona: 'candidate', variant: 'owner-card', locationLabel: 'Springfield' });

		expect(card('owner-card').heading).toBe(`Are you ${displayName}?`);
		expect(card('owner-card').button).toBe('Complete your profile');
	});
});
