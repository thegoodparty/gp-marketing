import { afterEach, describe, expect, mock, test } from 'bun:test';

import { handleHubSpotFormSubmission } from './HubSpotEmbedForm';

const trackEventMock = mock(() => {});

mock.module('~/lib/analytics', () => ({
	trackEvent: trackEventMock,
}));

afterEach(() => {
	trackEventMock.mockClear();
});

describe('handleHubSpotFormSubmission', () => {
	test('redirects with submissionGuid when redirectTo is safe', () => {
		const assign = mock((_url: string) => {});
		handleHubSpotFormSubmission({
			formId: 'form-123',
			redirectTo: '/thanks',
			pagePath: '/newsletter',
			randomUuid: () => 'uuid-123',
			assign,
		});

		expect(trackEventMock).toHaveBeenCalledWith('Newsletter Form Submitted', {
			formId: 'form-123',
			page_path: '/newsletter',
		});
		expect(assign).toHaveBeenCalledWith('/thanks?submissionGuid=uuid-123');
	});

	test('does not redirect when redirectTo is unsafe', () => {
		const assign = mock((_url: string) => {});
		handleHubSpotFormSubmission({
			formId: 'form-123',
			redirectTo: 'https://evil.example',
			pagePath: '/newsletter',
			assign,
		});

		expect(trackEventMock).toHaveBeenCalledTimes(1);
		expect(assign).not.toHaveBeenCalled();
	});

	test('appends submissionGuid with ampersand when redirectTo already has query params', () => {
		const assign = mock((_url: string) => {});
		handleHubSpotFormSubmission({
			formId: 'form-123',
			redirectTo: '/thanks?foo=bar',
			pagePath: '/newsletter',
			randomUuid: () => 'uuid-456',
			assign,
		});

		expect(assign).toHaveBeenCalledWith('/thanks?foo=bar&submissionGuid=uuid-456');
	});
});
