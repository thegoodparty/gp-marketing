import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { APP_LOG_IN_HREF, APP_SIGN_UP_HREF } from '~/lib/analytics';

/**
 * `login` and `signup` are the only ComponentButton types that take no href
 * from their caller, and until Sep 2026 they rendered a bare <button> that
 * fired analytics and navigated nowhere. That is how the claimed person-profile
 * CTA shipped with a "Learn more" button that did nothing: a caller picks the
 * type, gets a button that looks finished, and nothing fails.
 *
 * So assert the rendered element, not the props: these two must resolve to the
 * app URLs Sanity's LogIn/SignUp CTA actions already resolve to, and they must
 * be links rather than buttons.
 *
 * Mounts the component directly, like the other DOM tests in the repo.
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
let trackedEvents: { name: string; props?: Record<string, unknown> }[];

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

	trackedEvents = [];
	(window as unknown as { amplitude: unknown }).amplitude = {
		track: (name: string, props?: Record<string, unknown>) => trackedEvents.push({ name, props }),
	};

	(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(async () => {
	await unmount();
	dom.window.close();
});

async function unmount() {
	const current = root;
	root = null;
	if (!current) return;
	await act(async () => {
		current.unmount();
	});
}

async function renderButton(props: Record<string, unknown>) {
	const { ComponentButton } = await import('~/ui/Inputs/Button');

	await unmount();
	await act(async () => {
		root = createRoot(document.getElementById('root')!);
		root.render(React.createElement(ComponentButton, props as never));
		await new Promise<void>(resolve => {
			dom.window.setTimeout(resolve, 0);
		});
	});
}

function rendered(): Element {
	const el = document.querySelector('#root a, #root button');
	if (!el) throw new Error('expected the button to render');
	return el;
}

describe('the button types that carry their own destination', () => {
	test('signup links to the app sign-up page', async () => {
		await renderButton({ buttonType: 'signup', label: 'Learn more' });

		expect(rendered().tagName).toBe('A');
		expect(rendered().getAttribute('href')).toBe(APP_SIGN_UP_HREF);
	});

	test('login links to the app login page', async () => {
		await renderButton({ buttonType: 'login', label: 'Log in' });

		expect(rendered().tagName).toBe('A');
		expect(rendered().getAttribute('href')).toBe(APP_LOG_IN_HREF);
	});

	test('signup still reports the click it always reported', async () => {
		await renderButton({ buttonType: 'signup', label: 'Learn more' });

		// JSDOM implements no navigation, so let the click reach the handler and
		// stop it at the document before the anchor tries to leave the page.
		document.addEventListener('click', e => e.preventDefault());
		await act(async () => {
			rendered().dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
		});

		// The event fired before this change too — on a button that could not
		// deliver anyone to sign-up, which is what made the metric misleading.
		expect(trackedEvents.map(e => e.name)).toContain('Sign Up Clicked');
	});
});
