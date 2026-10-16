/**
 * The wire contract for `/api/people/claim-request`, and the proxy route that
 * forwards it to gp-api. No form on the site posts to it today: the owner form
 * became a sign-up link (2026-08-17) and the visitor notify prompt was removed
 * (2026-10-16) because its requests piled up as HubSpot contacts nobody acted on.
 *
 * The two sources POSTed the same endpoint but mean opposite things:
 *
 * - `notify` — a VISITOR asking us to nudge someone else to complete their
 *   profile (the removed "ask [Name] to complete their profile" prompt).
 * - `owner` — the person THEMSELVES claiming their page (PersonClaimCTABand).
 *
 * gp-api counts only `notify` submissions into that person's HubSpot
 * `candidate_profile_requests`, so conflating the two would credit someone's own
 * claim as demand from other people. Nothing errors if the field is wrong — the
 * number just goes quietly wrong — which is why the payload is built here, in
 * one tested place, rather than inline at each call site.
 *
 * These strings are the values gp-api's `ProfileClaimRequestSource` enum
 * accepts. Do not reword them.
 */
export const CLAIM_REQUEST_SOURCES = ['notify', 'owner'] as const;

export type ClaimRequestSource = (typeof CLAIM_REQUEST_SOURCES)[number];

export function isClaimRequestSource(value: unknown): value is ClaimRequestSource {
	return CLAIM_REQUEST_SOURCES.includes(value as ClaimRequestSource);
}

export type ClaimRequestInput = {
	personId: string;
	email: string;
	firstname?: string;
	/**
	 * Omitted entirely by the owner band, which carries no opt-in checkbox — the
	 * proxy records the absence as `false`. Sending `false` from here instead
	 * would be indistinguishable from a visitor who unticked the box.
	 */
	marketingConsent?: boolean;
	source: ClaimRequestSource;
};

export function buildClaimRequestBody(input: ClaimRequestInput): string {
	const { personId, email, firstname, marketingConsent, source } = input;
	return JSON.stringify({
		personId,
		firstname,
		email,
		...(marketingConsent === undefined ? {} : { marketingConsent }),
		source,
	});
}
