/**
 * One-time post-deploy migration: converge faqOverview.field_slug on every FAQ
 * document onto its canonical, collision-free slug (buildFaqSlugMap).
 *
 * ---------------------------------------------------------------------------
 * WHERE THE UNIQUENESS GAP IS CLOSED (for reviewers)
 * ---------------------------------------------------------------------------
 * The schema change in src/sanity/schema/groups/faqOverview.ts adds
 * `Rule.required()` to field_slug. That guarantees the slug is PRESENT, but
 * NOT that it is UNIQUE. Uniqueness matters because two resolution paths must
 * agree on the same URL for a given FAQ:
 *
 *   1. Routing / static generation and lookup use buildFaqSlugMap
 *      (src/lib/faqSlugs.ts), which deterministically de-duplicates by
 *      appending a short _id suffix to colliding slugs.
 *   2. Internal-link hrefs come from GROQ `coalesce(faqOverview.field_slug,_id)`
 *      (src/sanity/groq.ts), which emits the RAW stored slug with no collision
 *      awareness. resolveInternalLinkHref passes that href through unchanged.
 *
 * If two FAQs share a stored slug, path (1) suffixes the loser while path (2)
 * does not, so a link to the second FAQ resolves to the first (wrong target /
 * 404). Making stored slugs unique on disk collapses both paths onto the same
 * value, which is what this script does.
 *
 * It closes the gap for BOTH cases:
 *   - missing slug        -> writes the canonical (question-derived) slug
 *   - duplicate stored slug-> writes the canonical suffixed slug for the loser
 *
 * The script is idempotent: once every FAQ matches its canonical slug, a
 * re-run patches nothing. New duplicates authored after this run are a
 * separate, authoring-time concern (candidate for an isUnique schema rule).
 * ---------------------------------------------------------------------------
 *
 * Requires write token:
 *   export SANITY_STUDIO_API_TOKEN="your-token-with-editor-permissions"
 *
 * Run (write):
 *   bun run scripts/backfill-faq-slugs.ts
 *
 * Run (preview only, no mutations):
 *   BACKFILL_DRY_RUN=1 bun run scripts/backfill-faq-slugs.ts
 *
 * Optional env:
 *   BACKFILL_STUCK_LOG_MS — heartbeat interval while waiting on Sanity (default 5000)
 */
import { createClient } from '@sanity/client';
import { buildFaqSlugMap, getFaqSlug, type FaqLike } from '../src/lib/faqSlugs';

const projectId = '3rbseux7';
const dataset = 'production';
const token = process.env['SANITY_STUDIO_API_TOKEN'];
const dryRun = process.env['BACKFILL_DRY_RUN'] === '1';

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
	token,
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

type FaqDoc = FaqLike & {
	faqOverview?: {
		field_question?: string;
		field_slug?: string | null;
	} | null;
};

function readStoredSlug(faq: FaqDoc): string {
	const slug = faq.faqOverview?.field_slug;
	return typeof slug === 'string' ? slug.trim() : '';
}

type PatchPlan = {
	id: string;
	slug: string;
	/** 'fill' = slug was missing; 'dedupe' = stored slug diverged from the canonical unique slug. */
	reason: 'fill' | 'dedupe';
};

async function main() {
	log(`start project=${projectId} dataset=${dataset}${dryRun ? ' (DRY RUN)' : ''}`);

	const faqs = await withStuckHeartbeat(
		client.fetch<FaqDoc[]>(
			`*[_type == "faq"]{_id, faqOverview{field_question, field_slug}}`,
		),
		'fetch FAQs',
		STUCK_LOG_MS,
	);

	log(`fetched ${faqs.length} FAQ documents`);

	// buildFaqSlugMap resolves collisions deterministically, so slugMap holds the
	// canonical unique slug for every FAQ. We patch any doc whose stored slug does
	// not already equal it — this closes both the missing-slug and duplicate-slug gaps.
	const slugMap = buildFaqSlugMap(faqs);
	const toPatch: PatchPlan[] = [];
	let skipped = 0;

	for (const faq of faqs) {
		const canonical = getFaqSlug(faq, slugMap);
		if (!canonical) {
			log(`skip id=${faq._id} (no slug computed)`);
			skipped++;
			continue;
		}

		const stored = readStoredSlug(faq);
		if (stored === canonical) {
			skipped++;
			continue;
		}

		const reason: PatchPlan['reason'] = stored ? 'dedupe' : 'fill';
		if (reason === 'dedupe') {
			log(`dedupe id=${faq._id} stored="${stored}" -> canonical="${canonical}"`);
		}
		toPatch.push({ id: faq._id, slug: canonical, reason });
	}

	const fillCount = toPatch.filter(p => p.reason === 'fill').length;
	const dedupeCount = toPatch.filter(p => p.reason === 'dedupe').length;
	log(`will patch ${toPatch.length} (fill=${fillCount}, dedupe=${dedupeCount}), skip ${skipped}`);

	if (dryRun) {
		log('dry run: no mutations performed');
		return;
	}

	for (const { id, slug, reason } of toPatch) {
		log(`patch begin id=${id} slug=${slug} reason=${reason}`);
		await withStuckHeartbeat(
			client.patch(id).set({ 'faqOverview.field_slug': slug }).commit(),
			`Sanity mutate id=${id}`,
			STUCK_LOG_MS,
		);
		log(`patch ok id=${id}`);
	}

	log(`done patched=${toPatch.length} (fill=${fillCount}, dedupe=${dedupeCount}) skipped=${skipped}`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
