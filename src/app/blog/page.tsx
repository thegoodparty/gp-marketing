import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { goodpartyOrg_allArticlesQuery } from '~/sanity/groq';
import { sanityFetch } from '~/sanity/sanityClient';
import { PageSections } from '~/PageSections';
import { StructureMetaData } from '~/components/StructureMetadata';
import type { Params } from '~/lib/types';
import { getCachedArticles } from '~/lib/getCachedArticles';
import { BlogHero } from '~/ui/BlogHero';

export default async function Page(props: any) {
	const page = await sanityFetch({
		query: goodpartyOrg_allArticlesQuery,
		tags: ['goodpartyOrg_allArticles'],
	});
	if (!page) {
		notFound();
	}

	const { articles } = await getCachedArticles();

	return (
		<>
			<BlogHero
				articles={articles}
				title={page.singlePageOverview?.field_pageTitle ?? page.singlePageOverview?.field_pageName}
				copy={page.singlePageOverview?.field_summaryDescription}
				categories={page.categories?.filter(item => item.title && item.href) as { _id: string; title: string; href: string }[]}
			/>
			<PageSections pageSections={page.pageSections?.list_pageSections} />
		</>
	);
}

export async function generateMetadata(props: Params, parent: ResolvingMetadata): Promise<Metadata> {
	const parentMetadata = await parent;
	const page = await sanityFetch({
		query: goodpartyOrg_allArticlesQuery,
		tags: ['goodpartyOrg_allArticles'],
	});

	return StructureMetaData(parentMetadata, {
		name: page?.singlePageOverview?.field_pageName,
		seo: page?.seo,
		url: page?.href ?? undefined,
	});
}
