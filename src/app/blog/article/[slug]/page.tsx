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
import { format } from 'date-fns';
import { stegaClean } from 'next-sanity';
import { PageSchema } from '~/ui/PageSchema';
import { DEFAULT_SHARE_IMAGE, getBaseUrl, getSanityImageUrl } from '~/lib/url';
import { BlogBlock } from '~/ui/BlogBlock';
import type { BlogCardProps } from '~/ui/BlogCard';
import { resolveBlogCard } from '~/ui/_lib/resolveBlogCard';

export async function generateStaticParams() {
	const entries = await client.fetch<Array<string>>('*[_type == "article"].editorialOverview.field_slug');
	return entries.filter(Boolean).map((slug) => ({
		slug,
	}));
}

export default async function Page(props: any) {
	const slug = (await props.params)['slug'];

	const page = await sanityFetch({
		query: articleQuery,
		params: {
			slug,
		},
		tags: ['article'],
	});

	if (!page) {
		notFound();
	}

	const articleNavigation = resolveArticleNavigation(page.contentSections?.block_editorialContentSections);

	const breadcrumbs = [
		{ href: '/blog', label: 'Blog' },
		{
			href: `/blog/section/${page.editorialContentTags?.category?.tagOverview?.field_slug}`,
			label: page.editorialContentTags?.category?.tagOverview?.field_name ?? '',
		},
		{ href: `/blog/article/${slug}`, label: page.editorialOverview?.field_editorialTitle ?? '' },
	];

	const baseUrl = getBaseUrl();
	const articleUrl = `${baseUrl}/blog/article/${slug}`;
	const imageUrl =
		getSanityImageUrl(page.editorialAssets?.img_featuredImage as { asset?: { _ref?: string; url?: string } } | undefined) ??
		DEFAULT_SHARE_IMAGE;
	const publishedDate = page.editorialOverview?.field_publishedDate;
	const updatedDate = page.editorialOverview?.field_lastUpdated;

	const articleSchema = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: page.editorialOverview?.field_editorialTitle ? stegaClean(page.editorialOverview.field_editorialTitle) : undefined,
		...(page.editorialOverview?.ref_author?.personOverview?.field_personName && {
			author: {
				'@type': 'Person',
				name: stegaClean(page.editorialOverview.ref_author.personOverview.field_personName),
			},
		}),
		...(publishedDate && { datePublished: new Date(stegaClean(publishedDate)).toISOString() }),
		...(updatedDate && { dateModified: new Date(stegaClean(updatedDate)).toISOString() }),
		image: imageUrl,
		url: articleUrl,
	};

	const relatedArticles = (page.relatedArticles?.list_relatedArticles ?? [])
		.map(resolveBlogCard)
		.filter((item): item is BlogCardProps => item != null);

	return (
		<>
			<PageSchema schema={articleSchema} />
			<BlogArticleHero
				title={page.editorialOverview?.field_editorialTitle}
				tagline={{ label: page.editorialContentTags?.category?.tagOverview?.field_name, href: page.editorialContentTags?.category?.href }}
				author={{
					name: page.editorialOverview?.ref_author?.personOverview?.field_personName,
					image: page.editorialOverview?.ref_author?.personOverview?.img_profilePicture as unknown as SanityImage,
					meta:
						page.editorialOverview?.field_publishedDate || page.editorialOverview?.field_lastUpdated
							? [
									page.editorialOverview?.field_lastUpdated
										? `Updated: ${format(new Date(stegaClean(page.editorialOverview?.field_lastUpdated)), 'MMM dd, yyyy')}`
										: page.editorialOverview?.field_publishedDate
											? format(new Date(stegaClean(page.editorialOverview?.field_publishedDate)), 'MMM dd, yyyy')
											: '',
								]
							: undefined,
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
			{relatedArticles.length > 0 && (
				<BlogBlock header={{ title: 'Related Articles' }} items={relatedArticles} />
			)}
		</>
	);
}

export async function generateMetadata(props: Params, parent: ResolvingMetadata): Promise<Metadata> {
	const slug = (await props.params)['slug'];

	const parentMetadata = await parent;
	const page = await sanityFetch({
		query: articleQuery,
		params: {
			slug: slug,
		},
		tags: ['article'],
	});

	return StructureMetaData(parentMetadata, {
		name: page?.editorialOverview?.field_editorialTitle,
		seo: page?.seo ?? undefined,
		url: page?.href ?? undefined,
	});
}
