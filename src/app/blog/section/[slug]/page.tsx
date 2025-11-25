import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { categoriesQuery } from '~/sanity/groq';
import { sanityFetch } from '~/sanity/sanityClient';
import { PageSections } from '~/PageSections';
import { StructureMetaData } from '~/components/StructureMetadata';
import type { Params } from '~/lib/types';
import { BlogHero } from '~/ui/BlogHero';
import { getCashedArticles } from '~/lib/getCashedArticles';
import { FeaturedBlogBlock } from '~/ui/FeaturedBlogBlock';
import type { SanityImage } from '~/ui/types';
import { resolveBlogCard } from '~/ui/_lib/resolveBlogCard';
import { BlogBlock } from '~/ui/BlogBlock';
import { CTABlock } from '~/ui/CTABlock';
import { BlogTopicTagsBlock } from '~/ui/BlogTopicTagsBlock';
import { client } from '~/lib/client';

export async function generateStaticParams() {
	const entries = await client.fetch<Array<string>>('*[_type=="categories"][0..99].tagOverview.field_slug');
	return entries.map(entry => ({
		categories: entry,
	}));
}

export default async function Page(props: any) {
	const slug = (await props.params)['slug'];
	const page = await sanityFetch({
		query: categoriesQuery,
		params: {
			slug,
		},
	});
	if (!page) {
		notFound();
	}
	const { articles } = await getCashedArticles();

	return (
		<>
			<BlogHero
				articles={articles}
				title={page.tagOverview?.field_name}
				copy={page.tagOverview?.field_pageSubtitle}
				categories={page.categories?.filter(item => item.title && item.href) as { _id: string; title: string; href: string }[]}
			/>
			{page.featuredArticle?.editorialOverview?.field_editorialTitle && page.featuredArticle.href && (
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
			{page.categoryRelatedArticles?.articles && page.categoryRelatedArticles?.articles.length > 0 && (
				<BlogBlock items={page.categoryRelatedArticles?.articles.slice(0, 3).map(resolveBlogCard).filter(Boolean)} allItemsCount={3} />
			)}
			<CTABlock
				label={'Hardcoded label'}
				title={'Hardcoded title'}
				copy={'Hardcoded copy. This component is hardcoded and is not a part of the page sections array.'}
				caption={'Hardcoded caption'}
				color={'lavender'}
				form={{
					provider: 'Hubspot',
					formId: '5d84452a-01df-422b-9734-580148677d2c',
				}}
			/>
			{page.categoryRelatedArticles?.articles && page.categoryRelatedArticles?.articles.length > 3 && (
				<BlogBlock
					items={page.categoryRelatedArticles?.articles.slice(3).map(resolveBlogCard).filter(Boolean)}
					fetchProps={{
						categoryID: page._id,
					}}
					allItemsCount={page.categoryRelatedArticles.itemsCount}
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
		query: categoriesQuery,
		params: {
			slug: slug,
		},
	});

	return StructureMetaData(parentMetadata, {
		name: page?.tagOverview?.field_name,
		seo: page?.seo ?? undefined,
		url: page?.href ?? undefined,
	});
}
