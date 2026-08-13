/**
 * The scroll target for the owner-facing "claim your profile" CTAs, which pull
 * the person down to the claim form at the bottom of their profile instead of
 * opening a dialog.
 *
 * Deliberately NOT the `<form id>`. `person-claim-owner` is HubSpot's key for
 * the collected form and is an external contract; keeping the scroll target on
 * a wrapper means a future layout change can move the anchor without re-keying
 * the form in HubSpot, and vice versa.
 */
export const PERSON_CLAIM_ANCHOR_ID = 'person-claim-form';

const CLAIM_FIELD_SELECTORS = ['#person-claim-owner input[name="firstname"]', '#person-claim-owner input[name="email"]'];

function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Scrolls to the claim form and moves keyboard focus into it, so keyboard and
 * screen-reader users land where sighted users are looking.
 *
 * Returns `false` when the band is not on the page. That is reachable: the
 * code-default template fallback strips the CTA banner block the band renders
 * into, which would leave the claim card on a page with no form. Callers fall
 * back to the dialog rather than leaving the button doing nothing.
 */
export function scrollToPersonClaimForm(): boolean {
	if (typeof document === 'undefined') return false;

	const anchor = document.getElementById(PERSON_CLAIM_ANCHOR_ID);
	if (!anchor) return false;

	const field = CLAIM_FIELD_SELECTORS.reduce<HTMLElement | null>(
		(found, selector) => found ?? document.querySelector<HTMLElement>(selector),
		null,
	);

	// Focus first, with preventScroll, so the browser does not jump instantly and
	// then animate — and so the smooth scroll below is what the user actually sees.
	(field ?? anchor).focus({ preventScroll: true });

	anchor.scrollIntoView?.({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
	return true;
}
