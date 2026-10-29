import 'server-only';

import { resolveVariants } from '~/lib/experimentServer';
import { activeVariantsByExperimentIdQuery } from '~/sanity/groq';
import { sanityFetch } from '~/sanity/sanityClient';
import type { PageExperimentExposure } from '~/experiments/pickResolvedPageExperiments';
import {
	BLOG_NEWSLETTER_FLAG_KEY,
	type NewsletterBlockSection,
	pickNewsletterBlock,
} from '~/experiments/blogNewsletter';

export type ResolvedBlogNewsletter = {
	block: NewsletterBlockSection;
	/** Set only when Amplitude bucketed the visitor into the arm being shown. */
	exposure: PageExperimentExposure | null;
};

/**
 * Reads the running `experiment_variant` docs for the blog newsletter flag, asks Amplitude
 * which arm this device gets, and returns that arm's newsletter block. Any failure returns
 * null so the article renders exactly as it did before the swap existed.
 */
export async function resolveBlogNewsletterExperiment(): Promise<ResolvedBlogNewsletter | null> {
	try {
		const variants = await sanityFetch({
			query: activeVariantsByExperimentIdQuery,
			params: { experimentId: BLOG_NEWSLETTER_FLAG_KEY },
			tags: ['experiment_variant'],
		});
		if (!variants?.length) return null;

		const assignments = await resolveVariants([BLOG_NEWSLETTER_FLAG_KEY]);
		const assigned = assignments[BLOG_NEWSLETTER_FLAG_KEY] ?? null;
		const picked = pickNewsletterBlock(variants, assigned);
		if (!picked) return null;

		const bucketed = Boolean(assigned) && assigned !== 'off' && picked.variant === assigned;
		return {
			block: picked.block,
			exposure: bucketed ? { flagKey: BLOG_NEWSLETTER_FLAG_KEY, variant: picked.variant } : null,
		};
	} catch {
		return null;
	}
}
