'use server';
import { sanityFetch } from '~/sanity/sanityClient';
import type { TopicsQueryResult } from '~/sanity/groq';

export async function loadMoreArticles(props: { query: string; params?: Record<string, unknown> }) {
	const result = await sanityFetch({
		query: props.query as any,
		params: props.params,
		tags: ['article'],
	});

	return result as NonNullable<NonNullable<NonNullable<TopicsQueryResult>['topicRelatedArticles']>['articles']>[number];
}
