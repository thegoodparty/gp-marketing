import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import type { handleHubSpotFormSubmission } from '~/lib/hubspot/handleHubSpotFormSubmission';

import type { HubSpotFormsApi } from './waitForHubSpotForms';

const handleHubSpotFormSubmissionMock = mock<typeof handleHubSpotFormSubmission>(() => {});

async function defaultWaitForHubSpotForms(isCancelled: () => boolean): Promise<HubSpotFormsApi> {
	if (isCancelled()) {
		throw new Error('HubSpot form wait cancelled');
	}

	const forms = window.hbspt?.forms;
	if (forms?.create) {
		return forms;
	}

	throw new Error('HubSpot forms script did not load');
}

const waitForHubSpotFormsMock = mock(defaultWaitForHubSpotForms);

mock.module('./hubspot-embed.css', () => ({}));

mock.module('./waitForHubSpotForms', () => ({
	waitForHubSpotForms: async (...args: Parameters<typeof defaultWaitForHubSpotForms>) => waitForHubSpotFormsMock(...args),
}));

type HubSpotFormCreateOptions = {
	onFormReady?(): void;
	onFormSubmitted?(): void;
};

let createOptions: HubSpotFormCreateOptions | undefined;
let dom: JSDOM;
let root: Root;

beforeEach(async () => {
	createOptions = undefined;
	handleHubSpotFormSubmissionMock.mockClear();
	waitForHubSpotFormsMock.mockImplementation(defaultWaitForHubSpotForms);

	const { _resetHostFontFacesCacheForTest } = await import('./HubSpotEmbedForm');
	_resetHostFontFacesCacheForTest();

	dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
		url: 'http://localhost/newsletter',
	});
	const { window } = dom;

	globalThis.window = window as unknown as Window & typeof globalThis;
	globalThis.document = window.document;
	globalThis.navigator = window.navigator;
	globalThis.getComputedStyle = window.getComputedStyle.bind(window);
	globalThis.HTMLIFrameElement = window.HTMLIFrameElement;
	globalThis.HTMLInputElement = window.HTMLInputElement;
	globalThis.HTMLButtonElement = window.HTMLButtonElement;
	globalThis.HTMLStyleElement = window.HTMLStyleElement;

	window.hbspt = {
		forms: {
			create: (options: HubSpotFormCreateOptions) => {
				createOptions = options;
			},
		},
	};
});

afterEach(() => {
	root?.unmount();
	dom.window.close();
});

describe('HubSpotEmbedForm', () => {
	test('wires hbspt onFormSubmitted to handleHubSpotFormSubmission', async () => {
		const { HubSpotEmbedForm } = await import('./HubSpotEmbedForm');

		await act(async () => {
			root = createRoot(document.getElementById('root')!);
			root.render(
				React.createElement(HubSpotEmbedForm, { formId: 'form-123', redirectTo: '/thanks', onFormSubmit: handleHubSpotFormSubmissionMock }),
			);
			await new Promise<void>(resolve => {
				window.setTimeout(resolve, 0);
			});
		});

		expect(createOptions?.onFormSubmitted).toBeDefined();

		await act(async () => {
			createOptions?.onFormSubmitted?.();
		});

		expect(handleHubSpotFormSubmissionMock).toHaveBeenCalledWith({
			formId: 'form-123',
			redirectTo: '/thanks',
			pagePath: '/newsletter',
		});
	});

	test('applySubmitLabel updates input submit button on form ready', async () => {
		const { HubSpotEmbedForm } = await import('./HubSpotEmbedForm');

		await act(async () => {
			root = createRoot(document.getElementById('root')!);
			root.render(React.createElement(HubSpotEmbedForm, { formId: 'form-123', submitLabel: 'Subscribe now' }));
			await new Promise<void>(resolve => {
				window.setTimeout(resolve, 0);
			});
		});

		expect(createOptions?.onFormReady).toBeDefined();

		const target = document.querySelector('.gp-hubspot-form-target')!;
		const input = document.createElement('input');
		input.type = 'submit';
		input.value = 'Submit';
		input.className = 'hs-button';
		target.appendChild(input);

		await act(async () => {
			createOptions?.onFormReady?.();
		});

		expect(input.value).toBe('Subscribe now');
	});

	test('applySubmitLabel updates button submit element on form ready', async () => {
		const { HubSpotEmbedForm } = await import('./HubSpotEmbedForm');

		await act(async () => {
			root = createRoot(document.getElementById('root')!);
			root.render(React.createElement(HubSpotEmbedForm, { formId: 'form-123', submitLabel: 'Subscribe now' }));
			await new Promise<void>(resolve => {
				window.setTimeout(resolve, 0);
			});
		});

		expect(createOptions?.onFormReady).toBeDefined();

		const target = document.querySelector('.gp-hubspot-form-target')!;
		const button = document.createElement('button');
		button.type = 'submit';
		button.textContent = 'Submit';
		button.className = 'hs-button';
		target.appendChild(button);

		await act(async () => {
			createOptions?.onFormReady?.();
		});

		expect(button.textContent).toBe('Subscribe now');
	});

	test('applyBrandStyles injects the brand stylesheet into the form iframe on form ready', async () => {
		const { HubSpotEmbedForm } = await import('./HubSpotEmbedForm');

		await act(async () => {
			root = createRoot(document.getElementById('root')!);
			root.render(React.createElement(HubSpotEmbedForm, { formId: 'form-123' }));
			await new Promise<void>(resolve => {
				window.setTimeout(resolve, 0);
			});
		});

		expect(createOptions?.onFormReady).toBeDefined();

		const target = document.querySelector('.gp-hubspot-form-target')!;
		const iframe = document.createElement('iframe');
		target.appendChild(iframe);

		await act(async () => {
			createOptions?.onFormReady?.();
		});

		const injected = iframe.contentDocument?.getElementById('gp-hubspot-brand');
		expect(injected).not.toBeNull();
		expect(injected?.tagName).toBe('STYLE');
		expect(injected?.textContent).toContain('.hs-button');
	});

	test('an empty first pass does not poison the font cache; later faces still forward', async () => {
		const { HubSpotEmbedForm } = await import('./HubSpotEmbedForm');

		await act(async () => {
			root = createRoot(document.getElementById('root')!);
			root.render(React.createElement(HubSpotEmbedForm, { formId: 'form-123' }));
			await new Promise<void>(resolve => {
				window.setTimeout(resolve, 0);
			});
		});

		expect(createOptions?.onFormReady).toBeDefined();

		const target = document.querySelector('.gp-hubspot-form-target')!;

		// First form ready fires before any @font-face has parsed: nothing to forward,
		// and the empty result must not be cached.
		const emptyIframe = document.createElement('iframe');
		target.appendChild(emptyIframe);
		await act(async () => {
			createOptions?.onFormReady?.();
		});
		expect(emptyIframe.contentDocument?.getElementById('gp-hubspot-fonts')).toBeNull();

		// A stylesheet with a font face parses in; a later form ready must pick it up,
		// which only holds if the earlier empty pass did not poison the cache.
		const style = document.createElement('style');
		style.textContent = '@font-face { font-family: "TestFont"; src: url(/fonts/test.woff2); }';
		document.head.appendChild(style);

		target.removeChild(emptyIframe);
		const iframe = document.createElement('iframe');
		target.appendChild(iframe);
		await act(async () => {
			createOptions?.onFormReady?.();
		});

		const fonts = iframe.contentDocument?.getElementById('gp-hubspot-fonts');
		expect(fonts).not.toBeNull();
		expect(fonts?.tagName).toBe('STYLE');
		expect(fonts?.textContent).toContain('TestFont');
	});

	test('picks on-section text colour from the background behind the form', async () => {
		const { HubSpotEmbedForm } = await import('./HubSpotEmbedForm');

		await act(async () => {
			root = createRoot(document.getElementById('root')!);
			root.render(React.createElement(HubSpotEmbedForm, { formId: 'form-123' }));
			await new Promise<void>(resolve => {
				window.setTimeout(resolve, 0);
			});
		});

		const target = document.querySelector('.gp-hubspot-form-target')!;
		const iframe = document.createElement('iframe');
		target.appendChild(iframe);

		// Put the background on an ancestor above the component's own wrapper (as a
		// page section does), so the test exercises the walk past intermediate nodes.
		const section = document.getElementById('root')!;

		// Light (cream) section -> dark text.
		section.style.backgroundColor = 'rgb(252, 248, 243)';
		await act(async () => {
			createOptions?.onFormReady?.();
		});
		expect(iframe.contentDocument?.documentElement.style.getPropertyValue('--gp-form-text')).toBe('hsl(220 58% 10%)');

		// Dark (midnight hero) section -> light text.
		section.style.backgroundColor = 'rgb(11, 21, 40)';
		await act(async () => {
			createOptions?.onFormReady?.();
		});
		expect(iframe.contentDocument?.documentElement.style.getPropertyValue('--gp-form-text')).toBe('#fff');
	});

	test('shows fallback with contact link when HubSpot script fails to load', async () => {
		waitForHubSpotFormsMock.mockImplementation(async () => Promise.reject(new Error('timeout')));

		const { HubSpotEmbedForm } = await import('./HubSpotEmbedForm');

		await act(async () => {
			root = createRoot(document.getElementById('root')!);
			root.render(React.createElement(HubSpotEmbedForm, { formId: 'form-123' }));
			await new Promise<void>(resolve => {
				window.setTimeout(resolve, 0);
			});
		});

		expect(document.body.textContent).toContain('Form failed to load');
		const contactLink = document.querySelector('a[href="/contact"]');
		expect(contactLink).not.toBeNull();
		expect(contactLink?.textContent).toBe('contact us');
	});

	test('does not show fallback when unmounted before HubSpot script loads', async () => {
		waitForHubSpotFormsMock.mockImplementation(async () => new Promise(() => {}));

		const { HubSpotEmbedForm } = await import('./HubSpotEmbedForm');

		await act(async () => {
			root = createRoot(document.getElementById('root')!);
			root.render(React.createElement(HubSpotEmbedForm, { formId: 'form-123' }));
			await new Promise<void>(resolve => {
				window.setTimeout(resolve, 0);
			});
		});

		await act(async () => {
			root.unmount();
			await new Promise<void>(resolve => {
				window.setTimeout(resolve, 0);
			});
		});

		expect(document.body.textContent).not.toContain('Form failed to load');
	});
});
