/**
 * One-time backfill: set field_targetPages, field_status, field_priority on existing
 * experiment_variant documents after schema deploy.
 *
 * Requires write token:
 *   export SANITY_STUDIO_API_TOKEN="your-token-with-editor-permissions"
 *
 * Run:
 *   bun run scripts/backfill-experiment-variant-fields.ts
 *
 * Optional env:
 *   BACKFILL_STUCK_LOG_MS — heartbeat interval while waiting on Sanity (default 5000)
 */
import { createClient } from '@sanity/client';

const projectId = '3rbseux7';
const dataset = 'production';
const token = process.env['SANITY_STUDIO_API_TOKEN'];

if (!token) {
	console.error('Missing SANITY_STUDIO_API_TOKEN');
	process.exit(1);
}

const REQUEST_TIMEOUT_MS = 60_000;
const STUCK_LOG_MS = Math.max(
	1000,
	Number.parseInt(process.env['BACKFILL_STUCK_LOG_MS'] ?? '5000', 10) || 5000,
);

function log(...parts: unknown[]) {
	console.error(new Date().toISOString(), '[backfill]', ...parts);
}

/** Logs every `intervalMs` until `promise` settles (so long hangs are visible). */
function withStuckHeartbeat<T>(promise: Promise<T>, label: string, intervalMs: number): Promise<T> {
	const started = Date.now();
	const tick = setInterval(() => {
		const s = Math.round((Date.now() - started) / 1000);
		log(`still waiting on ${label} (${s}s elapsed) — if this repeats, check network, token, or Sanity status`);
	}, intervalMs);

	return promise.finally(() => {
		clearInterval(tick);
	});
}

const client = createClient({
	projectId,
	dataset,
	token,
	apiVersion: '2025-09-25',
	useCdn: false,
	fetch: (url, init) => {
		const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
		const userSignal = init && 'signal' in init ? init.signal : undefined;
		const signal =
			userSignal && userSignal instanceof AbortSignal
				? AbortSignal.any([userSignal, timeout])
				: timeout;
		return fetch(url, { ...init, signal });
	},
});

const homeRef = { _type: 'reference' as const, _ref: 'goodpartyOrg_home', _key: 'targetHome' };

async function main() {
	log(
		`start project=${projectId} dataset=${dataset} patches=2 httpTimeoutMs=${REQUEST_TIMEOUT_MS} stuckLogMs=${STUCK_LOG_MS}`,
	);

	const patches: Array<{ id: string; set: Record<string, unknown> }> = [
		{
			id: '038be548-3011-43bc-acb9-e3e9df9bdd78',
			set: {
				field_targetPages: [homeRef],
				field_status: 'running',
				field_priority: 100,
			},
		},
		{
			id: '4c434b7b-5417-431f-a2c2-520046c29eb2',
			set: {
				field_targetPages: [homeRef],
				field_status: 'draft',
				field_priority: 200,
			},
		},
	];

	for (const { id, set } of patches) {
		log(`patch begin id=${id}`);
		await withStuckHeartbeat(
			client.patch(id).set(set).commit(),
			`Sanity mutate id=${id}`,
			STUCK_LOG_MS,
		);
		log(`patch ok id=${id}`);
	}

	log('done');
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
