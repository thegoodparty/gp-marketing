'use client';

const HOMEPAGE_EXPERIMENT_FLAG_KEY = 'home_hero_layout_test';

/** Canonical app sign-up URL (matches `buttonTransformer` SignUp action). */
export const APP_SIGN_UP_HREF = 'https://app.goodparty.org/sign-up';

export function trackEvent(eventName: string, eventProperties?: Record<string, unknown>): void {
	if (typeof window === 'undefined') return;
	window.amplitude?.track(eventName, eventProperties);
}

export function getExperimentVariant(flagKey: string = HOMEPAGE_EXPERIMENT_FLAG_KEY): string | null {
	if (typeof window === 'undefined') return null;
	const variant = window.experiment?.variant(flagKey);
	return variant?.value ?? null;
}

/**
 * True for marketing `/sign-up` rewrite targets and full app sign-up URLs.
 */
export function isSignUpUrl(href: string | undefined | null): boolean {
	if (!href?.trim()) return false;
	const withoutQuery = href.trim().split('?')[0] ?? '';
	const path = withoutQuery.replace(/\/+$/, '').toLowerCase();
	return path.endsWith('/sign-up');
}

export function trackSignUpClicked(props: { href: string; label?: string }): void {
	const variant = getExperimentVariant();
	const pagePath = typeof window !== 'undefined' ? window.location.pathname : undefined;
	trackEvent('Sign Up Clicked', {
		href: props.href,
		...(props.label ? { label: props.label } : {}),
		...(pagePath ? { page_path: pagePath } : {}),
		...(variant != null ? { variant } : {}),
	});
}
