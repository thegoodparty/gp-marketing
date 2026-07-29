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
const MINT_COOLDOWN_MS = 30_000;
const TOKEN_TTL_SECONDS = 600;

export type CreateM2MToken = (params: {
	machineSecretKey: string;
	secondsUntilExpiration: number;
}) => Promise<{ token?: string | null; expiration?: number | null }>;

type ClerkM2MClient = {
	m2m: {
		createToken(params: {
			machineSecretKey: string;
			secondsUntilExpiration: number;
		}): Promise<{ token?: string | null; expiration?: number | null }>;
	};
};

let clerkClient: ClerkM2MClient | null = null;
let createTokenForTests: CreateM2MToken | null = null;

function getClerkClient(): ClerkM2MClient {
	if (!clerkClient) {
		clerkClient = createClerkClient({
			secretKey: process.env['CLERK_SECRET_KEY'],
			publishableKey: process.env['CLERK_PUBLISHABLE_KEY'],
		}) as ClerkM2MClient;
	}
	return clerkClient;
}

async function createToken(params: {
	machineSecretKey: string;
	secondsUntilExpiration: number;
}): Promise<{ token?: string | null; expiration?: number | null }> {
	if (createTokenForTests) return createTokenForTests(params);
	return getClerkClient().m2m.createToken(params);
}

let cachedToken: string | null = null;
let tokenExpiration: number | null = null;
let pending: Promise<string | null> | null = null;
let warnedMissingSecret = false;
let mintCooldownUntil = 0;

/** True when a cached token exists and has not yet reached its real expiry. */
function isTokenUsable(): boolean {
	return cachedToken != null && tokenExpiration != null && Date.now() < tokenExpiration;
}

/** True when there is no usable cached token, or it is within the renewal buffer. */
function needsRenewal(): boolean {
	if (!cachedToken || tokenExpiration == null) return true;
	return Date.now() >= tokenExpiration - TOKEN_RENEWAL_BUFFER_MS;
}

function usableCachedToken(): string | null {
	return isTokenUsable() ? cachedToken : null;
}

function enterMintCooldown(): void {
	mintCooldownUntil = Date.now() + MINT_COOLDOWN_MS;
}

async function mint(): Promise<string | null> {
	const machineSecret = process.env['GP_MARKETING_MACHINE_SECRET'];
	if (!machineSecret) {
		if (!warnedMissingSecret) {
			warnedMissingSecret = true;
			console.error(
				'[electionApiAuth] GP_MARKETING_MACHINE_SECRET is not set; election-api requests will be unauthenticated',
			);
		}
		return usableCachedToken();
	}
	try {
		const minted = await createToken({
			machineSecretKey: machineSecret,
			secondsUntilExpiration: TOKEN_TTL_SECONDS,
		});
		if (!minted.token || minted.expiration == null) {
			enterMintCooldown();
			return usableCachedToken();
		}
		cachedToken = minted.token;
		tokenExpiration = minted.expiration;
		mintCooldownUntil = 0;
		return minted.token;
	} catch (err) {
		console.error(
			'[electionApiAuth] failed to mint M2M token',
			err instanceof Error ? err.message : String(err),
		);
		enterMintCooldown();
		return usableCachedToken();
	}
}

/** Returns a cached M2M token, minting/renewing as needed. Null if unavailable. */
export async function getElectionApiToken(): Promise<string | null> {
	if (!needsRenewal()) return cachedToken;
	if (Date.now() < mintCooldownUntil) return usableCachedToken();
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

/** Test-only: inject a createToken implementation (null restores Clerk). */
export function __setCreateTokenForTests(fn: CreateM2MToken | null): void {
	createTokenForTests = fn;
}

/** Test-only: reset module cache / cooldown state (and optionally seed a token). */
export function __resetElectionApiAuthForTests(seed?: {
	cachedToken?: string | null;
	tokenExpiration?: number | null;
	mintCooldownUntil?: number;
	warnedMissingSecret?: boolean;
}): void {
	cachedToken = seed?.cachedToken ?? null;
	tokenExpiration = seed?.tokenExpiration ?? null;
	mintCooldownUntil = seed?.mintCooldownUntil ?? 0;
	warnedMissingSecret = seed?.warnedMissingSecret ?? false;
	pending = null;
	clerkClient = null;
	createTokenForTests = null;
}
