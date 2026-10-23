import { trackEvent } from '~/lib/analytics';
import { isSafeRelativeRedirect } from '~/lib/isSafeRelativeRedirect';

type RandomUuidFn = () => string;
type AssignFn = (url: string) => void;
type TrackFn = (eventName: string, eventProperties?: Record<string, unknown>) => void;

export function handleHubSpotFormSubmission({
	formId,
	redirectTo,
	pagePath,
	experiment,
	randomUuid = () => crypto.randomUUID(),
	assign = url => window.location.assign(url),
	track = trackEvent,
}: {
	formId: string;
	redirectTo?: string;
	pagePath: string;
	/** A/B test arm the form sat in, recorded on the event as flag_key and variant. */
	experiment?: { flagKey: string; variant: string };
	randomUuid?: RandomUuidFn;
	assign?: AssignFn;
	track?: TrackFn;
}) {
	track('Newsletter Form Submitted', {
		formId,
		page_path: pagePath,
		...(experiment ? { flag_key: experiment.flagKey, variant: experiment.variant } : {}),
	});

	if (redirectTo && isSafeRelativeRedirect(redirectTo)) {
		const separator = redirectTo.includes('?') ? '&' : '?';
		assign(`${redirectTo}${separator}submissionGuid=${randomUuid()}`);
	}
}
