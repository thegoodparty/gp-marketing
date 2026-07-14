import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const handleHubSpotFormSubmissionMock = mock(() => {});

mock.module('~/lib/hubspot/handleHubSpotFormSubmission', () => ({
	handleHubSpotFormSubmission: handleHubSpotFormSubmissionMock,
}));

mock.module('~/lib/hubspot/portalId', () => ({
	getHubSpotPortalId: () => '21589597',
}));

mock.module('./hubspot-embed.css', () => ({}));

type HubSpotFormCreateOptions = {
	onFormSubmitted?(): void;
};

let createOptions: HubSpotFormCreateOptions | undefined;
let dom: JSDOM;
let root: Root;

beforeEach(() => {
	createOptions = undefined;
	handleHubSpotFormSubmissionMock.mockClear();

	dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
		url: 'http://localhost/newsletter',
	});
	const { window } = dom;

	globalThis.window = window as unknown as Window & typeof globalThis;
	globalThis.document = window.document;
	globalThis.navigator = window.navigator;

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
});
