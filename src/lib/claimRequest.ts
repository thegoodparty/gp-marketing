/**
 * The wire contract for `/api/people/claim-request`, shared by the two public
 * claim forms and the proxy route that forwards them to gp-api.
 *
 * Both forms POST the same endpoint but mean opposite things:
 *
 * - `notify` — a VISITOR asking us to nudge someone else to complete their
 *   profile (the "Not [Name]?" form in ClaimProfileModal).
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
