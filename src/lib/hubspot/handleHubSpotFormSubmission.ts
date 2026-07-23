import { trackEvent } from '~/lib/analytics';
import { isSafeRelativeRedirect } from '~/lib/isSafeRelativeRedirect';

type RandomUuidFn = () => string;
type AssignFn = (url: string) => void;
type TrackFn = (eventName: string, eventProperties?: Record<string, unknown>) => void;

export function handleHubSpotFormSubmission({
	formId,
	redirectTo,
	pagePath,
	randomUuid = () => crypto.randomUUID(),
	assign = url => window.location.assign(url),
	track = trackEvent,
}: {
	formId: string;
	redirectTo?: string;
	pagePath: string;
	randomUuid?: RandomUuidFn;
	assign?: AssignFn;
	track?: TrackFn;
}) {
	track('Newsletter Form Submitted', {
		formId,
		page_path: pagePath,
	});

	if (redirectTo && isSafeRelativeRedirect(redirectTo)) {
		const separator = redirectTo.includes('?') ? '&' : '?';
		assign(`${redirectTo}${separator}submissionGuid=${randomUuid()}`);
	}
}
