/**
 * One-time migration: converge faqOverview.field_slug on every FAQ document onto
 * its canonical, collision-free slug (buildFaqSlugMap).
 *
 * ---------------------------------------------------------------------------
 * ROLLOUT ORDER (required)
 * ---------------------------------------------------------------------------
 * 1. Dry-run this script and review counts.
 * 2. Run with --write using a token holder.
 * 3. Verify the post-write check passes.
 * 4. Merge/deploy the required schema (field_slug required + unique validation).
 *
 * Deploying the required schema before the backfill leaves existing FAQs without
 * slugs unpublishable in Studio.
 * ---------------------------------------------------------------------------
 *
 * Requires write token for --write:
 *   export SANITY_STUDIO_API_TOKEN="your-token-with-editor-permissions"
 *
 * Run (dry-run, default):
 *   bun run sanity:backfill:faq-slugs
 *
 * Run (write):
 *   bun run sanity:backfill:faq-slugs -- --write
 *
 * Optional env:
 *   SANITY_DATASET — defaults to production
 *   BACKFILL_STUCK_LOG_MS — heartbeat interval while waiting on Sanity (default 5000)
 */
import { createClient } from '@sanity/client';
import { planFaqSlugBackfill, type FaqBackfillDoc } from '../src/lib/faqBackfillPlan';

const projectId = '3rbseux7';
const dataset = process.env['SANITY_DATASET'] ?? 'production';
const token = process.env['SANITY_STUDIO_API_TOKEN'];
const write = process.argv.includes('--write');

const REQUEST_TIMEOUT_MS = 60_000;
const STUCK_LOG_MS = Math.max(
	1000,
	Number.parseInt(process.env['BACKFILL_STUCK_LOG_MS'] ?? '5000', 10) || 5000,
);

function log(...parts: unknown[]) {
	console.error(new Date().toISOString(), '[backfill-faq-slugs]', ...parts);
}

function withStuckHeartbeat<T>(promise: Promise<T>, label: string, intervalMs: number): Promise<T> {
	const started = Date.now();
	const tick = setInterval(() => {
		const s = Math.round((Date.now() - started) / 1000);
		log(`still waiting on ${label} (${s}s elapsed)`);
	}, intervalMs);

	return promise.finally(() => {
		clearInterval(tick);
	});
}

const client = createClient({
	projectId,
	dataset,
	token: token ?? undefined,
	apiVersion: '2025-09-25',
	useCdn: false,
	fetch: ((url, init) => {
		const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
		const userSignal = init && 'signal' in init ? init.signal : undefined;
		const signal =
			userSignal && userSignal instanceof AbortSignal
				? AbortSignal.any([userSignal, timeout])
				: timeout;
		return fetch(url, { ...init, signal });
	}) as unknown as Parameters<typeof createClient>[0]['fetch'],
});

const FAQ_FETCH_QUERY = `*[_type == "faq"] | order(faqOverview.field_question asc, _id asc){_id, faqOverview{field_question, field_slug}}`;

function readStoredSlug(faq: FaqBackfillDoc): string {
	const slug = faq.faqOverview?.field_slug;
	return typeof slug === 'string' ? slug.trim() : '';
}

async function verifyPatches(patches: Array<{ id: string; slug: string }>) {
	const faqs = await client.fetch<FaqBackfillDoc[]>(FAQ_FETCH_QUERY);
	const byId = new Map(faqs.map(faq => [faq._id, faq]));
	const failures: string[] = [];

	for (const patch of patches) {
		const faq = byId.get(patch.id);
		const stored = faq ? readStoredSlug(faq) : '';
		if (stored !== patch.slug) {
			failures.push(`id=${patch.id} expected="${patch.slug}" got="${stored || '(missing)'}"`);
		}
	}

	if (failures.length > 0) {
		throw new Error(`post-write verification failed:\n${failures.join('\n')}`);
	}
}

async function main() {
	if (write && !token) {
		console.error('Missing SANITY_STUDIO_API_TOKEN (required for --write)');
		process.exit(1);
	}

	log(`start project=${projectId} dataset=${dataset}${write ? '' : ' (DRY RUN)'}`);

	const faqs = await withStuckHeartbeat(client.fetch<FaqBackfillDoc[]>(FAQ_FETCH_QUERY), 'fetch FAQs', STUCK_LOG_MS);
	log(`fetched ${faqs.length} FAQ documents`);

	const { patches, skipped, preflightErrors } = planFaqSlugBackfill(faqs);

	if (preflightErrors.length > 0) {
		for (const error of preflightErrors) {
			log(`preflight error: ${error}`);
		}
		throw new Error(`preflight failed with ${preflightErrors.length} error(s)`);
	}

	const fillCount = patches.filter(p => p.reason === 'fill').length;
	const dedupeCount = patches.filter(p => p.reason === 'dedupe').length;
	log(`will patch ${patches.length} (fill=${fillCount}, dedupe=${dedupeCount}), skip ${skipped}`);

	if (!write) {
		log('dry run: no mutations performed');
		return;
	}

	for (const { id, slug, reason } of patches) {
		log(`patch begin id=${id} slug=${slug} reason=${reason}`);
		await withStuckHeartbeat(
			client.patch(id).set({ 'faqOverview.field_slug': slug }).commit(),
			`Sanity mutate id=${id}`,
			STUCK_LOG_MS,
		);
		log(`patch ok id=${id}`);
	}

	await verifyPatches(patches);
	log(`done patched=${patches.length} (fill=${fillCount}, dedupe=${dedupeCount}) skipped=${skipped}`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
