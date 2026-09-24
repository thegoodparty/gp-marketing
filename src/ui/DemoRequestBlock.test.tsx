import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * Drives the Demo Request block's state machine end to end against a mocked
 * `/api/demo-request`: the three steps, the two verdicts, the failure path back
 * to the contact step, and the double-submit guard. The SSR mapping test lives in
 * `~/PageSections/demoRequestBlockSection.test.tsx`; this file is the interactive
 * half, set up the same way as `claimFlow.test.tsx` (JSDOM globals, a proxied
 * `window.location` so the redirect is observable, real analytics sinks).
 */

const DOM_GLOBALS = [
	'Node',
	'NodeFilter',
	'Element',
	'HTMLElement',
	'HTMLInputElement',
	'HTMLSelectElement',
	'HTMLButtonElement',
	'HTMLFormElement',
	'HTMLIFrameElement',
	'DocumentFragment',
	'DOMParser',
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
let fetchCalls: { url: string; body: Record<string, unknown> }[];
let fetchResponse: () => Promise<{ ok: boolean; status: number; body: unknown }>;

beforeEach(() => {
	dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
		url: 'http://localhost/new-demo',
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
	fetchCalls = [];
	fetchResponse = async () => ({ ok: true, status: 200, body: { outcome: 'pass', calendar_url: 'https://meetings.hubspot.com/example/demo' } });

	(window.Element.prototype as unknown as { scrollIntoView(): void }).scrollIntoView = () => {};
	const shim = window.HTMLElement.prototype as unknown as Record<string, unknown>;
	shim['attachEvent'] = () => {};
	shim['detachEvent'] = () => {};

	(window as unknown as { amplitude: unknown }).amplitude = {
		track: (name: string, props?: Record<string, unknown>) => trackedEvents.push({ name, props }),
	};
	(window as unknown as { analytics: unknown }).analytics = { track: () => {} };

	globalThis.fetch = (async (url: string, init?: { body?: string }) => {
		fetchCalls.push({ url: String(url), body: JSON.parse(init?.body ?? '{}') as Record<string, unknown> });
		const response = await fetchResponse();
		return { ok: response.ok, status: response.status, json: async () => response.body } as Response;
	}) as unknown as typeof fetch;

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

async function flush(ms = 0) {
	await new Promise<void>(resolve => {
		dom.window.setTimeout(resolve, ms);
	});
}

async function waitUntil(predicate: () => boolean, timeoutMs = 4000) {
	const started = Date.now();
	while (!predicate()) {
		if (Date.now() - started > timeoutMs) throw new Error('waitUntil timed out');
		await act(async () => {
			await flush(50);
		});
	}
}

async function render() {
	const { DemoRequestBlock } = await import('./DemoRequestBlock');
	await act(async () => {
		root = createRoot(document.getElementById('root')!);
		root.render(React.createElement(DemoRequestBlock, { heading: 'Request a demo', body: 'Tell us about your race.' }));
		await flush();
	});
}

function card() {
	return document.querySelector<HTMLElement>('[data-component="DemoRequestBlock"]')!;
}

function setValue(element: HTMLInputElement | HTMLSelectElement, value: string) {
	const proto = element instanceof dom.window.HTMLSelectElement ? dom.window.HTMLSelectElement.prototype : dom.window.HTMLInputElement.prototype;
	const setter = Object.getOwnPropertyDescriptor(proto, 'value')!.set!;
	element.focus();
	setter.call(element, value);
	element.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
	element.dispatchEvent(new dom.window.KeyboardEvent('keyup', { bubbles: true }));
	element.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
}

async function click(element: Element) {
	await act(async () => {
		element.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
		await flush();
	});
}

async function submitForm() {
	await act(async () => {
		card()
			.querySelector('form')!
			.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
		await flush();
		await flush();
	});
}

async function fillRaceAndGoals() {
	await act(async () => {
		setValue(card().querySelector<HTMLInputElement>('input[name="city"]')!, 'Traverse City');
		setValue(card().querySelector<HTMLSelectElement>('select[name="state"]')!, 'MI');
		setValue(card().querySelector<HTMLSelectElement>('select[name="office"]')!, 'council');
		await flush();
	});
	await submitForm();
	expect(card().textContent).toContain('What are you hoping GoodParty.org helps with?');

	await click(card().querySelector('input[name="goals"][value="voter_data"]')!);
	await click(card().querySelector('input[name="stage"][value="ballot"]')!);
	await submitForm();
	expect(card().textContent).toContain('How do we reach you?');
}

async function fillContact() {
	await act(async () => {
		setValue(card().querySelector<HTMLInputElement>('input[name="first_name"]')!, 'Jordan');
		setValue(card().querySelector<HTMLInputElement>('input[name="last_name"]')!, 'Rivera');
		setValue(card().querySelector<HTMLInputElement>('input[name="email"]')!, 'jordan@example.com');
		setValue(card().querySelector<HTMLInputElement>('input[name="phone"]')!, '(231) 555-0142');
		await flush();
	});
}

describe('DemoRequestBlock', () => {
	test('validates each step before moving on', async () => {
		await render();

		await submitForm();
		expect(card().textContent).toContain('Please add your city, state, and office.');
		expect(card().textContent).toContain('Where are you running?');

		await fillRaceAndGoals();

		await submitForm();
		expect(card().textContent).toContain('Please add your name, a valid email, and a mobile number.');
		expect(fetchCalls).toEqual([]);
	});

	test('posts the answers to the same-origin proxy and shows the calendar on a pass', async () => {
		await render();
		await fillRaceAndGoals();
		await fillContact();
		await submitForm();

		expect(card().textContent).toContain('Checking a few things');
		expect(fetchCalls).toHaveLength(1);
		expect(fetchCalls[0]?.url).toBe('/api/demo-request');
		expect(fetchCalls[0]?.body).toMatchObject({
			city: 'Traverse City',
			state: 'MI',
			office: 'council',
			goals: ['voter_data'],
			stage: 'ballot',
			first_name: 'Jordan',
			email: 'jordan@example.com',
			sms_consent: false,
		});

		await waitUntil(() => card().textContent?.includes('Pick a time, Jordan') ?? false);

		expect(card().querySelector('a[href="https://meetings.hubspot.com/example/demo"]')).not.toBeNull();
		expect(trackedEvents.map(e => e.name)).toContain('Demo Request Submitted');
		expect(trackedEvents.find(e => e.name === 'Demo Request Qualified')?.props).toMatchObject({ outcome: 'pass' });
	});

	test('shows the tour card and redirects when the verdict is tour', async () => {
		fetchResponse = async () => ({ ok: true, status: 200, body: { outcome: 'tour', redirect_url: '/product-tour', redirect_seconds: 1 } });
		await render();
		await fillRaceAndGoals();
		await fillContact();
		await submitForm();

		await waitUntil(() => card().textContent?.includes('Start with the product tour') ?? false);
		expect(card().textContent).toContain('Taking you there in 1 second');
		expect(card().querySelector('a[href="/product-tour"]')).not.toBeNull();

		await waitUntil(() => navigations.includes('/product-tour'), 3000);
		expect(trackedEvents.map(e => e.name)).toContain('Demo Request Tour Redirected');
	});

	test('returns to the contact step with a generic message when the proxy fails', async () => {
		fetchResponse = async () => ({ ok: false, status: 502, body: { error: 'upstream detail that must not leak' } });
		await render();
		await fillRaceAndGoals();
		await fillContact();
		await submitForm();

		await waitUntil(() => card().textContent?.includes('How do we reach you?') ?? false);
		expect(card().textContent).toContain('Something went wrong on our end.');
		expect(card().textContent).not.toContain('upstream detail');
		expect(card().querySelector<HTMLInputElement>('input[name="email"]')?.value).toBe('jordan@example.com');
	});

	test('surfaces a validation message the qualifier wrote for the candidate', async () => {
		fetchResponse = async () => ({ ok: false, status: 400, body: { error: 'Please add a mobile number.' } });
		await render();
		await fillRaceAndGoals();
		await fillContact();
		await submitForm();

		await waitUntil(() => card().textContent?.includes('Please add a mobile number.') ?? false);
	});

	test('treats an unknown verdict as a failure rather than a blank card', async () => {
		fetchResponse = async () => ({ ok: true, status: 200, body: { outcome: 'pending' } });
		await render();
		await fillRaceAndGoals();
		await fillContact();
		await submitForm();

		await waitUntil(() => card().textContent?.includes('Something went wrong on our end.') ?? false);
	});

	test('submits once even if the form is submitted twice while the request is in flight', async () => {
		let release: (() => void) | undefined;
		fetchResponse = async () =>
			new Promise(resolve => {
				release = () => resolve({ ok: true, status: 200, body: { outcome: 'pass', calendar_url: 'https://meetings.hubspot.com/example/demo' } });
			});
		await render();
		await fillRaceAndGoals();
		await fillContact();

		await submitForm();
		await act(async () => {
			card()
				.querySelector('form')
				?.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
			await flush();
		});

		expect(fetchCalls).toHaveLength(1);
		release?.();
		await waitUntil(() => card().textContent?.includes('Pick a time') ?? false);
	});
	test('escapes the calendar URL before it enters the embed markup, so a quote cannot truncate it', async () => {
		// A value with a double quote closes the data-src attribute early in the raw
		// template. DOMParser then sees a truncated URL with no ?embed=true, and the
		// rest of the string lands as junk children of the container.
		const hostile = 'https://meetings.hubspot.com/x"><img src=x>';
		fetchResponse = async () => ({ ok: true, status: 200, body: { outcome: 'pass', calendar_url: hostile } });

		await render();
		await fillRaceAndGoals();
		await fillContact();
		await submitForm();
		await waitUntil(() => card().textContent?.includes('Pick a time, Jordan') ?? false);
		await waitUntil(() => card().querySelector('iframe') !== null);

		const src = card().querySelector('iframe')!.getAttribute('src')!;
		// The attribute boundary held: the query string survived instead of being cut at the quote.
		expect(src.endsWith('?embed=true')).toBe(true);
		expect(src).toContain('%22');
		expect(src).not.toContain('"');
		// Still on an allowed host, and the parsed embed came from the container we wrote, not junk.
		expect(new URL(src).hostname).toBe('meetings.hubspot.com');
		// The plain link is untouched: React escapes that attribute itself.
		expect(card().querySelector('a[target="_blank"]')?.getAttribute('href')).toBe(hostile);
	});

});
