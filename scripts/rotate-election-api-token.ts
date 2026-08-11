#!/usr/bin/env bun
/**
 * Rotates the gp-marketing → election-api M2M bearer (ELECTION_API_M2M_TOKEN).
 *
 * Why this exists: gp-marketing authenticates to election-api with a single
 * long-lived Clerk JWT injected as ELECTION_API_M2M_TOKEN, instead of minting a
 * token per request. The Vercel serverless fleet churns faster than any
 * per-isolate token cache, so runtime minting fanned out enough Clerk
 * `createToken` calls to trip the rate limit; a static token removes minting
 * from the hot path entirely (see src/lib/electionApiAuth.ts).
 *
 * The catch: JWT M2M tokens are stateless and therefore cannot be revoked, so we
 * cap the blast radius of a leak with a bounded ~90-day lifetime. That means the
 * token must be replaced before it expires or — once ELECTION_API_AUTH_ENFORCED
 * is on — election-api starts returning 401 to gp-marketing. This script mints a
 * fresh JWT and writes it into every Vercel environment's ELECTION_API_M2M_TOKEN.
 *
 * Zero-downtime: we rotate on a ~60-day cadence while minting ~90-day tokens, so
 * the previous token stays valid for ~30 more days — long enough for routine
 * deployments to bake in the new value (Vercel env changes only apply to new
 * deployments). No forced redeploy is required; one is triggered only if
 * VERCEL_DEPLOY_HOOK_URL is provided.
 *
 * Run by .github/workflows/rotate-election-api-token.yml (scheduled + manual).
 *
 * Required env:
 *   CLERK_MACHINE_SECRET_KEY  ak_… secret for the gp-marketing (production) machine
 *   VERCEL_TOKEN              Vercel API token with write access to the project
 *   VERCEL_PROJECT_ID         prj_… (not secret)
 *   VERCEL_TEAM_ID            team_… (not secret)
 * Optional env:
 *   CLERK_SECRET_KEY          sk_… (not used for minting; only set if convenient)
 *   TOKEN_TTL_DAYS            token lifetime in days (default 90)
 *   ELECTION_API_BASE_URL     base for the post-mint liveness check (default prod)
 *   VERCEL_DEPLOY_HOOK_URL    if set, POSTed after the update to force a redeploy
 *
 * Flags:
 *   --dry-run  Mint + validate the token, but do not write anything to Vercel.
 */

import { createClerkClient } from '@clerk/backend';

const TOKEN_ENV_KEY = 'ELECTION_API_M2M_TOKEN';
const VERCEL_API = 'https://api.vercel.com';

/** Vercel environments that hold the token, and the type each entry must use. */
const TARGET_TYPES: Record<string, 'sensitive' | 'encrypted'> = {
	// Production + Preview are sensitive (write-only); Vercel forbids sensitive on
	// the Development environment, so it is stored encrypted (see set-secrets notes).
	production: 'sensitive',
	preview: 'sensitive',
	development: 'encrypted',
};

interface VercelEnvVar {
	id: string;
	key: string;
	target: string[];
	type: string;
}

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing required env var ${name}`);
	}
	return value;
}

/** Mask a bearer for logs: keep the first/last few chars, hide the middle. */
function mask(token: string): string {
	if (token.length <= 12) return '***';
	return `${token.slice(0, 8)}…${token.slice(-4)} (len ${token.length})`;
}

/** Parse a JWT's `exp` (seconds) without verifying its signature. */
function jwtExpMs(jwt: string): number {
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

async function mintJwt(machineSecretKey: string, ttlDays: number): Promise<string> {
	// createToken authenticates with the machine secret, not the instance secret,
	// so CLERK_SECRET_KEY is optional here; pass a placeholder when it is absent so
	// the client constructs cleanly.
	const clerk = createClerkClient({
		secretKey: process.env['CLERK_SECRET_KEY'] ?? 'sk_unused_for_m2m_mint',
	});

	const minted = await clerk.m2m.createToken({
		machineSecretKey,
		tokenFormat: 'jwt',
		secondsUntilExpiration: ttlDays * 24 * 60 * 60,
	});

	if (!minted.token) {
		throw new Error('Clerk returned an M2M token with no `token` string');
	}
	return minted.token;
}

async function vercelFetch<T>(
	path: string,
	token: string,
	teamId: string,
	init?: RequestInit,
): Promise<T> {
	const separator = path.includes('?') ? '&' : '?';
	const res = await fetch(`${VERCEL_API}${path}${separator}teamId=${teamId}`, {
		...init,
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
			...init?.headers,
		},
	});
	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Vercel ${init?.method ?? 'GET'} ${path} → ${res.status}: ${body}`);
	}
	return (await res.json()) as T;
}

async function listTokenEnvVars(
	projectId: string,
	token: string,
	teamId: string,
): Promise<VercelEnvVar[]> {
	const data = await vercelFetch<{ envs: Array<Omit<VercelEnvVar, 'target'> & { target: string[] | string }> }>(
		`/v9/projects/${projectId}/env`,
		token,
		teamId,
	);
	return data.envs
		.filter(env => env.key === TOKEN_ENV_KEY)
		.map(env => ({
			id: env.id,
			key: env.key,
			type: env.type,
			target: Array.isArray(env.target) ? env.target : [env.target],
		}));
}

async function main(): Promise<void> {
	const dryRun = process.argv.includes('--dry-run');
	const ttlDays = Number(process.env['TOKEN_TTL_DAYS'] ?? '90');
	if (!Number.isFinite(ttlDays) || ttlDays <= 0) {
		throw new Error(`Invalid TOKEN_TTL_DAYS: ${process.env['TOKEN_TTL_DAYS']}`);
	}

	const machineSecretKey = requireEnv('CLERK_MACHINE_SECRET_KEY');

	console.log(`Minting a ${ttlDays}-day election-api JWT for the gp-marketing machine…`);
	const newToken = await mintJwt(machineSecretKey, ttlDays);

	// Trust Clerk's `exp`, not our own arithmetic: reject an unexpectedly
	// short-lived token before it is pushed, so a bad mint can't silently install
	// a credential that expires next week.
	const expMs = jwtExpMs(newToken);
	const remainingDays = (expMs - Date.now()) / (24 * 60 * 60 * 1000);
	console.log(`  minted ${mask(newToken)}, expires ${new Date(expMs).toISOString()} (~${remainingDays.toFixed(1)} days)`);
	if (remainingDays < ttlDays - 2) {
		throw new Error(
			`Minted token expires in ~${remainingDays.toFixed(1)} days, well under the expected ${ttlDays}; refusing to roll out`,
		);
	}

	// Best-effort liveness probe: confirm election-api accepts the token at the
	// network layer. Non-fatal — in observe-only mode election-api answers 2xx/4xx
	// regardless of auth, so this only guards against a malformed base URL or an
	// election-api outage, not against a semantically wrong token.
	const electionApiBase = process.env['ELECTION_API_BASE_URL'] ?? 'https://election-api.goodparty.org';
	try {
		const res = await fetch(`${electionApiBase}/v1/health`, {
			headers: { Authorization: `Bearer ${newToken}` },
		});
		console.log(`  election-api /v1/health with new token → ${res.status}`);
	} catch (err) {
		console.warn(`  liveness probe failed (non-fatal): ${(err as Error).message}`);
	}

	if (dryRun) {
		console.log('--dry-run: token minted and validated; not writing to Vercel.');
		return;
	}

	const vercelToken = requireEnv('VERCEL_TOKEN');
	const projectId = requireEnv('VERCEL_PROJECT_ID');
	const teamId = requireEnv('VERCEL_TEAM_ID');

	const existing = await listTokenEnvVars(projectId, vercelToken, teamId);
	console.log(`Found ${existing.length} existing ${TOKEN_ENV_KEY} entrie(s) in Vercel.`);

	// Update every existing entry that holds this key (one entry may cover several
	// environments), then create entries for any target that isn't covered yet.
	for (const env of existing) {
		await vercelFetch(`/v9/projects/${projectId}/env/${env.id}`, vercelToken, teamId, {
			method: 'PATCH',
			body: JSON.stringify({ value: newToken }),
		});
		console.log(`  updated entry ${env.id} (targets: ${env.target.join(', ')})`);
	}

	const covered = new Set(existing.flatMap(env => env.target));
	for (const [target, type] of Object.entries(TARGET_TYPES)) {
		if (covered.has(target)) continue;
		await vercelFetch(`/v10/projects/${projectId}/env`, vercelToken, teamId, {
			method: 'POST',
			body: JSON.stringify({ key: TOKEN_ENV_KEY, value: newToken, type, target: [target] }),
		});
		console.log(`  created ${type} entry for missing target: ${target}`);
	}

	const deployHook = process.env['VERCEL_DEPLOY_HOOK_URL'];
	if (deployHook) {
		const res = await fetch(deployHook, { method: 'POST' });
		console.log(`Triggered deploy hook → ${res.status}`);
	} else {
		console.log(
			'No VERCEL_DEPLOY_HOOK_URL set — the new token takes effect on the next deployment ' +
				'(the previous token stays valid until then, so there is no gap).',
		);
	}

	console.log('Rotation complete.');
}

main().catch(err => {
	console.error(`Rotation failed: ${(err as Error).message}`);
	process.exit(1);
});
