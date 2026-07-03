/**
 * POST-MERGE: FAQ internal links (ClickUp 86ahzk179)
 *
 * Run once after the FAQ internal-links PR is deployed to production (app +
 * Sanity schema). Until this completes, existing FAQ documents may lack
 * faqOverview.field_slug; GROQ internal links omit href until field_slug is set.
 * Routing and sitemap use canonical slugs from buildFaqSlugMap once stored.
 *
 * ---------------------------------------------------------------------------
 * FOR REVIEWERS — why this script exists
 * ---------------------------------------------------------------------------
 * Code deploy alone is not enough. The single source of truth for FAQ URLs is
 * the stored faqOverview.field_slug on each faq document. Related changes:
 *
 *   - src/sanity/schema/documents/faq.ts       — Studio internal-link picker
 *   - src/sanity/schema/groups/faqOverview.ts  — required + unique field_slug
 *   - src/sanity/groq.ts                       — faqHrefGroq (stored slug only)
 *   - src/lib/faqSlugs.ts                      — routing/sitemap slug map
 *   - scripts/backfill-faq-slugs.ts            — low-level backfill impl
 *
 * GROQ emits href only when field_slug is defined. Routing prefers stored slugs
 * via buildFaqSlugMap. This script backfills missing slugs and dedupes any
 * collisions so both paths agree. It is idempotent.
 * ---------------------------------------------------------------------------
 *
 * Prerequisites:
 *   1. PR merged and deployed (Next.js + Sanity Studio schema).
 *   2. export SANITY_STUDIO_API_TOKEN="token-with-editor-permissions"
 *
 * Usage:
 *   bun run sanity:post-merge:faq-internal-links        # preview (dry run)
 *   bun run sanity:post-merge:faq-internal-links:apply  # write to production
 *
 * Optional env:
 *   BACKFILL_STUCK_LOG_MS — heartbeat while waiting on Sanity (default 5000)
 */
import { backfillFaqSlugs } from './backfill-faq-slugs';

const LOG_PREFIX = '[post-merge-faq-internal-links]';
const apply = process.env['POST_MERGE_APPLY'] === '1';

function log(...parts: unknown[]) {
	console.error(new Date().toISOString(), LOG_PREFIX, ...parts);
}

async function main() {
	log('FAQ internal links — post-merge backfill');
	log('');
	log('Prerequisites: app + Sanity schema deployed; SANITY_STUDIO_API_TOKEN set.');
	log('');

	if (!process.env['SANITY_STUDIO_API_TOKEN']) {
		console.error(`${LOG_PREFIX} Missing SANITY_STUDIO_API_TOKEN`);
		process.exit(1);
	}

	if (!apply) {
		log('Mode: DRY RUN (preview only). No documents will be mutated.');
		log('To apply patches: bun run sanity:post-merge:faq-internal-links:apply');
		log('');
	} else {
		log('Mode: APPLY — will patch FAQ documents in Sanity production.');
		log('');
	}

	const result = await backfillFaqSlugs({
		dryRun: !apply,
		logPrefix: LOG_PREFIX,
	});

	log('');
	log('Summary:');
	log(`  FAQs fetched:  ${result.faqCount}`);
	log(`  Would patch:   ${result.patched} (fill=${result.fill}, dedupe=${result.dedupe})`);
	log(`  Already OK:    ${result.skipped}`);
	log('');

	if (!apply && result.patched > 0) {
		log('Re-run with :apply to write these slugs to production.');
	} else if (!apply && result.patched === 0) {
		log('Nothing to patch. Production slugs already match canonical values.');
	} else if (apply) {
		log('Backfill complete. Verify a few FAQ internal links in Sanity Studio.');
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
