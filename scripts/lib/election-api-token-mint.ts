/**
 * Shared Clerk M2M minting logic for gp-marketing's election-api tooling.
 *
 * Used by two callers with different lifetimes and destinations:
 *   - scripts/rotate-election-api-token.ts mints a ~90-day token and writes it
 *     to Vercel env vars (the static runtime credential every isolate reads).
 *   - scripts/mint-election-api-token.ts mints a short-lived, per-CI-run token
 *     that never leaves the workflow run (GITHUB_OUTPUT only).
 *
 * Kept separate from both callers' Vercel/GitHub-specific glue so the minting
 * contract (and its redaction discipline) has one place to fix.
 */

import { createClerkClient } from '@clerk/backend';

/** Mask a bearer for logs: keep the first/last few chars, hide the middle. */
export function mask(token: string): string {
	if (token.length <= 12) return '***';
	return `${token.slice(0, 8)}…${token.slice(-4)} (len ${token.length})`;
}

/**
 * A small registry of values to scrub from any text before it's logged.
 * GitHub Actions only masks values declared as `secrets:`; a token minted at
 * runtime is unknown to the masking engine, and a Clerk validation error can
 * echo the submitted value back inside a thrown message. Register such values
 * and redact() before logging. Returns a fresh registry per call so concurrent
 * or repeated mints (e.g. in tests) never share state.
 */
export function createRedactor(): { add(secret: string): void; redact(text: string): string } {
	const secrets = new Set<string>();
	return {
		add(secret: string): void {
			if (secret) secrets.add(secret);
		},
		redact(text: string): string {
			let out = text;
			for (const secret of secrets) {
				if (secret) out = out.split(secret).join('***');
			}
			return out;
		},
	};
}

/** Parse a JWT's `exp` (seconds) without verifying its signature. */
export function jwtExpMs(jwt: string): number {
	const segments = jwt.split('.');
	const payloadSegment = segments[1];
	if (segments.length !== 3 || !payloadSegment) {
		throw new Error(`Minted value is not a JWT (${segments.length} segments, expected 3)`);
	}
	const payload = JSON.parse(Buffer.from(payloadSegment, 'base64url').toString('utf8')) as {
		exp?: number;
	};
	if (typeof payload.exp !== 'number') {
		throw new Error('Minted JWT has no numeric `exp` claim');
	}
	return payload.exp * 1000;
}

/**
 * Mints a Clerk M2M JWT for the gp-marketing machine, scoped to election-api.
 * Authenticates with the machine secret, not the instance secret, so
 * CLERK_SECRET_KEY is optional; the placeholder lets the client construct
 * cleanly when it's absent.
 */
export async function mintJwt(machineSecretKey: string, ttlSeconds: number): Promise<string> {
	// Use `||`, not `??`: GitHub Actions injects an unset optional secret as an
	// empty string, which `??` would pass through instead of falling back.
	const clerk = createClerkClient({
		secretKey: process.env['CLERK_SECRET_KEY'] || 'sk_unused_for_m2m_mint',
	});

	const minted = await clerk.m2m.createToken({
		machineSecretKey,
		tokenFormat: 'jwt',
		secondsUntilExpiration: ttlSeconds,
	});

	if (!minted.token) {
		throw new Error('Clerk returned an M2M token with no `token` string');
	}
	return minted.token;
}
