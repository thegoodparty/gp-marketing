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
 * On the homepage this fires alongside `'Homepage CTA Clicked'` (via `experimentTracking` on `ComponentButton`).
 * The two events serve distinct funnels: `Homepage CTA Clicked` measures experiment CTA
 * engagement, while `Sign Up Clicked` tracks sign-up intent site-wide. Both are intentional.
 */
export function trackSignUpClicked(props: { href: string; label?: string | null }): void {
	const pagePath = typeof window !== 'undefined' ? window.location.pathname : null;
	const homepageVariant = pagePath === '/' ? getHomepageExperimentVariant() : null;

	trackEvent('Sign Up Clicked', {
		href: props.href,
		label: props.label ?? null,
		page_path: pagePath ?? null,
		homepage_experiment_variant: homepageVariant,
	});
}
