/**
 * Server-only Authorization header for gp-api reads: the election routes under
 * `/v1/elections`, the person-profile reads (`/v1/public-person-profiles`,
 * `/unlisted`, `/published`, `/voter-density`) and `/v1/public-campaigns`.
 *
 * GP_API_SERVICE_TOKEN, when set, is sent as-is. The generate-people-sitemaps
 * workflow sets it to the GitHub Actions OIDC token it fetches (audience
 * `gp-api`) right before the generate step; gp-api verifies it against GitHub's
 * issuer and allowlists that workflow. It is never set in a Vercel deployment.
 *
 * Otherwise we send this deployment's Vercel OIDC token (`getVercelOidcToken`
 * from `@vercel/oidc`, default audience). Vercel signs a fresh one for every
 * deployment, so there is no secret to store and nothing to rotate. In a
 * function it comes from the request's `x-vercel-oidc-token` header; at build
 * time and locally (after `vercel env pull`) from VERCEL_OIDC_TOKEN. The OIDC
 * token changes on every request, so no fetch may carry it into a Next fetch
 * cache key: every authenticated read goes through the URL-keyed
 * unstable_cache wrappers in electionApiFetch.ts.
 *
 * Server-only: never import this from a Client Component. The value is a bearer
 * credential and must stay out of the client bundle. (We deliberately do NOT
 * `import 'server-only'` so the offline CLI scripts that import this module under
 * bun/tsx — scripts/validate-election-pages.ts, and scripts/generate-sitemaps.ts
 * via sitemap-entries.ts — keep working; the `server-only` default export throws
 * outside a bundler.)
 *
 * If neither credential is available, requests go out unauthenticated and
 * gp-api 401s the gated reads. The profile render gate treats that as a
 * takedown (noindex), never as an unclaimed page; voter-density and
 * public-campaigns treat it as no data.
 */

import { getVercelOidcToken } from '@vercel/oidc';

// Latched so a misconfigured deploy logs once per process, not once per request.
let warnedNoToken = false;

/**
 * Authorization header for a gp-api read (empty if no credential). Never
 * throws. Not cached: the OIDC token is short-lived and @vercel/oidc
 * refreshes it.
 */
export async function gpApiAuthHeaders(): Promise<Record<string, string>> {
	const serviceToken = process.env['GP_API_SERVICE_TOKEN'];
	if (serviceToken) return { Authorization: `Bearer ${serviceToken}` };
	let oidcError: unknown;
	try {
		const oidcToken = await getVercelOidcToken();
		if (oidcToken) return { Authorization: `Bearer ${oidcToken}` };
	} catch (err) {
		oidcError = err;
	}
	if (!warnedNoToken) {
		warnedNoToken = true;
		console.error(
			'[electionApiAuth] No GP_API_SERVICE_TOKEN or Vercel OIDC token available; gp-api reads will be unauthenticated',
			oidcError,
		);
	}
	return {};
}

/** Test-only: reset the warn-once latch (optionally pre-latched to stay quiet). */
export function __resetElectionApiAuthForTests(seed?: { warnedNoToken?: boolean }): void {
	warnedNoToken = seed?.warnedNoToken ?? false;
}
