/**
 * Anchor on the claim band at the bottom of an unclaimed person profile, so the
 * form can be linked to directly (`/people/<slug>#person-claim-form`).
 *
 * Deliberately NOT the `<form id>`. `person-claim-owner` is HubSpot's key for
 * the collected form and is an external contract; keeping the anchor on a
 * wrapper means a future layout change can move it without re-keying the form in
 * HubSpot, and vice versa.
 */
export const PERSON_CLAIM_ANCHOR_ID = 'person-claim-form';
