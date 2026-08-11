/**
 * Server-only Authorization header for election-api requests.
 *
 * gp-marketing runs on a large, churning fleet of short-lived Vercel isolates.
 * Minting a Clerk JWT M2M token per isolate — even pooled through the Next Data
 * Cache — still fanned out enough `createToken` calls to trip Clerk's
 * token-creation limit, at which point the fail-soft path dropped the
 * Authorization header and election-api logged "Missing bearer token". JWT M2M
 * tokens are stateless, so Clerk cannot deduplicate them for us; the only way to
 * stop the fan-out is to stop minting at request time.
 *
 * So we no longer mint at runtime. A single long-lived JWT — minted out-of-band
 * for the gp-marketing machine, scoped to election-api (see the rotation
 * runbook) — is injected as ELECTION_API_M2M_TOKEN. Every isolate reads that one
 * static token: no minting, no shared cache, no stampede. election-api verifies
 * the JWT networkless, exactly as before.
 *
 * Server-only: never import this from a Client Component. The value is a bearer
 * credential and must stay out of the client bundle. (We deliberately do NOT
 * `import 'server-only'` so the offline CLI scripts that import this module under
 * bun/tsx — scripts/validate-election-pages.ts, and scripts/generate-sitemaps.ts
 * via sitemap-entries.ts — keep working; the `server-only` default export throws
 * outside a bundler.)
 *
 * If ELECTION_API_M2M_TOKEN is unset, requests go out unauthenticated. That is
 * intentional while election-api is in observe-only mode; once
 * ELECTION_API_AUTH_ENFORCED=true, the token must be present or election-api
 * returns 401. Rotate before the token's ~90-day expiry (runbook).
 */

// Latched so a misconfigured deploy logs once per process, not once per request.
let warnedMissingToken = false;

/** The static election-api M2M bearer, or null if unconfigured (warns once). */
export function getElectionApiToken(): string | null {
	const token = process.env['ELECTION_API_M2M_TOKEN'];
	if (!token) {
		if (!warnedMissingToken) {
			warnedMissingToken = true;
			console.error(
				'[electionApiAuth] ELECTION_API_M2M_TOKEN is not set; election-api requests will be unauthenticated',
			);
		}
		return null;
	}
	return token;
}

/** Authorization header for an election-api request (empty if no token). */
export function electionApiAuthHeaders(): Record<string, string> {
	const token = getElectionApiToken();
	return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Test-only: reset the warn-once latch (optionally pre-latched to stay quiet). */
export function __resetElectionApiAuthForTests(seed?: { warnedMissingToken?: boolean }): void {
	warnedMissingToken = seed?.warnedMissingToken ?? false;
}
