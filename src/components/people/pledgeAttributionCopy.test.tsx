import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { PLEDGE_CALLOUT_LINK_LABEL, pledgeCalloutCopy } from '~/ui/_lib/attributionCopy';

/**
 * Pins the hero's pledge callout word for word (Voter Guide frames; Emily,
 * 2026-10-06, replacing the one-line status approved 2026-08-17):
 *   pledged          → "This candidate took the GoodParty.org Pledge, promising to
 *                       serve people first, independent of both major parties and
 *                       big-money interests."
 *   notPledged       → "This candidate has not yet taken the GoodParty.org Pledge to
 *                       serve people first, independent of both major parties and
 *                       big-money interests."
 *   pledgeIneligible → "This candidate is ineligible for the GoodParty.org Pledge due
 *                       to partisan affiliation."
 * with "candidate" swapped for "elected official" on an officeholder's page, and
 * "Read the full pledge" opening the pledge pop-up after each sentence.
 *
 * These are statements about named real people, so the wording is not ours to
 * tidy: the negative line says the person has not taken it rather than softening
 * to something vaguer, and the partisan line names the reason rather than
 * implying a choice.
 *
 * `personSectionOverrides.test` pins which state gets which sentence and which
 * subject; this pins what those sentences say, which nothing else reads.
 *
 * Also pins that the /candidate framing ("Empowered by GoodParty.org") is
 * untouched — it shares this component and was not part of the request.
 *
 * Mounts the component directly, like the other DOM tests in this folder.
 */

const DOM_GLOBALS = [
	'Node',
	'NodeFilter',
	'Element',
	'HTMLElement',
	'HTMLAnchorElement',
	'HTMLButtonElement',
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

/** Every case renders more than once, and React allows one root per container. */
async function unmount() {
	const current = root;
	root = null;
	if (!current) return;
	await act(async () => {
		current.unmount();
	});
}

async function renderHero(props: Record<string, unknown>) {
	const { ProfileHero } = await import('~/ui/ProfileHero');

	await unmount();
	await act(async () => {
		root = createRoot(document.getElementById('root')!);
		root.render(
			React.createElement(ProfileHero, {
				candidateName: 'Example Person',
				office: 'City Council',
				...props,
			} as never),
		);
		await new Promise<void>(resolve => {
			dom.window.setTimeout(resolve, 0);
		});
	});
}

const MARK_SELECTOR = "svg[viewBox='35 42 137 116']";

function hero(): Element {
	const el = document.querySelector("[data-component='ProfileHero']");
	if (!el) throw new Error('expected the hero to render');
	return el;
}

function callout(): Element | null {
	return hero().querySelector("[data-component='ProfileHeroPledgeCallout']");
}

/** The callout's sentence, without the pop-up link that follows it. */
function calloutSentence(): string {
	const box = callout();
	if (!box) throw new Error('expected the pledge callout to render');
	const paragraph = box.querySelector('p');
	if (!paragraph) throw new Error('expected the callout sentence');
	return [...paragraph.childNodes]
		.filter(node => !(node instanceof HTMLButtonElement))
		.map(node => node.textContent ?? '')
		.join('')
		.trim();
}

function calloutButton(): HTMLButtonElement {
	const button = callout()?.querySelector('button');
	if (!button) throw new Error('expected the pop-up link');
	return button;
}

/** The trigger's own words, without the arrow icon's accessible title. */
function calloutButtonLabel(): string {
	return [...calloutButton().childNodes]
		.filter(node => node.nodeType === Node.TEXT_NODE)
		.map(node => node.textContent ?? '')
		.join('')
		.trim();
}

/**
 * The legacy attribution line is whichever text sits under the office line —
 * read off the rendered hero rather than a test id, so a refactor that drops the
 * line fails here instead of passing against a selector nothing renders.
 */
function attributionText(): string {
	const line = [...hero().querySelectorAll('span, p')]
		.filter(node => !node.closest("[data-component='ProfileHeroPledgeCallout']"))
		.map(node => node.textContent?.trim() ?? '')
		.find(text => text.includes('GoodParty.org'));
	return line ?? '';
}

/**
 * The GoodParty.org mark on the portrait, by the viewBox of its artwork — the
 * hero also renders an anonymous-avatar svg when there is no headshot, so a bare
 * `svg` count would never reach zero. The mark inside the callout is counted
 * separately: it follows the pledge, not the claim.
 */
function portraitMarkCount(): number {
	return [...hero().querySelectorAll(MARK_SELECTOR)].filter(svg => !svg.closest("[data-component='ProfileHeroPledgeCallout']")).length;
}

function calloutMarkCount(): number {
	return callout()?.querySelectorAll(MARK_SELECTOR).length ?? 0;
}

describe('the hero pledge callout says exactly what marketing approved', () => {
	test('a candidate who has taken the pledge', async () => {
		await renderHero({ attribution: 'pledged', showBrandMark: true });

		expect(calloutSentence()).toBe(
			'This candidate took the GoodParty.org Pledge, promising to serve people first, independent of both major parties and big-money interests.',
		);
	});

	test('a candidate who has not', async () => {
		await renderHero({ attribution: 'notPledged', showBrandMark: false });

		expect(calloutSentence()).toBe(
			'This candidate has not yet taken the GoodParty.org Pledge to serve people first, independent of both major parties and big-money interests.',
		);
	});

	test('a major-party candidate, who cannot', async () => {
		await renderHero({ attribution: 'pledgeIneligible', showBrandMark: false });

		expect(calloutSentence()).toBe('This candidate is ineligible for the GoodParty.org Pledge due to partisan affiliation.');
	});

	test('an elected official gets the same sentences about an elected official', async () => {
		await renderHero({ attribution: 'pledged', pledgeSubject: 'elected official' });
		expect(calloutSentence()).toBe(
			'This elected official took the GoodParty.org Pledge, promising to serve people first, independent of both major parties and big-money interests.',
		);

		await renderHero({ attribution: 'notPledged', pledgeSubject: 'elected official' });
		expect(calloutSentence()).toBe(
			'This elected official has not yet taken the GoodParty.org Pledge to serve people first, independent of both major parties and big-money interests.',
		);

		await renderHero({ attribution: 'pledgeIneligible', pledgeSubject: 'elected official' });
		expect(calloutSentence()).toBe('This elected official is ineligible for the GoodParty.org Pledge due to partisan affiliation.');
	});

	test('the sentence on screen is the shared copy, split around the bold pledge name without losing a word', async () => {
		for (const mode of ['pledged', 'notPledged', 'pledgeIneligible'] as const) {
			await renderHero({ attribution: mode });
			expect(calloutSentence()).toBe(pledgeCalloutCopy(mode, 'candidate'));
			expect(callout()?.querySelector('.font-semibold')?.textContent).toBe('GoodParty.org Pledge');
		}
	});

	test('a profile with nothing to say renders no callout', async () => {
		await renderHero({ attribution: 'none', showBrandMark: false });

		expect(callout()).toBeNull();
		expect(attributionText()).toBe('');
	});

	test('the /candidate pages keep the empowerment line they always had, and no callout', async () => {
		await renderHero({ isEmpowered: true });

		expect(attributionText()).toBe('Empowered by GoodParty.org');
		expect(callout()).toBeNull();
	});
});

/**
 * "Read the full pledge" opens the pledge pop-up (the same one the featured
 * candidates and position pages use); there is no pledge page on the site, so
 * it is a button, not a link, and nothing in the callout navigates anywhere.
 */
describe('"Read the full pledge" opens the pop-up', () => {
	for (const mode of ['pledged', 'notPledged', 'pledgeIneligible'] as const) {
		test(`${mode} carries the pop-up trigger and no link`, async () => {
			await renderHero({ attribution: mode });

			expect(calloutButtonLabel()).toBe(PLEDGE_CALLOUT_LINK_LABEL);
			expect(calloutButton().getAttribute('aria-haspopup')).toBe('dialog');
			expect(callout()?.querySelectorAll('a')).toHaveLength(0);
		});
	}
});

describe('the GoodParty.org marks', () => {
	test('the callout carries the mark only when the person took the pledge', async () => {
		await renderHero({ attribution: 'pledged', showBrandMark: false });
		expect(calloutMarkCount()).toBe(1);

		await renderHero({ attribution: 'notPledged', showBrandMark: true });
		expect(calloutMarkCount()).toBe(0);

		await renderHero({ attribution: 'pledgeIneligible', showBrandMark: true });
		expect(calloutMarkCount()).toBe(0);
	});

	test('the portrait mark follows the claim, not the pledge', async () => {
		// A claimed profile carries the mark even when the sentence is negative.
		await renderHero({ attribution: 'notPledged', showBrandMark: true });
		expect(portraitMarkCount()).toBeGreaterThan(0);

		// An unclaimed profile carries none, however affirmative the sentence.
		await renderHero({ attribution: 'pledged', showBrandMark: false });
		expect(portraitMarkCount()).toBe(0);
	});
});

describe('the intro paragraph', () => {
	test('renders between the office line and the callout when supplied', async () => {
		await renderHero({ attribution: 'pledged', intro: 'Learn about Example Person’s candidacy and positions on the issues.' });

		const paragraphs = [...hero().querySelectorAll('p')].map(p => p.textContent?.trim() ?? '');
		const introAt = paragraphs.findIndex(text => text.startsWith('Learn about Example Person'));
		const officeAt = paragraphs.findIndex(text => text === 'City Council');
		const calloutAt = paragraphs.findIndex(text => text.startsWith('This candidate took'));
		expect(introAt).toBeGreaterThan(officeAt);
		expect(calloutAt).toBeGreaterThan(introAt);
	});

	test('renders nothing without one (the legacy /candidate pages)', async () => {
		await renderHero({ isEmpowered: true });

		expect([...hero().querySelectorAll('p')].some(p => p.textContent?.startsWith('Learn about'))).toBe(false);
	});
});
