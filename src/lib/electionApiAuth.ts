import { createClerkClient } from '@clerk/backend';

/**
 * Server-only Clerk JWT-format M2M token minter for calling election-api.
 *
 * gp-marketing is a caller: it mints tokens with its own machine secret
 * (GP_MARKETING_MACHINE_SECRET); election-api verifies as the recipient
 * (networkless, since the token is a JWT). The gp-marketing machine must be
 * connected to the election-api machine in the Clerk dashboard.
 *
 * NEVER import this from client components — GP_MARKETING_MACHINE_SECRET and
 * CLERK_SECRET_KEY are server-only. All election-api reads already run
 * server-side (Server Components, route handlers, sitemap/build scripts).
 *
 * Deliberately does NOT `import 'server-only'`: this module is also imported by
 * offline CLI scripts (`scripts/validate-election-pages.ts`, and
 * `scripts/generate-sitemaps.ts` via `sitemap-entries.ts`). Under bun/tsx the
 * `server-only` package's default export throws, so the sentinel would break
 * those tools. Client-bundle safety still holds because no Client Component
 * imports this file (and `@clerk/backend` is Node-only).
 *
 * If the machine secret is unset, minting is skipped and requests go out
 * unauthenticated. That is intentional: it keeps gp-marketing working while
 * election-api is still in observe-only mode. Once ELECTION_API_AUTH_ENFORCED
 * is on, the secret must be present or election-api will return 401.
 *
 * Token pooling across serverless isolates
 * ----------------------------------------
 * JWT-format M2M tokens are stateless: Clerk does NOT deduplicate them
 * server-side (`minRemainingTtlSeconds` only pools opaque tokens), so every
 * `createToken` call mints — and bills for — a brand-new token. On Vercel we
 * run a large, churning fleet of short-lived isolates; if each mints on its own
 * (× a short TTL) we generate thousands of creations, blow past Clerk's quota,
 * and start getting throttled — at which point the fail-soft below drops the
 * Authorization header and election-api logs "Missing bearer token".
 *
 * We therefore pool at two layers:
 *   L1 — per-isolate in-memory cache (this module's `cachedToken`). Free, but
 *        only shared within a single warm isolate.
 *   L2 — cross-isolate cache via the Next Data Cache (`unstable_cache`), which
 *        is shared across all isolates/regions on Vercel. One minted JWT is
 *        reused fleet-wide until it nears expiry, collapsing thousands of mints
 *        into roughly one per revalidate window. This is Clerk's recommended
 *        "pool tokens at the server" pattern, implemented on our side because
 *        JWTs can't be pooled by Clerk.
 */

// Renew slightly before expiry so an in-flight request never uses a token that
// expires mid-call.
const TOKEN_RENEWAL_BUFFER_MS = 60_000;
// Long TTL keeps mint volume (and cost) low; the shared cache below reuses each
// minted token fleet-wide for almost its whole lifetime.
const TOKEN_TTL_SECONDS = 3600;
// Cross-isolate cache window. Must stay comfortably inside the JWT's real
// lifetime so a token read at the edge of the window still has margin over the
// renewal buffer (3600s life − 300s = 3300s window ⇒ ≥300s remaining).
const SHARED_TOKEN_REVALIDATE_SECONDS = TOKEN_TTL_SECONDS - 300;
// Backoff bounds for mint failures (throttling/outage). Exponential with jitter
// so a fleet-wide Clerk hiccup doesn't turn into a synchronized retry storm.
const MINT_COOLDOWN_BASE_MS = 30_000;
const MINT_COOLDOWN_MAX_MS = 300_000;

export type CreateM2MToken = (params: {
	machineSecretKey: string;
	secondsUntilExpiration: number;
	tokenFormat?: 'jwt';
}) => Promise<{ token?: string | null; expiration?: number | null }>;

type ClerkM2MClient = {
	m2m: {
		createToken(params: {
			machineSecretKey: string;
			secondsUntilExpiration: number;
			tokenFormat?: 'jwt';
		}): Promise<{ token?: string | null; expiration?: number | null }>;
	};
};

/** A minted token plus the absolute ms timestamp at which it truly expires. */
type MintedToken = { token: string; expiration: number };

/** Thrown when the machine secret is absent — a config state, not a failure. */
class MissingMachineSecretError extends Error {}

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
	tokenFormat?: 'jwt';
}): Promise<{ token?: string | null; expiration?: number | null }> {
	if (createTokenForTests) return createTokenForTests(params);
	return getClerkClient().m2m.createToken(params);
}

let cachedToken: string | null = null;
let tokenExpiration: number | null = null;
let pending: Promise<string | null> | null = null;
let warnedMissingSecret = false;
let mintCooldownUntil = 0;
let mintFailureStreak = 0;

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

/**
 * Exponential backoff (capped) with jitter to avoid synchronized retry storms.
 * The jitter only ever shortens the wait, and by at most a quarter, so each
 * escalated window stays strictly longer than the previous one's maximum.
 */
function enterMintCooldown(): void {
	mintFailureStreak += 1;
	const exponential = MINT_COOLDOWN_BASE_MS * 2 ** (mintFailureStreak - 1);
	const capped = Math.min(exponential, MINT_COOLDOWN_MAX_MS);
	const jitter = Math.floor(Math.random() * (capped / 4));
	mintCooldownUntil = Date.now() + capped - jitter;
}

/**
 * One real Clerk mint. Throws on any failure so the shared cache never memoizes
 * a bad result and the caller can fall back to the last-good token.
 */
async function mintFromClerk(): Promise<MintedToken> {
	const machineSecret = process.env['GP_MARKETING_MACHINE_SECRET'];
	if (!machineSecret) throw new MissingMachineSecretError();

	const minted = await createToken({
		machineSecretKey: machineSecret,
		tokenFormat: 'jwt',
		secondsUntilExpiration: TOKEN_TTL_SECONDS,
	});
	// A successful mint is signalled by a non-null token. Do NOT gate on
	// `minted.expiration`: it is not read (the window is derived from the TTL),
	// and Clerk types it as nullable, so treating null as failure would discard
	// an otherwise-valid token and 401 downstream.
	if (!minted.token) throw new Error('Clerk M2M token creation returned no token');

	// Anchor the cache window to the TTL we requested, NOT to `minted.expiration`.
	// The JWT's real `exp` claim is (mint time + secondsUntilExpiration). Clerk's
	// returned `expiration` field is typed as seconds but is milliseconds at
	// runtime, so `* 1000` double-scaled it ~56k years out — the cache then never
	// renewed and replayed one token long past its real `exp`. Deriving from TTL
	// is unit-agnostic and keeps the window strictly inside the JWT's lifetime.
	return { token: minted.token, expiration: Date.now() + TOKEN_TTL_SECONDS * 1000 };
}

/**
 * Mint through the cross-isolate (L2) cache when running inside the Next server
 * runtime; otherwise (CLI scripts, unit tests) mint directly. `unstable_cache`
 * is only valid inside the Next runtime — invoking it elsewhere hangs — so we
 * gate on NEXT_RUNTIME exactly as election-api's fetch cache does.
 */
async function mintPooled(): Promise<MintedToken> {
	// Outside the Next runtime, or with no secret to mint from, skip the Data
	// Cache entirely: there is nothing to pool and mintFromClerk resolves the
	// direct/error path (throwing MissingMachineSecretError) without a cache hop.
	if (!process.env['NEXT_RUNTIME'] || !process.env['GP_MARKETING_MACHINE_SECRET']) {
		return mintFromClerk();
	}

	const { unstable_cache } = await import('next/cache');
	return unstable_cache(mintFromClerk, ['election-api-m2m-token'], {
		revalidate: SHARED_TOKEN_REVALIDATE_SECONDS,
	})();
}

async function renew(): Promise<string | null> {
	try {
		const { token, expiration } = await mintPooled();
		cachedToken = token;
		tokenExpiration = expiration;
		mintCooldownUntil = 0;
		mintFailureStreak = 0;
		return token;
	} catch (err) {
		if (err instanceof MissingMachineSecretError) {
			if (!warnedMissingSecret) {
				warnedMissingSecret = true;
				console.error(
					'[electionApiAuth] GP_MARKETING_MACHINE_SECRET is not set; election-api requests will be unauthenticated',
				);
			}
			// Config state, not a transient failure: no cooldown/backoff.
			return usableCachedToken();
		}
		// Transient (throttle/outage): back off, but keep serving the last-good
		// token until its real expiry so a Clerk hiccup never drops auth while a
		// valid token is still in hand.
		enterMintCooldown();
		console.error(
			'[electionApiAuth] failed to mint M2M token',
			err instanceof Error ? err.message : String(err),
		);
		return usableCachedToken();
	}
}

/** Returns a cached M2M token, minting/renewing as needed. Null if unavailable. */
export async function getElectionApiToken(): Promise<string | null> {
	if (!needsRenewal()) return cachedToken;
	if (Date.now() < mintCooldownUntil) return usableCachedToken();
	if (pending) return pending;
	const promise = renew();
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
	mintFailureStreak = 0;
	pending = null;
	clerkClient = null;
	createTokenForTests = null;
}
