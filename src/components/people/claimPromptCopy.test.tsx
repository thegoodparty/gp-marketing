import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * Pins the notify prompt card and its dialog to the Figma unclaimed frames:
 *   card    D 1958:108619 (candidate only)   E 1928:99467 (elected official only)
 *           F 1928:100987 (serving and running — word-for-word identical to E)
 *   dialog  1901:51851
 * Past-election profiles (H 1970:113629) show the voter-guide disclaimer instead
 * of a claim prompt, so no card copy exists for that persona.
 *
 * The copy has drifted twice — first the card asked "Want to hear from [Name]?"
 * while the frames ask visitors to send a request, then the dialog was rewritten
 * into a "Claim your GoodParty.org profile" account pitch the frames never had.
 * Both times nothing caught it because no test read the words. The persona split
 * is the part most likely to regress next: it splits on holding office, not on
 * running, so `both` takes the officeholder copy.
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
	locationLabel?: string | null;
}) {
	const { ClaimProfileModal } = await import('./ClaimProfileModal');

	await render(
		React.createElement(ClaimProfileModal, {
			personId: '11111111-1111-4111-8111-111111111111',
			displayName,
			persona: options.persona,
			locationLabel: options.locationLabel ?? null,
		}),
	);
}

function card() {
	const element = document.querySelector(`[data-component='ClaimPromptCard']`);
	if (!element) throw new Error('expected the claim prompt to render');
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

describe('the notify dialog matches Figma 1901:51851', () => {
	async function openDialog() {
		await renderPromptCard({ persona: 'candidate', locationLabel: 'Springfield' });
		const { NotifyForm } = await import('./ClaimProfileModal');
		return NotifyForm;
	}

	test('the card is the only claim surface in the content well', async () => {
		await renderPromptCard({ persona: 'candidate', locationLabel: 'Springfield' });

		expect(document.querySelectorAll(`[data-component='ClaimPromptCard']`)).toHaveLength(1);
	});

	/**
	 * The dialog is one sentence asking the visitor to nudge the person. It is
	 * NOT the "create a free account and take control of this page" pitch that
	 * replaced it once — that copy sells claiming to a reader who has just told
	 * us they are somebody else.
	 */
	test('the title asks the visitor to nudge the person, not to claim', async () => {
		const { notifyDialogTitle } = await import('./ClaimProfileModal');

		expect(notifyDialogTitle(displayName)).toBe(
			`Ask ${displayName} to complete their profile and contribute to transparency.`,
		);
	});

	test('the form is name, email, opt-in, Cancel and Submit — nothing else', async () => {
		const NotifyForm = await openDialog();
		await render(
			React.createElement(NotifyForm, {
				personId: '11111111-1111-4111-8111-111111111111',
				displayName,
				onCancel: () => {},
			}),
		);

		const labels = [...document.querySelectorAll('label')].map(l => l.textContent?.trim() ?? '');
		expect(labels[0]).toBe('Name (optional)');
		expect(labels[1]).toContain('Email address');
		expect(labels[2]).toContain('Sign up for marketing communications from GoodParty.org');

		const buttons = [...document.querySelectorAll('button')].map(b => b.textContent?.trim());
		expect(buttons).toEqual(['Cancel', 'Submit']);
	});

	/** A pre-ticked opt-in is not consent; the frames draw it ticked anyway. */
	test('the marketing opt-in starts unchecked', async () => {
		const NotifyForm = await openDialog();
		await render(
			React.createElement(NotifyForm, { personId: '11111111-1111-4111-8111-111111111111', displayName }),
		);

		expect(document.querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked).toBe(false);
	});
});

describe('the claim band matches Figma 1922:92593', () => {
	async function renderBand(isRunning: boolean) {
		const { PersonClaimCTABand } = await import('./PersonClaimCTABand');
		await render(
			React.createElement(PersonClaimCTABand, {
				personId: '11111111-1111-4111-8111-111111111111',
				displayName,
				isRunning,
			}),
		);
	}

	test('the band is the page’s only place to claim, and says so in Figma’s words', async () => {
		await renderBand(true);

		expect(document.querySelector('h2')?.textContent).toBe(`Are you ${displayName}? Complete your profile now.`);
		expect(document.querySelector('h2 + div')?.textContent).toBe(
			'Your community deserves accountable leadership. Claim your profile and share your top priorities with residents. Enter your email to get started',
		);
	});

	/**
	 * The frames draw one body for every unclaimed state. It briefly branched on
	 * running vs in office, which is invented copy — the branch belongs on the
	 * routing and the confirmation, both of which are below the fold on submit.
	 */
	test('the body does not branch on the person’s product', async () => {
		await renderBand(true);
		const running = document.querySelector('h2 + div')?.textContent;

		await renderBand(false);

		expect(document.querySelector('h2 + div')?.textContent).toBe(running);
	});
});
