/**
 * One-time backfill: set faqOverview.field_slug on existing FAQ documents
 * using the same slug logic as runtime routing (buildFaqSlugMap).
 *
 * Requires write token:
 *   export SANITY_STUDIO_API_TOKEN="your-token-with-editor-permissions"
 *
 * Run:
 *   bun run scripts/backfill-faq-slugs.ts
 *
 * Optional env:
 *   BACKFILL_STUCK_LOG_MS — heartbeat interval while waiting on Sanity (default 5000)
 */
import { createClient } from '@sanity/client';
import { buildFaqSlugMap, getFaqSlug, type FaqLike } from '../src/lib/faqSlugs';

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

type FaqDoc = FaqLike & {
	faqOverview?: {
		field_question?: string;
		field_slug?: string | null;
	} | null;
};

function hasStoredSlug(faq: FaqDoc): boolean {
	const slug = faq.faqOverview?.field_slug;
	return typeof slug === 'string' && slug.trim().length > 0;
}

async function main() {
	log(`start project=${projectId} dataset=${dataset}`);

	const faqs = await withStuckHeartbeat(
		client.fetch<FaqDoc[]>(
			`*[_type == "faq"]{_id, faqOverview{field_question, field_slug}}`,
		),
		'fetch FAQs',
		STUCK_LOG_MS,
	);

	log(`fetched ${faqs.length} FAQ documents`);

	const slugMap = buildFaqSlugMap(faqs);
	const toPatch: Array<{ id: string; slug: string }> = [];
	let skipped = 0;

	for (const faq of faqs) {
		if (hasStoredSlug(faq)) {
			skipped++;
			continue;
		}

		const slug = getFaqSlug(faq, slugMap);
		if (!slug) {
			log(`skip id=${faq._id} (no slug computed)`);
			skipped++;
			continue;
		}

		toPatch.push({ id: faq._id, slug });
	}

	log(`will patch ${toPatch.length}, skip ${skipped}`);

	for (const { id, slug } of toPatch) {
		log(`patch begin id=${id} slug=${slug}`);
		await withStuckHeartbeat(
			client.patch(id).set({ 'faqOverview.field_slug': slug }).commit(),
			`Sanity mutate id=${id}`,
			STUCK_LOG_MS,
		);
		log(`patch ok id=${id}`);
	}

	log(`done patched=${toPatch.length} skipped=${skipped}`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
