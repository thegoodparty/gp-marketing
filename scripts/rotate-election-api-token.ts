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

/**
 * Credentials to scrub from anything we print. GitHub Actions only masks values
 * declared as `secrets:`; a token minted at runtime is unknown to the masking
 * engine, and a Vercel validation error can echo the submitted value back inside
 * a thrown message. Register such values here and redact() before logging.
 */
const secretsToRedact = new Set<string>();
function redact(text: string): string {
	let out = text;
	for (const secret of secretsToRedact) {
		if (secret) out = out.split(secret).join('***');
	}
	return out;
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
	// the client constructs cleanly. Use `||`, not `??`: GitHub Actions injects an
	// unset optional secret as an empty string, which `??` would pass through.
	const clerk = createClerkClient({
		secretKey: process.env['CLERK_SECRET_KEY'] || 'sk_unused_for_m2m_mint',
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

async function vercelFetch<T>(path: string, token: string, teamId: string, init?: RequestInit): Promise<T> {
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

async function listTokenEnvVars(projectId: string, token: string, teamId: string): Promise<VercelEnvVar[]> {
	// The project env list is returned in a single page today, but page through
	// defensively: a project with more variables than the endpoint's page size
	// would otherwise silently drop an ELECTION_API_M2M_TOKEN entry, leaving it on
	// the stale token while the rest rotate. `pagination.next` is a timestamp
	// cursor consumed via `until`.
	const matches: VercelEnvVar[] = [];
	let until: string | undefined;
	for (;;) {
		const query = new URLSearchParams({ limit: '100' });
		if (until) query.set('until', until);
		const data = await vercelFetch<{
			envs: Array<Omit<VercelEnvVar, 'target'> & { target: string[] | string }>;
			pagination?: { next: number | null };
		}>(`/v9/projects/${projectId}/env?${query.toString()}`, token, teamId);
		for (const env of data.envs) {
			if (env.key !== TOKEN_ENV_KEY) continue;
			matches.push({
				id: env.id,
				key: env.key,
				type: env.type,
				target: Array.isArray(env.target) ? env.target : [env.target],
			});
		}
		const next = data.pagination?.next;
		if (!next) break;
		until = String(next);
	}
	return matches;
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
	// The machine secret is a declared GitHub secret (already masked), but the
	// freshly minted token is not — keep it out of any error we might print.
	secretsToRedact.add(newToken);
	secretsToRedact.add(machineSecretKey);

	// Trust Clerk's `exp`, not our own arithmetic: reject an unexpectedly
	// short-lived token before it is pushed, so a bad mint can't silently install
	// a credential that expires next week.
	const expMs = jwtExpMs(newToken);
	const remainingDays = (expMs - Date.now()) / (24 * 60 * 60 * 1000);
	console.log(`  minted ${mask(newToken)}, expires ${new Date(expMs).toISOString()} (~${remainingDays.toFixed(1)} days)`);
	if (remainingDays < ttlDays - 2) {
		throw new Error(`Minted token expires in ~${remainingDays.toFixed(1)} days, well under the expected ${ttlDays}; refusing to roll out`);
	}

	// Auth probe against a *guarded* endpoint (not the public /v1/health) so the
	// token is actually authenticated. A 401/403 is an unambiguous bad-token
	// signal in any mode and MUST abort before we roll the token out — that is
	// exactly how a broken token surfaces once ELECTION_API_AUTH_ENFORCED is on.
	// In observe-only mode election-api still answers 2xx, so this can't fully
	// validate today; genuine transport/5xx blips stay non-fatal.
	const electionApiBase = process.env['ELECTION_API_BASE_URL'] ?? 'https://election-api.goodparty.org';
	let probeRes: Response | undefined;
	try {
		probeRes = await fetch(`${electionApiBase}/v1/candidacies?slug=__token-rotation-probe__`, {
			headers: { Authorization: `Bearer ${newToken}` },
		});
	} catch (err) {
		console.warn(`  auth probe inconclusive — transport error (non-fatal): ${redact((err as Error).message)}`);
	}
	if (probeRes && (probeRes.status === 401 || probeRes.status === 403)) {
		throw new Error(`election-api rejected the freshly minted token (HTTP ${probeRes.status}); aborting before rollout`);
	}
	if (probeRes) {
		console.log(`  election-api auth probe → ${probeRes.status}`);
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
		// fetch does not throw on non-2xx, so check explicitly: a swallowed hook
		// failure would exit 0 and tell the operator the redeploy fired when it did not.
		const res = await fetch(deployHook, { method: 'POST' });
		if (!res.ok) {
			throw new Error(`Deploy hook POST → ${res.status}: ${await res.text()}`);
		}
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
	// redact: a Vercel validation error can embed the submitted token value.
	console.error(`Rotation failed: ${redact((err as Error).message)}`);
	process.exit(1);
});
