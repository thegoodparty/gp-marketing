import { unstable_cache } from 'next/cache';
import { defaultRevalidate } from '~/lib/env';
import { buildFaqSlugMap, type FaqLike } from '~/lib/faqSlugs';
import { allFaqsQuery } from '~/sanity/groq';
import { sanityClient } from '~/sanity/sanityClient';

const getCachedFaqs = unstable_cache(
	async () => {
		const faqs = await sanityClient.fetch<FaqLike[]>(allFaqsQuery);
		return faqs ?? [];
	},
	['all-faqs-cache-sanity'],
	{ revalidate: defaultRevalidate, tags: ['faq'] },
);

export async function getCachedFaqSlugMap(): Promise<Map<string, string>> {
	const faqs = await getCachedFaqs();
	return buildFaqSlugMap(faqs);
}
