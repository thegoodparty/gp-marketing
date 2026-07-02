/**
 * Low-level backfill: converge faqOverview.field_slug on every FAQ document onto
 * its canonical, collision-free slug (buildFaqSlugMap).
 *
 * Prefer the post-merge entry point for operators:
 *   bun run sanity:post-merge:faq-internal-links        # preview (dry run)
 *   bun run sanity:post-merge:faq-internal-links:apply  # write to production
 *
 * This module is also callable directly:
 *   BACKFILL_DRY_RUN=1 bun run scripts/backfill-faq-slugs.ts
 *   bun run scripts/backfill-faq-slugs.ts
 *
 * See scripts/post-merge-faq-internal-links.ts for the full post-deploy checklist.
 */
import { createClient, type SanityClient } from '@sanity/client';
import { buildFaqSlugMap, getFaqSlug, type FaqLike } from '../src/lib/faqSlugs';

const projectId = '3rbseux7';
const dataset = 'production';

const REQUEST_TIMEOUT_MS = 60_000;
const STUCK_LOG_MS = Math.max(
	1000,
	Number.parseInt(process.env['BACKFILL_STUCK_LOG_MS'] ?? '5000', 10) || 5000,
);

export type BackfillFaqSlugsOptions = {
	dryRun?: boolean;
	token?: string;
	logPrefix?: string;
};

export type BackfillFaqSlugsResult = {
	faqCount: number;
	patched: number;
	skipped: number;
	fill: number;
	dedupe: number;
	dryRun: boolean;
};

type FaqDoc = FaqLike & {
	faqOverview?: {
		field_question?: string;
		field_slug?: string | null;
	} | null;
};

type PatchPlan = {
	id: string;
	slug: string;
	reason: 'fill' | 'dedupe';
};

function log(prefix: string, ...parts: unknown[]) {
	console.error(new Date().toISOString(), prefix, ...parts);
}

function withStuckHeartbeat<T>(promise: Promise<T>, label: string, intervalMs: number, prefix: string): Promise<T> {
	const started = Date.now();
	const tick = setInterval(() => {
		const s = Math.round((Date.now() - started) / 1000);
		log(prefix, `still waiting on ${label} (${s}s elapsed)`);
	}, intervalMs);

	return promise.finally(() => {
		clearInterval(tick);
	});
}

function createBackfillClient(token: string): SanityClient {
	return createClient({
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
}

function readStoredSlug(faq: FaqDoc): string {
	const slug = faq.faqOverview?.field_slug;
	return typeof slug === 'string' ? slug.trim() : '';
}

export async function backfillFaqSlugs(options: BackfillFaqSlugsOptions = {}): Promise<BackfillFaqSlugsResult> {
	const dryRun = options.dryRun ?? false;
	const token = options.token ?? process.env['SANITY_STUDIO_API_TOKEN'];
	const prefix = options.logPrefix ?? '[backfill-faq-slugs]';

	if (!token) {
		throw new Error('Missing SANITY_STUDIO_API_TOKEN');
	}

	const client = createBackfillClient(token);

	log(prefix, `start project=${projectId} dataset=${dataset}${dryRun ? ' (DRY RUN)' : ''}`);

	const faqs = await withStuckHeartbeat(
		client.fetch<FaqDoc[]>(`*[_type == "faq"]{_id, faqOverview{field_question, field_slug}}`),
		'fetch FAQs',
		STUCK_LOG_MS,
		prefix,
	);

	log(prefix, `fetched ${faqs.length} FAQ documents`);

	const slugMap = buildFaqSlugMap(faqs);
	const toPatch: PatchPlan[] = [];
	let skipped = 0;

	for (const faq of faqs) {
		const canonical = getFaqSlug(faq, slugMap);
		if (!canonical) {
			log(prefix, `skip id=${faq._id} (no slug computed)`);
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
			log(prefix, `dedupe id=${faq._id} stored="${stored}" -> canonical="${canonical}"`);
		}
		toPatch.push({ id: faq._id, slug: canonical, reason });
	}

	const fill = toPatch.filter(p => p.reason === 'fill').length;
	const dedupe = toPatch.filter(p => p.reason === 'dedupe').length;
	log(prefix, `will patch ${toPatch.length} (fill=${fill}, dedupe=${dedupe}), skip ${skipped}`);

	if (!dryRun) {
		for (const { id, slug, reason } of toPatch) {
			log(prefix, `patch begin id=${id} slug=${slug} reason=${reason}`);
			await withStuckHeartbeat(
				client.patch(id).set({ 'faqOverview.field_slug': slug }).commit(),
				`Sanity mutate id=${id}`,
				STUCK_LOG_MS,
				prefix,
			);
			log(prefix, `patch ok id=${id}`);
		}
	} else {
		log(prefix, 'dry run: no mutations performed');
	}

	log(prefix, `done patched=${toPatch.length} (fill=${fill}, dedupe=${dedupe}) skipped=${skipped}`);

	return {
		faqCount: faqs.length,
		patched: toPatch.length,
		skipped,
		fill,
		dedupe,
		dryRun,
	};
}

if (import.meta.main) {
	const dryRun = process.env['BACKFILL_DRY_RUN'] === '1';
	backfillFaqSlugs({ dryRun }).catch((e) => {
		console.error(e);
		process.exit(1);
	});
}
