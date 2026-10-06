#!/usr/bin/env bun
/**
 * Mints a short-lived election-api M2M token for a single CI run — no Vercel
 * write, no long-lived credential. Used by
 * .github/workflows/generate-people-sitemaps.yml to authenticate the sitemap
 * generator's election-api calls without touching the static
 * ELECTION_API_M2M_TOKEN that scripts/rotate-election-api-token.ts manages.
 *
 * The minted token is never printed. It is masked via the `::add-mask::`
 * workflow command (GitHub Actions only auto-masks declared `secrets:`
 * values, not one minted at runtime) and then written to `$GITHUB_OUTPUT` so
 * the workflow can pass it to the generator step's env and nowhere else.
 * Outside GitHub Actions (no GITHUB_OUTPUT set), the script mints and
 * validates but refuses to print the raw token — there is nothing else safe
 * to do with it locally short of grabbing it from GITHUB_OUTPUT yourself.
 *
 * Required env:
 *   CLERK_MACHINE_SECRET_KEY  ak_… secret for the gp-marketing (production) machine
 * Optional env:
 *   CLERK_SECRET_KEY          sk_… (not used for minting; only set if convenient)
 *   TOKEN_TTL_SECONDS         token lifetime in seconds (default 3600 = 1 hour)
 */

import { appendFileSync } from 'node:fs';
import { createRedactor, jwtExpMs, mask, mintJwt } from './lib/election-api-token-mint';

const DEFAULT_TTL_SECONDS = 60 * 60;

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing required env var ${name}`);
	}
	return value;
}

const { add: registerSecret, redact } = createRedactor();

async function main(): Promise<void> {
	const ttlSeconds = Number(process.env['TOKEN_TTL_SECONDS'] ?? String(DEFAULT_TTL_SECONDS));
	if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
		throw new Error(`Invalid TOKEN_TTL_SECONDS: ${process.env['TOKEN_TTL_SECONDS']}`);
	}

	const machineSecretKey = requireEnv('CLERK_MACHINE_SECRET_KEY');
	// Register before minting: mintJwt() can throw with the key echoed in the
	// error, and the catch handler redacts against this set.
	registerSecret(machineSecretKey);

	console.log(`Minting a ${ttlSeconds}s election-api JWT for the gp-marketing machine…`);
	const token = await mintJwt(machineSecretKey, ttlSeconds);
	registerSecret(token);

	// Trust Clerk's `exp`, not our own arithmetic — same discipline as the
	// rotation script, scaled down: refuse a token that comes back drastically
	// shorter-lived than requested rather than silently install a near-expired
	// credential the generator step could race against.
	const expMs = jwtExpMs(token);
	const remainingSeconds = (expMs - Date.now()) / 1000;
	console.log(`  minted ${mask(token)}, expires ${new Date(expMs).toISOString()} (~${remainingSeconds.toFixed(0)}s)`);
	if (remainingSeconds < ttlSeconds * 0.9) {
		throw new Error(
			`Minted token expires in ~${remainingSeconds.toFixed(0)}s, well under the requested ${ttlSeconds}s; refusing to hand it to the generator`,
		);
	}

	// GitHub Actions doesn't know this value is a secret until we say so — mask
	// it in the run's log stream before it can appear anywhere, including a
	// later step's own accidental echo.
	console.log(`::add-mask::${token}`);

	const outputFile = process.env['GITHUB_OUTPUT'];
	if (!outputFile) {
		throw new Error('GITHUB_OUTPUT is not set; refusing to print the raw token to stdout outside a GitHub Actions run');
	}
	appendFileSync(outputFile, `token=${token}\n`);
	console.log('Wrote minted token to GITHUB_OUTPUT (token).');
}

main().catch(err => {
	const message = err instanceof Error ? err.message : String(err);
	console.error(`Minting failed: ${redact(message)}`);
	process.exit(1);
});
