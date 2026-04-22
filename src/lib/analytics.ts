/** Canonical app sign-up URL (matches `buttonTransformer` SignUp action). */
export const APP_SIGN_UP_HREF = 'https://app.goodparty.org/sign-up';

export function trackEvent(eventName: string, eventProperties?: Record<string, unknown>): void {
	if (typeof window === 'undefined') return;
	window.amplitude?.track(eventName, eventProperties);
}

/**
 * True when the path ends with `/sign-up` (any origin, any prefix).
 * Intentionally broad so every sign-up surface is tracked, including future
 * paths like `/partner/sign-up`. Tighten if only specific origins should match.
 */
export function isSignUpUrl(href: string | undefined | null): boolean {
	if (!href?.trim()) return false;
	const withoutQuery = href.trim().split('?')[0] ?? '';
	const path = withoutQuery.replace(/\/+$/, '').toLowerCase();
	return path.endsWith('/sign-up');
}

/**
 * Fires `'Sign Up Clicked'` for any sign-up link click.
 *
 * When `formId` is provided this also pushes a sign-up-only payload into `window.dataLayer`
 * so GTM Data Layer Variables keyed to `formId` can resolve the originating CTA.
 */
export function trackSignUpClicked(props: { href: string; label?: string | null; formId?: string | null }): void {
	const pagePath = typeof window !== 'undefined' ? window.location.pathname : null;

	trackEvent('Sign Up Clicked', {
		href: props.href,
		label: props.label ?? null,
		page_path: pagePath ?? null,
	});

	if (typeof window === 'undefined') return;

	const formId = props.formId?.trim();
	if (!formId) return;

	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({
		event: 'sign_up_click',
		formId,
	});
}
