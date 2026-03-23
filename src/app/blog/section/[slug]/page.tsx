import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { categoriesQuery, goodpartyOrg_homeQuery } from '~/sanity/groq';
import { sanityFetch } from '~/sanity/sanityClient';
import { PageSections, type Sections } from '~/PageSections';
import { StructureMetaData } from '~/components/StructureMetadata';
import type { Params } from '~/lib/types';
import { BlogHero } from '~/ui/BlogHero';
import { getCachedArticles } from '~/lib/getCachedArticles';
import { FeaturedBlogBlock } from '~/ui/FeaturedBlogBlock';
import type { SanityImage } from '~/ui/types';
import { resolveBlogCard } from '~/ui/_lib/resolveBlogCard';
import { BlogBlock } from '~/ui/BlogBlock';
import { BlogTopicTagsBlock } from '~/ui/BlogTopicTagsBlock';
import { NewsletterBlockSection } from '~/PageSections/NewsletterBlockSection';
import { client } from '~/lib/client';

type NewsletterBlockSectionType = Extract<Sections, { _type: 'component_newsletterBlock' }>;

export async function generateStaticParams() {
	const entries = await client.fetch<Array<string>>('*[_type=="categories"][0..99].tagOverview.field_slug');
	return entries.filter(Boolean).map(entry => ({
		slug: entry,
	}));
}

export default async function Page(props: Params) {
	const slug = (await props.params)['slug'];
	const page = await sanityFetch({
		query: categoriesQuery,
		params: {
			slug,
		},
		tags: ['categories'],
	});
	if (!page) {
		notFound();
	}
	const { articles } = await getCachedArticles();

	const categoryNewsletterSection =
		(page.pageSections?.list_pageSections?.find((section: Sections) => section?._type === 'component_newsletterBlock') as
			| NewsletterBlockSectionType
			| undefined);

	const newsletterSectionFromHome = categoryNewsletterSection
		? null
		: await sanityFetch({
				query: goodpartyOrg_homeQuery,
				tags: ['goodpartyOrg_home'],
			});

	const newsletterSection =
		categoryNewsletterSection ??
		(newsletterSectionFromHome?.pageSections?.list_pageSections?.find((section: Sections) => section?._type === 'component_newsletterBlock') as
			| NewsletterBlockSectionType
			| undefined);

	return (
		<>
			<BlogHero
				articles={articles}
				title={page.tagOverview?.field_name}
				copy={page.tagOverview?.field_pageSubtitle}
				categories={page.categories?.filter((item): item is { _id: string; title: string; href: string } => Boolean(item.title && item.href))}
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
			{newsletterSection ? <NewsletterBlockSection {...newsletterSection} /> : null}
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
			<PageSections
				pageSections={page.pageSections?.list_pageSections?.filter((section: Sections) => section._type !== 'component_newsletterBlock')}
			/>
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
		tags: ['categories'],
	});

	return StructureMetaData(parentMetadata, {
		name: page?.tagOverview?.field_name,
		seo: page?.seo ?? undefined,
		url: page?.href ?? undefined,
	});
}
