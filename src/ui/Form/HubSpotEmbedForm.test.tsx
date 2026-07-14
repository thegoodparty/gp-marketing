import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import type { HubSpotFormsApi } from './waitForHubSpotForms';

const handleHubSpotFormSubmissionMock = mock(() => {});

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

mock.module('~/lib/hubspot/handleHubSpotFormSubmission', () => ({
	handleHubSpotFormSubmission: handleHubSpotFormSubmissionMock,
}));

mock.module('~/lib/hubspot/portalId', () => ({
	getHubSpotPortalId: () => '21589597',
}));

mock.module('./hubspot-embed.css', () => ({}));

mock.module('./waitForHubSpotForms', () => ({
	waitForHubSpotForms: (...args: Parameters<typeof defaultWaitForHubSpotForms>) =>
		waitForHubSpotFormsMock(...args),
}));

type HubSpotFormCreateOptions = {
	onFormReady?(): void;
	onFormSubmitted?(): void;
};

let createOptions: HubSpotFormCreateOptions | undefined;
let dom: JSDOM;
let root: Root;

beforeEach(() => {
	createOptions = undefined;
	handleHubSpotFormSubmissionMock.mockClear();
	waitForHubSpotFormsMock.mockImplementation(defaultWaitForHubSpotForms);

	dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
		url: 'http://localhost/newsletter',
	});
	const { window } = dom;

	globalThis.window = window as unknown as Window & typeof globalThis;
	globalThis.document = window.document;
	globalThis.navigator = window.navigator;
	globalThis.HTMLIFrameElement = window.HTMLIFrameElement;
	globalThis.HTMLInputElement = window.HTMLInputElement;
	globalThis.HTMLButtonElement = window.HTMLButtonElement;

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
				React.createElement(HubSpotEmbedForm, { formId: 'form-123', redirectTo: '/thanks' }),
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
			root.render(
				React.createElement(HubSpotEmbedForm, { formId: 'form-123', submitLabel: 'Subscribe now' }),
			);
			await new Promise<void>(resolve => {
				window.setTimeout(resolve, 0);
			});
		});

		expect(createOptions?.onFormReady).toBeDefined();

		const target = document.querySelector('.gp-hubspot-form-target') as HTMLElement;
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
			root.render(
				React.createElement(HubSpotEmbedForm, { formId: 'form-123', submitLabel: 'Subscribe now' }),
			);
			await new Promise<void>(resolve => {
				window.setTimeout(resolve, 0);
			});
		});

		expect(createOptions?.onFormReady).toBeDefined();

		const target = document.querySelector('.gp-hubspot-form-target') as HTMLElement;
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

	test('shows fallback with contact link when HubSpot script fails to load', async () => {
		waitForHubSpotFormsMock.mockImplementation(() => Promise.reject(new Error('timeout')));

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
		waitForHubSpotFormsMock.mockImplementation(() => new Promise(() => {}));

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
