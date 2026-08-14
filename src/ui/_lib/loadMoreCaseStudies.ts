'use server';
import { sanityFetch } from '~/sanity/sanityClient';

export async function loadMoreCaseStudies(props: { query: string; params?: Record<string, unknown> }) {
	const result = await sanityFetch({
		query: props.query as any,
		params: props.params,
		tags: ['caseStudy'],
	});

	return result as Array<{
		editorialOverview?: {
			field_editorialTitle?: string | null;
			field_publishedDate?: string | null;
			field_lastUpdated?: string | null;
			ref_author?: {
				personOverview?: {
					field_personName?: string | null;
					img_profilePicture?: unknown;
				} | null;
			} | null;
		} | null;
		editorialAssets?: {
			img_featuredImage?: unknown;
		} | null;
		category?: string | null;
		href?: string | null;
	}>;
}
