import { trackEvent } from '~/lib/analytics';
import { isSafeRelativeRedirect } from '~/lib/isSafeRelativeRedirect';

type RandomUuidFn = () => string;
type AssignFn = (url: string) => void;

export function handleHubSpotFormSubmission({
	formId,
	redirectTo,
	pagePath,
	randomUuid = () => crypto.randomUUID(),
	assign = url => window.location.assign(url),
}: {
	formId: string;
	redirectTo?: string;
	pagePath: string;
	randomUuid?: RandomUuidFn;
	assign?: AssignFn;
}) {
	trackEvent('Newsletter Form Submitted', {
		formId,
		page_path: pagePath,
	});

	if (redirectTo && isSafeRelativeRedirect(redirectTo)) {
		const separator = redirectTo.includes('?') ? '&' : '?';
		assign(`${redirectTo}${separator}submissionGuid=${randomUuid()}`);
	}
}
