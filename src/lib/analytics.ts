'use client';

/** Amplitude Experiment flag for homepage hero A/B (`HomepageExperiment`). */
export const HOME_HERO_LAYOUT_EXPERIMENT_FLAG_KEY = 'home_hero_layout_test';

/** Values must match the Amplitude Experiment deployment for this flag. */
export const HOMEPAGE_EXPERIMENT_VARIANT_CONTROL = 'control';
export const HOMEPAGE_EXPERIMENT_VARIANT_A = 'variant-a';
export const HOMEPAGE_EXPERIMENT_VARIANT_B = 'variant-b';

export const VALID_HOMEPAGE_EXPERIMENT_VARIANTS = [
	HOMEPAGE_EXPERIMENT_VARIANT_CONTROL,
	HOMEPAGE_EXPERIMENT_VARIANT_A,
	HOMEPAGE_EXPERIMENT_VARIANT_B,
] as const;

/** Canonical app sign-up URL (matches `buttonTransformer` SignUp action). */
export const APP_SIGN_UP_HREF = 'https://app.goodparty.org/sign-up';

export function trackEvent(eventName: string, eventProperties?: Record<string, unknown>): void {
	if (typeof window === 'undefined') return;
	window.amplitude?.track(eventName, eventProperties);
}

/** Resolved variant for `HOME_HERO_LAYOUT_EXPERIMENT_FLAG_KEY` (homepage hero experiment). */
export function getHomepageExperimentVariant(): string | null {
	if (typeof window === 'undefined') return null;
	const variant = window.experiment?.variant(HOME_HERO_LAYOUT_EXPERIMENT_FLAG_KEY);
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

export function trackSignUpClicked(props: { href: string; label?: string | null }): void {
	const pagePath = typeof window !== 'undefined' ? window.location.pathname : null;
	const variant = pagePath === '/' ? getHomepageExperimentVariant() : null;

	trackEvent('Sign Up Clicked', {
		href: props.href,
		label: props.label ?? null,
		page_path: pagePath ?? null,
		variant,
	});

	void Promise.resolve(window.amplitude?.flush?.()).catch(() => undefined);
}

/** Factory for homepage CTA click handlers (used in variant data files). */
export function makeHomepageCtaOnClick(variant: string, section: string, label: string, href: string) {
	return () => {
		trackEvent('Homepage CTA Clicked', { variant, section, label, href });
	};
}
