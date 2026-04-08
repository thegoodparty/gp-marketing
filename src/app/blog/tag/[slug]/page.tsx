import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { topicsQuery } from '~/sanity/groq';
import { sanityFetch } from '~/sanity/sanityClient';
import { PageSections } from '~/PageSections';
import { StructureMetaData } from '~/components/StructureMetadata';
import type { Params } from '~/lib/types';
import { BlogHero } from '~/ui/BlogHero';
import { getCachedArticles } from '~/lib/getCachedArticles';
import { FeaturedBlogBlock } from '~/ui/FeaturedBlogBlock';
import type { SanityImage } from '~/ui/types';
import { BlogBlock } from '~/ui/BlogBlock';
import { resolveBlogCard } from '~/ui/_lib/resolveBlogCard';
import { BlogTopicTagsBlock } from '~/ui/BlogTopicTagsBlock';
import { client } from '~/lib/client';

export async function generateStaticParams() {
	const entries = await client.fetch<Array<string>>('*[_type=="topics"].tagOverview.field_slug');
	return entries.filter(Boolean).map(entry => ({
		slug: entry,
	}));
}

export default async function Page(props: any) {
	const slug = (await props.params)['slug'];

	const page = await sanityFetch({
		query: topicsQuery,
		params: {
			slug,
		},
		tags: ['topics'],
	});
	if (!page) {
		notFound();
	}
	const { articles } = await getCachedArticles();

	return (
		<>
			<BlogHero
				articles={articles}
				title={page.tagOverview?.field_name}
				copy={page.tagOverview?.field_pageSubtitle}
				categories={page.categories?.filter(item => item.title && item.href) as { _id: string; title: string; href: string }[]}
			/>
			{page.featuredArticle?.editorialOverview?.field_editorialTitle && page.featuredArticle?.href && (
				<FeaturedBlogBlock
					title={page.featuredArticle?.editorialOverview?.field_editorialTitle}
					image={page.featuredArticle?.editorialAssets?.img_featuredImage as unknown as SanityImage}
					buttons={[
						{
							label: 'Read More',
							href: page.featuredArticle.href,
							buttonType: 'internal',
						},
					]}
					label='Featured Article'
				/>
			)}
			{page.topicRelatedArticles?.articles && (
				<BlogBlock
					items={page.topicRelatedArticles.articles.map(resolveBlogCard).filter(Boolean)}
					fetchProps={{
						topicID: page._id,
					}}
					allItemsCount={page.topicRelatedArticles.itemsCount}
				/>
			)}
			<BlogTopicTagsBlock
				topics={page.topics
					?.map(topic =>
						topic.tagOverview?.field_name && topic.href ? { name: topic.tagOverview.field_name, href: topic.href } : undefined,
					)
					.filter(Boolean)}
			/>
			<PageSections pageSections={page.pageSections?.list_pageSections} />
		</>
	);
}

export async function generateMetadata(props: Params, parent: ResolvingMetadata): Promise<Metadata> {
	const slug = (await props.params)['slug'];

	const parentMetadata = await parent;
	const page = await sanityFetch({
		query: topicsQuery,
		params: {
			slug: slug,
		},
		tags: ['topics'],
	});

	return StructureMetaData(parentMetadata, {
		name: page?.tagOverview?.field_name,
		seo: page?.seo ?? undefined,
		url: page?.href ?? undefined,
	});
}
