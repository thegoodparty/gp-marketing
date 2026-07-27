/**
 * One-time migration: converge faqOverview.field_slug on every FAQ document onto
 * its canonical, collision-free slug (buildFaqSlugMap).
 *
 * ---------------------------------------------------------------------------
 * ROLLOUT ORDER (required)
 * ---------------------------------------------------------------------------
 * 1. Dry-run this script and review counts.
 * 2. Run with --write using a token holder.
 * 3. Verify the post-write audit passes (zero remaining patches / duplicates).
 * 4. Merge/deploy the required schema (field_slug required + unique validation).
 *
 * Deploying the required schema before the backfill leaves existing FAQs without
 * slugs unpublishable in Studio.
 * ---------------------------------------------------------------------------
 *
 * Requires token for dry-run and write (drafts / versions need auth):
 *   export SANITY_STUDIO_API_TOKEN="your-token-with-editor-permissions"
 *
 * Run (dry-run, default):
 *   bun run sanity:backfill:faq-slugs
 *
 * Run (write):
 *   bun run sanity:backfill:faq-slugs -- --write
 *
 * Run (audit only):
 *   bun run sanity:backfill:faq-slugs -- --audit
 *
 * Optional env:
 *   SANITY_DATASET — defaults to production
 *   BACKFILL_STUCK_LOG_MS — heartbeat interval while waiting on Sanity (default 5000)
 */
import { createClient } from '@sanity/client';
import {
	auditFaqSlugInvariants,
	planFaqSlugBackfill,
	type FaqBackfillDoc,
} from '../src/lib/faqBackfillPlan';

const projectId = '3rbseux7';
const dataset = process.env['SANITY_DATASET'] ?? 'production';
const token = process.env['SANITY_STUDIO_API_TOKEN'];
const write = process.argv.includes('--write');
const auditOnly = process.argv.includes('--audit');

const REQUEST_TIMEOUT_MS = 60_000;
const STUCK_LOG_MS = Math.max(
	1000,
	Number.parseInt(process.env['BACKFILL_STUCK_LOG_MS'] ?? '5000', 10) || 5000,
);

function log(...parts: unknown[]) {
	console.error(new Date().toISOString(), '[backfill-faq-slugs]', ...parts);
}

async function withStuckHeartbeat<T>(promise: Promise<T>, label: string, intervalMs: number): Promise<T> {
	const started = Date.now();
	const tick = setInterval(() => {
		const s = Math.round((Date.now() - started) / 1000);
		log(`still waiting on ${label} (${s}s elapsed)`);
	}, intervalMs);

	try {
		return await promise;
	} finally {
		clearInterval(tick);
	}
}

if (!token) {
	console.error('Missing SANITY_STUDIO_API_TOKEN (required for dry-run, --audit, and --write)');
	process.exit(1);
}

const client = createClient({
	projectId,
	dataset,
	token,
	apiVersion: '2025-09-25',
	useCdn: false,
	perspective: 'raw',
	fetch: (async (url, init) => {
		const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
		const userSignal = init && 'signal' in init ? init.signal : undefined;
		const signal =
			userSignal && userSignal instanceof AbortSignal
				? AbortSignal.any([userSignal, timeout])
				: timeout;
		return await fetch(url, { ...init, signal });
	}) as unknown as Parameters<typeof createClient>[0]['fetch'],
});

const FAQ_FETCH_QUERY = `*[_type == "faq"] | order(faqOverview.field_question asc, _id asc){_id,_rev,faqOverview{field_question, field_slug}}`;

async function fetchFaqs() {
	return await withStuckHeartbeat(client.fetch<FaqBackfillDoc[]>(FAQ_FETCH_QUERY), 'fetch FAQs', STUCK_LOG_MS);
}

async function main() {
	log(`start project=${projectId} dataset=${dataset}${write ? '' : auditOnly ? ' (AUDIT)' : ' (DRY RUN)'}`);

	const faqs = await fetchFaqs();
	log(`fetched ${faqs.length} FAQ documents (perspective=raw)`);

	if (auditOnly) {
		const audit = auditFaqSlugInvariants(faqs);
		log(
			`audit remainingPatches=${audit.remainingPatches} preflightErrors=${audit.preflightErrors.length} duplicateSlugs=${audit.duplicateSlugs.length}`,
		);
		for (const error of audit.preflightErrors) log(`preflight error: ${error}`);
		for (const slug of audit.duplicateSlugs) log(`duplicate slug: ${slug}`);
		if (!audit.ok) throw new Error('FAQ slug audit failed');
		log('audit ok');
		return;
	}

	const { patches, skipped, preflightErrors, duplicateSlugs } = planFaqSlugBackfill(faqs);

	if (preflightErrors.length > 0) {
		for (const error of preflightErrors) {
			log(`preflight error: ${error}`);
		}
		throw new Error(`preflight failed with ${preflightErrors.length} error(s)`);
	}

	if (duplicateSlugs.length > 0 && !write) {
		for (const slug of duplicateSlugs) log(`duplicate stored slug before write: ${slug}`);
	}

	const fillCount = patches.filter(p => p.reason === 'fill').length;
	const dedupeCount = patches.filter(p => p.reason === 'dedupe').length;
	log(`will patch ${patches.length} (fill=${fillCount}, dedupe=${dedupeCount}), skip ${skipped}`);

	if (!write) {
		log('dry run: no mutations performed');
		return;
	}

	for (const { id, slug, reason, rev } of patches) {
		log(`patch begin id=${id} slug=${slug} reason=${reason}`);
		let patch = client.patch(id).set({ 'faqOverview.field_slug': slug });
		if (rev) patch = patch.ifRevisionId(rev);
		try {
			await withStuckHeartbeat(patch.commit(), `Sanity mutate id=${id}`, STUCK_LOG_MS);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			log(`patch failed id=${id} - ${msg} - continuing (re-run --write to finish)`);
			continue;
		}
		log(`patch ok id=${id}`);
	}

	const after = await fetchFaqs();
	const audit = auditFaqSlugInvariants(after);
	for (const error of audit.preflightErrors) log(`post-write preflight error: ${error}`);
	for (const slug of audit.duplicateSlugs) log(`post-write duplicate slug: ${slug}`);
	if (!audit.ok) {
		throw new Error(
			`post-write audit failed: remainingPatches=${audit.remainingPatches} preflightErrors=${audit.preflightErrors.length} duplicateSlugs=${audit.duplicateSlugs.length}`,
		);
	}

	log(`done patched=${patches.length} (fill=${fillCount}, dedupe=${dedupeCount}) skipped=${skipped}`);
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
