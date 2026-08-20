import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * Pins the three hero attribution lines word for word (marketing, 2026-08-17,
 * approved by Emily and Jack):
 *   pledged          → "Has Taken the GoodParty.org Pledge"
 *   notPledged       → "Has Not Taken the GoodParty.org Pledge"
 *   pledgeIneligible → "Ineligible for the GoodParty.org Pledge Due to Partisan Affiliation"
 *
 * These are statements about named real people, so the wording is not ours to
 * tidy: "Has Not Taken" is not "Has not taken the pledge", and the partisan line
 * names the reason rather than implying a choice. `personSectionOverrides.test`
 * pins which state gets which line; this pins what those lines say, which
 * nothing else reads.
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

/**
 * The attribution line is whichever text sits under the office line — read off
 * the rendered hero rather than a test id, so a refactor that drops the line
 * fails here instead of passing against a selector nothing renders.
 */
function attributionText(): string {
	const hero = document.querySelector("[data-component='ProfileHero']");
	if (!hero) throw new Error('expected the hero to render');
	const line = [...hero.querySelectorAll('span, p')]
		.map(node => node.textContent?.trim() ?? '')
		.find(text => text.includes('GoodParty.org'));
	return line ?? '';
}

/**
 * The GoodParty.org logo, by the viewBox of its artwork — the hero also renders
 * an anonymous-avatar svg when there is no headshot, so a bare `svg` count would
 * never reach zero.
 */
function markCount(): number {
	return document.querySelectorAll("[data-component='ProfileHero'] svg[viewBox='35 42 137 116']").length;
}

describe('the hero pledge lines say exactly what marketing approved', () => {
	test('a person who has taken the pledge', async () => {
		await renderHero({ attribution: 'pledged', showBrandMark: true });

		expect(attributionText()).toBe('Has Taken the GoodParty.org Pledge');
	});

	test('a person who has not', async () => {
		await renderHero({ attribution: 'notPledged', showBrandMark: false });

		expect(attributionText()).toBe('Has Not Taken the GoodParty.org Pledge');
	});

	test('a major-party affiliate, who cannot', async () => {
		await renderHero({ attribution: 'pledgeIneligible', showBrandMark: false });

		expect(attributionText()).toBe('Ineligible for the GoodParty.org Pledge Due to Partisan Affiliation');
	});

	test('a removed profile says nothing about the pledge either way', async () => {
		await renderHero({ attribution: 'none', showBrandMark: false });

		expect(attributionText()).toBe('');
	});

	test('the /candidate pages keep the empowerment line they always had', async () => {
		await renderHero({ isEmpowered: true });

		expect(attributionText()).toBe('Empowered by GoodParty.org');
	});
});

describe('the GoodParty.org mark is independent of the line', () => {
	test('a claimed profile carries the mark even when the line is negative', async () => {
		await renderHero({ attribution: 'notPledged', showBrandMark: true });

		expect(attributionText()).toBe('Has Not Taken the GoodParty.org Pledge');
		expect(markCount()).toBeGreaterThan(0);
	});

	test('an unclaimed profile carries none, however affirmative the line', async () => {
		await renderHero({ attribution: 'pledged', showBrandMark: false });

		expect(attributionText()).toBe('Has Taken the GoodParty.org Pledge');
		expect(markCount()).toBe(0);
	});
});
