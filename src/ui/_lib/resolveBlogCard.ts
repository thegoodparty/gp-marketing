import type { BlogCardProps } from '~/ui/BlogCard';
import type { SanityImage } from '~/ui/types';
import type { TopicsQueryResult } from '~/sanity/groq';

export function resolveBlogCard(
	item: NonNullable<NonNullable<NonNullable<TopicsQueryResult>['topicRelatedArticles']>['articles']>[number],
): BlogCardProps | undefined {
	return item.href && item.editorialOverview?.field_editorialTitle
		? {
				author: item.editorialOverview?.ref_author?.personOverview?.field_personName
					? {
							image: item.editorialOverview?.ref_author?.personOverview?.img_profilePicture as unknown as SanityImage,
							meta: item.editorialOverview?.ref_author?.personOverview?.field_jobTitleOrRole
								? [item.editorialOverview?.ref_author?.personOverview.field_jobTitleOrRole]
								: undefined,
							name: item.editorialOverview?.ref_author?.personOverview?.field_personName,
						}
					: undefined,
				href: item.href,
				image: item.editorialAssets?.img_featuredImage as unknown as SanityImage,
				label: item.category ?? undefined,
				title: item.editorialOverview?.field_editorialTitle,
			}
		: undefined;
}
