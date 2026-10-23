import type { Sections } from '~/PageSections';
import type { PageExperimentExposure } from '~/experiments/pickResolvedPageExperiments';

/** Amplitude flag that splits the newsletter block copy on voter-facing blog articles. */
export const BLOG_NEWSLETTER_FLAG_KEY = 'blog-voter-newsletter-cta-202610';

/**
 * Blog categories whose readers are voters rather than candidates. Articles in these
 * categories swap their inline candidate CTAs for the newsletter block. Move an article
 * in or out of the swap by changing its category in Sanity; nothing here needs editing.
 */
export const VOTER_FACING_CATEGORY_SLUGS: readonly string[] = ['politics', 'independent-cause', 'for-voters'];

/** Article body section types that carry a CTA and get replaced. */
const INLINE_CTA_TYPES: ReadonlySet<string> = new Set(['ctaSection', 'imageCta']);

export type NewsletterBlockSection = Extract<Sections, { _type: 'component_newsletterBlock' }>;

/** Synthetic article body section the renderer turns into a newsletter CTA block with a form. */
export type NewsletterArticleSection = {
	_type: 'newsletterSection';
	_key: string;
	block: NewsletterBlockSection;
	/** Present when the visitor was bucketed, so the form submit can carry the arm. */
	experiment?: PageExperimentExposure;
};

/** Minimal row shape from activeVariantsByExperimentIdQuery (for tests and runtime). */
export type BlogNewsletterVariantRow = {
	field_variantName: string | null;
	pageSections?: { list_pageSections?: Sections[] | null } | null;
};

export function isVoterFacingCategory(categorySlug: string | null | undefined): boolean {
	return typeof categorySlug === 'string' && VOTER_FACING_CATEGORY_SLUGS.includes(categorySlug);
}

function firstNewsletterBlock(row: BlogNewsletterVariantRow | undefined): NewsletterBlockSection | null {
	const sections = row?.pageSections?.list_pageSections ?? [];
	const block = sections.find((s): s is NewsletterBlockSection => s?._type === 'component_newsletterBlock');
	return block ?? null;
}

/**
 * Chooses the newsletter block copy for this visitor. The assigned Amplitude variant wins
 * when a running Sanity doc carries that variant name; otherwise the `control` doc is used
 * so unbucketed visitors (no cookie, flag off) still see the newsletter CTA. Returns null
 * when no usable doc exists, which leaves the article untouched.
 */
export function pickNewsletterBlock(
	variants: readonly BlogNewsletterVariantRow[],
	assignedVariant: string | null | undefined,
): { block: NewsletterBlockSection; variant: string } | null {
	const wanted = assignedVariant && assignedVariant !== 'off' ? assignedVariant : 'control';
	const candidates = wanted === 'control' ? ['control'] : [wanted, 'control'];
	for (const name of candidates) {
		const block = firstNewsletterBlock(variants.find(v => v.field_variantName === name));
		if (block) return { block, variant: name };
	}
	return null;
}

/**
 * Replaces the first inline CTA in an article body with the newsletter section and drops
 * any later inline CTAs (two copies of the same HubSpot form on one page collide). An
 * article with no inline CTA gets the newsletter section appended after the body.
 */
export function swapInlineCtasForNewsletter<T extends { _type: string; _key?: string }>(
	sections: readonly T[] | null | undefined,
	block: NewsletterBlockSection,
	experiment?: PageExperimentExposure | null,
): (T | NewsletterArticleSection)[] {
	const out: (T | NewsletterArticleSection)[] = [];
	let placed = false;
	for (const section of sections ?? []) {
		if (!INLINE_CTA_TYPES.has(section._type)) {
			out.push(section);
			continue;
		}
		if (placed) continue;
		placed = true;
		out.push(newsletterSection(`newsletter-${section._key ?? 'cta'}`, block, experiment));
	}
	if (!placed) out.push(newsletterSection('newsletter-end', block, experiment));
	return out;
}

function newsletterSection(
	key: string,
	block: NewsletterBlockSection,
	experiment?: PageExperimentExposure | null,
): NewsletterArticleSection {
	return { _type: 'newsletterSection', _key: key, block, ...(experiment ? { experiment } : {}) };
}
