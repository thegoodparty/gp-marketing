import type { BlogCardProps } from '~/ui/BlogCard';
import type { SanityImage } from '~/ui/types';
import type { ArticleQueryResult, CategoriesQueryResult, TopicsQueryResult } from 'sanity.types';
import { format } from 'date-fns';
import { stegaClean } from 'next-sanity';

type TopicRelatedArticle = NonNullable<NonNullable<NonNullable<TopicsQueryResult>['topicRelatedArticles']>['articles']>[number];
type CategoryRelatedArticle = NonNullable<NonNullable<NonNullable<CategoriesQueryResult>['categoryRelatedArticles']>['articles']>[number];
type ArticleRelatedArticleListItem = NonNullable<
	NonNullable<NonNullable<NonNullable<ArticleQueryResult>['relatedArticles']>['list_relatedArticles']>
>[number];

export type ResolveBlogCardSource = TopicRelatedArticle | CategoryRelatedArticle | ArticleRelatedArticleListItem;

function resolveBlogCardCategoryLabel(category: ResolveBlogCardSource['category']): string | undefined {
	if (category == null) return undefined;
	// Topic/category listing queries project `category` via articleCardGroq as tagOverview.field_name (string); article list_relatedArticles uses relatedArticlesGroq (categories document).
	if (typeof category === 'string') return category;
	if (category !== null && typeof category === 'object' && !Array.isArray(category) && 'tagOverview' in category) {
		return category.tagOverview?.field_name ?? undefined;
	}
	return undefined;
}

export function resolveBlogCard(item: ResolveBlogCardSource): BlogCardProps | undefined {
	return item.href && item.editorialOverview?.field_editorialTitle
		? {
				author: item.editorialOverview?.ref_author?.personOverview?.field_personName
					? {
							image: item.editorialOverview?.ref_author?.personOverview?.img_profilePicture as unknown as SanityImage,
							meta:
								item.editorialOverview?.field_publishedDate || item.editorialOverview?.field_lastUpdated
									? [
											item.editorialOverview?.field_lastUpdated
												? `Updated: ${format(new Date(stegaClean(item.editorialOverview?.field_lastUpdated)), 'MMM dd, yyyy')}`
												: item.editorialOverview?.field_publishedDate
													? format(new Date(stegaClean(item.editorialOverview?.field_publishedDate)), 'MMM dd, yyyy')
													: '',
										]
									: undefined,
							name: item.editorialOverview?.ref_author?.personOverview?.field_personName,
						}
					: undefined,
				href: item.href,
				image: item.editorialAssets?.img_featuredImage as unknown as SanityImage,
				label: resolveBlogCardCategoryLabel(item.category),
				title: item.editorialOverview?.field_editorialTitle,
			}
		: undefined;
}
