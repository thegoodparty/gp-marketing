import { unstable_cache } from 'next/cache';
import { defaultRevalidate } from '~/lib/env';
import { allTermsForSearchGroq } from '~/sanity/groq';
import { sanityClient } from '~/sanity/sanityClient';

export const getCashedTerms = unstable_cache(
	// This function ONLY runs when:
	// 1. Cache is empty (first time)
	// 2. Cache expired (after defaultRevalidate seconds)
	// 3. Manual revalidation triggered
	async () => {
		const timestamp = new Date().toISOString();

		try {
			const terms = await sanityClient.fetch(allTermsForSearchGroq);

			return {
				timestamp,
				terms,
			}; // Next.js automatically saves this to cache
		} catch (err) {
			console.error('Error fetching articles:', err);
			return {
				timestamp,
				terms: null,
			}; // Next.js automatically saves this to cache
		}
	},
	['all-terms-for-search-cache-sanity'],
	{ revalidate: defaultRevalidate },
);
