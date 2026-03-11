import { unstable_cache } from 'next/cache';
import { defaultRevalidate } from '~/lib/env';
import { allArticlesForSearchGroq } from '~/sanity/groq';
import { sanityClient } from '~/sanity/sanityClient';

export const getCashedArticles = unstable_cache(
	// This function ONLY runs when:
	// 1. Cache is empty (first time)
	// 2. Cache expired (after defaultRevalidate seconds)
	// 3. Manual revalidation triggered
	async () => {
		const timestamp = new Date().toISOString();

		try {
			const articles = await sanityClient.fetch(allArticlesForSearchGroq);

			return {
				timestamp,
				articles,
			}; // Next.js automatically saves this to cache
		} catch (err) {
			console.error('Error fetching articles:', err);
			return {
				timestamp,
				articles: null,
			}; // Next.js automatically saves this to cache
		}
	},
	['all-articles-for-search-cache-sanity'],
	{ revalidate: defaultRevalidate },
);
