import { createClient, type SanityQueries } from '@sanity/client';
import { projectId, dataset } from 'env';
import { draftMode } from 'next/headers';
import { token } from '~/lib/env';

// Canonical: tag-based revalidation via sanityFetch. electionsApi.ts and ashby.ts use time-based caching; migrate to tags in a follow-up.
export const sanityClient = createClient({
	projectId,
	dataset,
	apiVersion: '2025-10-08',
	useCdn: true,
	perspective: 'published',
});

// Pull the augmented SanityQueries interface:
declare module '@sanity/client' {
	// just to import the name, no changes here
	interface SanityQueries {}
}

// Helper type: any string key from the generated TypeMap
type QueryKey = Extract<keyof SanityQueries, string>;

export async function sanityFetch<Q extends QueryKey>({
	query,
	params,
	tags = [],
}: {
	query: Q;
	params?: Record<string, unknown>;
	tags?: string[];
}): Promise<SanityQueries[Q]> {
	const isDraft = (await draftMode()).isEnabled;

	if (!isDraft) {
		return sanityClient.fetch(query, params, {
			perspective: 'published',
			next: { tags },
		});
	}
	return sanityClient.fetch(query, params, {
		perspective: 'drafts',
		token: token,
		stega: {
			enabled: true,
			studioUrl: 'https://goodparty-marketing.sanity.studio/studio/main',
		},
	});
}
