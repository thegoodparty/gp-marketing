/**
 * The claim sign-up's form id, pushed with `Sign Up Clicked` into the dataLayer
 * and keyed by the GTM conversion variable. It was HubSpot's key for the owner
 * form that preceded the sign-up button, then the hard-coded claim band's; the
 * Studio Claim Profile Block on unclaimed profiles carries it now, so clicks
 * keep landing on the variable already wired up for this surface.
 */
export const PERSON_CLAIM_FORM_ID = 'person-claim-owner';

/**
 * Added to the claim button's sign-up link as `signup_source`, so app.goodparty.org
 * can tell a claim click apart from every other sign-up. The app shows its claim
 * variation of the sign-up page only for this value, and only while its Amplitude
 * flag is on. The pledge band's "Take the pledge" button deliberately does not
 * carry it.
 */
export const PERSON_CLAIM_SIGNUP_SOURCE = 'profile_claim';
