import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';

import { articleQuery } from '~/sanity/groq';
import { sanityFetch } from '~/sanity/sanityClient';

import { StructureMetaData } from '~/components/StructureMetadata';

import type { Params } from '~/lib/types';

import { BlogArticleHero } from '~/ui/BlogArticleHero';
import type { SanityImage } from '~/ui/types';

import { RichTextContentSections } from '~/RichTextContentSections';
import { BlogArticleTags } from '~/ui/BlogArticleTags';
import { resolveEditorialContentTags } from '~/ui/_lib/resolveEditorialContentTags';
import { EditorialLayout } from '~/components/EditorialLayout';
import { resolveArticleNavigation } from '~/lib/resolveArticleNavigation';
import { Author } from '~/ui/Author';
import { client } from '~/lib/client';

export async function generateStaticParams() {
	const entries = await client.fetch<Array<{ categories: string; article: string }>>(
		'*[_type == "article"]{"categories":editorialContentTags.ref_catgories->tagOverview.field_slug,"article":editorialOverview.field_slug}',
	);
	return entries.map(entry => ({
		categories: entry.categories,
		article: entry.article,
	}));
}

export default async function Page(props: any) {
	const slug = (await props.params)['article'];
	const category = (await props.params)['categories'];

	const page = await sanityFetch({
		query: articleQuery,
		params: {
			slug,
			category,
		},
	});

	if (!page) {
		notFound();
	}

	const articleNavigation = resolveArticleNavigation(page.contentSections?.block_editorialContentSections);

	const breadcrumbs = [
		{ href: '/blog', label: 'Blog' },
		{ href: `/blog/${category}`, label: category },
		{ href: `/blog/${category}/${slug}`, label: page.editorialOverview?.field_editorialTitle ?? '' },
	];

	return (
		<>
			<BlogArticleHero
				title={page.editorialOverview?.field_editorialTitle}
				tagline={page.editorialContentTags?.category?.tagOverview?.field_name}
				author={{
					name: page.editorialOverview?.ref_author?.personOverview?.field_personName,
					image: page.editorialOverview?.ref_author?.personOverview?.img_profilePicture as unknown as SanityImage,
					meta: [page.editorialOverview?.ref_author?.personOverview?.field_jobTitleOrRole],
				}}
				image={page.editorialAssets?.img_featuredImage as unknown as SanityImage}
				breadcrumbs={breadcrumbs}
			/>
			<EditorialLayout
				navigation={articleNavigation}
				stickyRelatedArticle={
					page.relatedArticles?.ref_stickyRelatedArticle?.href &&
					page.relatedArticles?.ref_stickyRelatedArticle.editorialOverview?.field_editorialTitle
						? {
								title: page.relatedArticles.ref_stickyRelatedArticle.editorialOverview?.field_editorialTitle,
								image: page.relatedArticles.ref_stickyRelatedArticle.editorialAssets?.img_featuredImage as unknown as SanityImage,
								buttons: [
									{
										label: 'Read More',
										href: page.relatedArticles.ref_stickyRelatedArticle?.href,
										buttonType: 'internal',
									},
								],
							}
						: undefined
				}
			>
				<RichTextContentSections contentSections={page.contentSections?.block_editorialContentSections} />
				<div className='flex flex-col gap-12 pt-12'>
					<BlogArticleTags tags={resolveEditorialContentTags(page.editorialContentTags)} />
					<Author
						name={page.editorialOverview?.ref_author?.personOverview?.field_personName}
						image={page.editorialOverview?.ref_author?.personOverview?.img_profilePicture as unknown as SanityImage}
						meta={[page.editorialOverview?.ref_author?.personOverview?.field_jobTitleOrRole]}
					/>
				</div>
			</EditorialLayout>
		</>
	);
}

export async function generateMetadata(props: Params, parent: ResolvingMetadata): Promise<Metadata> {
	const slug = (await props.params)['article'];
	const category = (await parent)['category'];

	const parentMetadata = await parent;
	const page = await sanityFetch({
		query: articleQuery,
		params: {
			slug: slug,
			category: category,
		},
	});

	return StructureMetaData(parentMetadata, {
		name: page?.editorialOverview?.field_editorialTitle,
		seo: page?.seo ?? undefined,
		url: page?.href ?? undefined,
	});
}
