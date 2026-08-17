/**
 * The scroll target for the owner-facing "claim your profile" CTAs, which pull
 * the person down to the claim band at the bottom of their profile instead of
 * opening a dialog.
 *
 * Deliberately NOT the id the band's CTA carries. `person-claim-owner` is the
 * GTM/HubSpot key for that surface and is an external contract; keeping the
 * scroll target on a wrapper means a future layout change can move the anchor
 * without re-keying anything downstream, and vice versa.
 */
export const PERSON_CLAIM_ANCHOR_ID = 'person-claim-form';

/** The band's sign-up button — what focus lands on after the scroll. */
export const PERSON_CLAIM_ACTION_ID = 'person-claim-signup';

function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Scrolls to the claim band and moves keyboard focus onto its call to action, so
 * keyboard and screen-reader users land where sighted users are looking.
 *
 * Returns `false` when the band is not on the page. That is reachable: the
 * code-default template fallback strips the CTA banner block the band renders
 * into, which would leave the claim card on a page with no band. Callers fall
 * back to the dialog rather than leaving the button doing nothing.
 */
export function scrollToPersonClaimForm(): boolean {
	if (typeof document === 'undefined') return false;

	const anchor = document.getElementById(PERSON_CLAIM_ANCHOR_ID);
	if (!anchor) return false;

	const action = document.getElementById(PERSON_CLAIM_ACTION_ID);

	// Focus first, with preventScroll, so the browser does not jump instantly and
	// then animate — and so the smooth scroll below is what the user actually sees.
	(action ?? anchor).focus({ preventScroll: true });

	anchor.scrollIntoView?.({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
	return true;
}
