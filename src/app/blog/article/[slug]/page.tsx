import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';

import { articleQuery } from '~/sanity/groq';
import { sanityFetch } from '~/sanity/sanityClient';

import { StructureMetaData } from '~/components/StructureMetadata';

import type { Params } from '~/lib/types';

import { BlogArticleHero } from '~/ui/BlogArticleHero';
import type { SanityImage } from '~/ui/types';

import { RichTextContentSections } from '~/RichTextContentSections';
import { TypographyStackSpacing } from '~/types/ui';
import { BlogArticleTags } from '~/ui/BlogArticleTags';
import { resolveEditorialContentTags } from '~/ui/_lib/resolveEditorialContentTags';
import { EditorialLayout } from '~/components/EditorialLayout';
import { resolveArticleNavigation } from '~/lib/resolveArticleNavigation';
import { Author } from '~/ui/Author';
import { client } from '~/lib/client';
import { format, parseISO } from 'date-fns';
import { stegaClean } from 'next-sanity';
import { PageSchema } from '~/ui/PageSchema';
import { DEFAULT_SHARE_IMAGE, getBaseUrl, getSanityImageUrl, toAbsoluteUrl } from '~/lib/url';
import {
	buildArticleSchema,
	buildBreadcrumbSchema,
	buildFAQSchema,
	buildSchemaGraph,
	buildWebPageSchema,
} from '~/lib/schema';
import { resolveFAQItemsAsText } from '~/lib/resolveFAQItemsAsText';
import { BlogBlock } from '~/ui/BlogBlock';
import type { BlogCardProps } from '~/ui/BlogCard';
import { resolveBlogCard } from '~/ui/_lib/resolveBlogCard';
import { resolveStickySidebarCta } from '~/ui/_lib/resolveStickySidebarCta';

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

	const headline = page.editorialOverview?.field_editorialTitle
		? stegaClean(page.editorialOverview.field_editorialTitle)
		: '';
	const metaDescription = page.seo?.field_metaDescription ? stegaClean(page.seo.field_metaDescription) : undefined;
	const authorName = page.editorialOverview?.ref_author?.personOverview?.field_personName
		? stegaClean(page.editorialOverview.ref_author.personOverview.field_personName)
		: undefined;
	const authorJobTitle = page.editorialOverview?.ref_author?.personOverview?.field_jobTitleOrRole
		? stegaClean(page.editorialOverview.ref_author.personOverview.field_jobTitleOrRole)
		: undefined;

	const articleSchema = buildArticleSchema({
		url: articleUrl,
		headline,
		description: metaDescription,
		image: imageUrl,
		datePublished: publishedDate ? parseISO(stegaClean(publishedDate)).toISOString() : undefined,
		dateModified: updatedDate ? parseISO(stegaClean(updatedDate)).toISOString() : undefined,
		authorName,
		authorJobTitle,
		pageType: 'BlogPosting',
	});

	const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, toAbsoluteUrl);

	const inlineFaqItems = ((page.contentSections?.block_editorialContentSections ?? []) as ReadonlyArray<
		{ _type?: string | undefined }
	>)
		.filter(section => section?._type === 'faqs')
		.flatMap(section =>
			resolveFAQItemsAsText(
				((section as { list_faQs?: unknown }).list_faQs ?? null) as Parameters<typeof resolveFAQItemsAsText>[0],
			),
		);
	const faqSchema = buildFAQSchema(inlineFaqItems);

	const articleGraph = buildSchemaGraph([
		articleSchema,
		breadcrumbSchema,
		faqSchema,
		buildWebPageSchema({
			url: articleUrl,
			name: headline || 'Article',
			description: metaDescription,
			image: imageUrl,
		}),
	]);

	const relatedArticles = (page.relatedArticles?.list_relatedArticles ?? [])
		.map(resolveBlogCard)
		.filter((item): item is BlogCardProps => item != null);

	const stickySidebarCta = resolveStickySidebarCta(page.stickySidebarCta);

	return (
		<>
			<PageSchema schema={articleGraph ?? undefined} />
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
									? `Updated: ${format(parseISO(stegaClean(page.editorialOverview?.field_lastUpdated)), 'MMM dd, yyyy')}`
									: page.editorialOverview?.field_publishedDate
										? format(parseISO(stegaClean(page.editorialOverview?.field_publishedDate)), 'MMM dd, yyyy')
										: '',
								]
							: undefined,
				}}
				image={page.editorialAssets?.img_featuredImage as unknown as SanityImage}
				breadcrumbs={breadcrumbs}
			/>
			<EditorialLayout
				navigation={articleNavigation}
				stickySidebarCta={stickySidebarCta}
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
				<RichTextContentSections
					stackSpacing={TypographyStackSpacing.EDITORIAL}
					contentSections={page.contentSections?.block_editorialContentSections}
				/>
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
