import { createClerkClient } from '@clerk/backend';

/**
 * Server-only Clerk M2M token minter for calling election-api.
 *
 * gp-marketing is a caller: it mints tokens with its own machine secret
 * (GP_MARKETING_MACHINE_SECRET); election-api verifies as the recipient. The
 * gp-marketing machine must be connected to the election-api machine in the
 * Clerk dashboard.
 *
 * NEVER import this from client components — GP_MARKETING_MACHINE_SECRET and
 * CLERK_SECRET_KEY are server-only. All election-api reads already run
 * server-side (Server Components, route handlers, sitemap/build scripts).
 *
 * If the machine secret is unset, minting is skipped and requests go out
 * unauthenticated. That is intentional: it keeps gp-marketing working while
 * election-api is still in observe-only mode. Once ELECTION_API_AUTH_ENFORCED
 * is on, the secret must be present or election-api will return 401.
 */

const TOKEN_RENEWAL_BUFFER_MS = 30_000;
const TOKEN_TTL_SECONDS = 600;

const machineSecret = process.env['GP_MARKETING_MACHINE_SECRET'];

const clerkClient = createClerkClient({
	secretKey: process.env['CLERK_SECRET_KEY'],
	publishableKey: process.env['CLERK_PUBLISHABLE_KEY'],
});

let cachedToken: string | null = null;
let tokenExpiration: number | null = null;
let pending: Promise<string | null> | null = null;
let warnedMissingSecret = false;

function isTokenValid(): boolean {
	if (!tokenExpiration) return false;
	return Date.now() < tokenExpiration - TOKEN_RENEWAL_BUFFER_MS;
}

async function mint(): Promise<string | null> {
	if (!machineSecret) {
		if (!warnedMissingSecret) {
			warnedMissingSecret = true;
			console.error(
				'[electionApiAuth] GP_MARKETING_MACHINE_SECRET is not set; election-api requests will be unauthenticated',
			);
		}
		return null;
	}
	try {
		const minted = await clerkClient.m2m.createToken({
			machineSecretKey: machineSecret,
			secondsUntilExpiration: TOKEN_TTL_SECONDS,
		});
		if (!minted.token) return null;
		cachedToken = minted.token;
		tokenExpiration = minted.expiration;
		return minted.token;
	} catch (err) {
		console.error(
			'[electionApiAuth] failed to mint M2M token',
			err instanceof Error ? err.message : String(err),
		);
		return null;
	}
}

/** Returns a cached M2M token, minting/renewing as needed. Null if unavailable. */
export async function getElectionApiToken(): Promise<string | null> {
	if (cachedToken && isTokenValid()) return cachedToken;
	if (pending) return pending;
	const promise = mint();
	pending = promise;
	try {
		return await promise;
	} finally {
		if (pending === promise) pending = null;
	}
}

/** Authorization header for an election-api request (empty if no token). */
export async function electionApiAuthHeaders(): Promise<Record<string, string>> {
	const token = await getElectionApiToken();
	return token ? { Authorization: `Bearer ${token}` } : {};
}
