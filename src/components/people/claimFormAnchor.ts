/**
 * Anchor on the claim band at the bottom of an unclaimed person profile, so the
 * band can be linked to directly (`/people/<slug>#person-claim-form`). Nothing
 * on the page scrolls here: the content well is notify-only, and the band is the
 * single owner-facing ask.
 *
 * Deliberately NOT an id the band's call to action carries. `person-claim-signup`
 * keys the GTM conversion and `person-claim-owner` keys HubSpot's collected form,
 * both external contracts; keeping the anchor on a wrapper means a future layout
 * change can move it without re-keying anything downstream, and vice versa.
 */
export const PERSON_CLAIM_ANCHOR_ID = 'person-claim-form';

/** The band's sign-up link — the id the GTM conversion trigger reads. */
export const PERSON_CLAIM_ACTION_ID = 'person-claim-signup';
