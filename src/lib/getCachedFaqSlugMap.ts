import { unstable_cache } from 'next/cache';
import { defaultRevalidate } from '~/lib/env';
import { FAQ_PAGE_SLUG, buildFaqSlugMap } from '~/lib/faqSlugs';
import { allFaqsQuery } from '~/sanity/groq';
import { sanityClient } from '~/sanity/sanityClient';

const getCachedFaqs = unstable_cache(
	async () => {
		const faqs = await sanityClient.fetch(allFaqsQuery, {}, { perspective: 'published', next: { tags: ['faq'] } });
		return faqs ?? [];
	},
	['all-faqs-cache-sanity'],
	{ revalidate: defaultRevalidate, tags: ['faq'] },
);

export async function getCachedFaqSlugMap(): Promise<Map<string, string>> {
	const faqs = await getCachedFaqs();
	return buildFaqSlugMap(faqs);
}

export async function getFaqSlugMapForPage(pageSlug?: string): Promise<Map<string, string> | undefined> {
	if (pageSlug !== FAQ_PAGE_SLUG) return undefined;
	return getCachedFaqSlugMap();
}
