import { afterEach, describe, expect, mock, test } from 'bun:test';

import { handleHubSpotFormSubmission } from '~/lib/hubspot/handleHubSpotFormSubmission';

const trackMock = mock((_eventName: string, _eventProperties?: Record<string, unknown>) => {});

afterEach(() => {
	trackMock.mockClear();
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
			track: trackMock,
		});

		expect(trackMock).toHaveBeenCalledWith('Newsletter Form Submitted', {
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
			track: trackMock,
		});

		expect(trackMock).toHaveBeenCalledTimes(1);
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
			track: trackMock,
		});

		expect(assign).toHaveBeenCalledWith('/thanks?foo=bar&submissionGuid=uuid-456');
	});
});
