/**
 * Server-only Authorization header for gp-api reads: the election routes under
 * `/v1/elections`, the person-profile reads (`/v1/public-person-profiles`,
 * `/unlisted`, `/published`, `/voter-density`) and `/v1/public-campaigns`.
 *
 * GP_API_SERVICE_TOKEN, when set, is sent as-is and wins over everything below.
 * The generate-people-sitemaps workflow sets it to the GitHub Actions OIDC token
 * it fetches (audience `gp-api`) right before the generate step; gp-api verifies
 * it against GitHub's issuer and allowlists that workflow. It is never set in a
 * Vercel deployment, so Vercel keeps the behavior below.
 *
 * Otherwise, two credentials, picked by the non-secret GP_API_AUTH_MODE env var:
 *
 *  - `clerk` (the default, and any unset or unknown value): the static Clerk
 *    JWT in ELECTION_API_M2M_TOKEN, described below.
 *  - `oidc-preferred`: this deployment's Vercel OIDC token (`getVercelOidcToken`
 *    from `@vercel/oidc`, default audience). Vercel signs a fresh one for every
 *    deployment, so there is no secret to store and nothing to rotate. In a
 *    function it comes from the request's `x-vercel-oidc-token` header; at build
 *    time from VERCEL_OIDC_TOKEN. When no token can be had (a CLI script, a
 *    GitHub Action, an expired build token) we fall back to the Clerk token.
 *
 * The default stays `clerk` because a gp-api that does not yet accept OIDC
 * treats the token as anonymous and 401s the gated reads. The order is: gp-api
 * accepts OIDC in prod, then GP_API_AUTH_MODE=oidc-preferred is set in Vercel.
 * The OIDC token changes on every request, so no fetch may carry it into a Next
 * fetch cache key: every authenticated read goes through the URL-keyed
 * unstable_cache wrappers in electionApiFetch.ts.
 *
 * gp-api accepts any valid Clerk M2M JWT as a read-only credential for those
 * routes, so the same ELECTION_API_M2M_TOKEN is sent there too. The env var
 * keeps its name because the rotation tooling writes it.
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
 * If neither credential is available, requests go out unauthenticated. That is
 * intentional while election-api is in observe-only mode; once
 * ELECTION_API_AUTH_ENFORCED=true, the token must be present or election-api
 * returns 401. gp-api's gated reads 401 without it too. The profile render gate
 * treats that as a takedown (noindex), never as an unclaimed page; voter-density
 * and public-campaigns treat it as no data.
 * Rotate the Clerk token before its ~90-day expiry (runbook) until
 * GP_API_AUTH_MODE=oidc-preferred is live in every environment.
 */

import { getVercelOidcToken } from '@vercel/oidc';

// Latched so a misconfigured deploy logs once per process, not once per request.
let warnedMissingToken = false;
let warnedOidcUnavailable = false;
let warnedUnknownAuthMode = false;

export type GpApiAuthMode = 'clerk' | 'oidc-preferred';

/** GP_API_AUTH_MODE, read per call. Anything but `oidc-preferred` is `clerk`. */
export const getGpApiAuthMode = (): GpApiAuthMode => {
	const mode = process.env['GP_API_AUTH_MODE'];
	if (mode === 'oidc-preferred') return 'oidc-preferred';
	if (mode && mode !== 'clerk' && !warnedUnknownAuthMode) {
		warnedUnknownAuthMode = true;
		console.error(`[electionApiAuth] Unknown GP_API_AUTH_MODE "${mode}"; using the clerk token`);
	}
	return 'clerk';
};

/** The static election-api M2M bearer, or null if unconfigured (warns once). */
export function getElectionApiToken(): string | null {
	const token = process.env['ELECTION_API_M2M_TOKEN'];
	if (!token) {
		if (!warnedMissingToken) {
			warnedMissingToken = true;
			console.error(
				'[electionApiAuth] ELECTION_API_M2M_TOKEN is not set; election-api and gp-api person-profile requests will be unauthenticated',
			);
		}
		return null;
	}
	return token;
}

/**
 * Authorization header for a gp-api read (empty if no credential). Never
 * throws: a failure to get the OIDC token falls back to the Clerk token.
 * Not cached: the OIDC token is short-lived and @vercel/oidc refreshes it.
 */
export async function gpApiAuthHeaders(): Promise<Record<string, string>> {
	const serviceToken = process.env['GP_API_SERVICE_TOKEN'];
	if (serviceToken) return { Authorization: `Bearer ${serviceToken}` };
	if (getGpApiAuthMode() === 'oidc-preferred') {
		try {
			const oidcToken = await getVercelOidcToken();
			if (oidcToken) return { Authorization: `Bearer ${oidcToken}` };
		} catch (err) {
			if (!warnedOidcUnavailable) {
				warnedOidcUnavailable = true;
				console.error('[electionApiAuth] No Vercel OIDC token available; falling back to ELECTION_API_M2M_TOKEN', err);
			}
		}
	}
	const token = getElectionApiToken();
	return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Authorization header for a gp-api `/v1/elections` read; same credential as gpApiAuthHeaders. */
export async function electionApiAuthHeaders(): Promise<Record<string, string>> {
	return gpApiAuthHeaders();
}

/** Test-only: reset the warn-once latches (optionally pre-latched to stay quiet). */
export function __resetElectionApiAuthForTests(seed?: { warnedMissingToken?: boolean }): void {
	warnedMissingToken = seed?.warnedMissingToken ?? false;
	warnedOidcUnavailable = false;
	warnedUnknownAuthMode = false;
}
