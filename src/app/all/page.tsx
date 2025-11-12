import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { goodpartyOrg_allComponentsQuery } from '~/sanity/groq';
import { sanityFetch } from '~/sanity/sanityClient';
import { PageSections } from '~/PageSections';
import { StructureMetaData } from '~/components/StructureMetadata';
import type { Params } from '~/lib/types';

export default async function Page(props: any) {
	const page = await sanityFetch({
		query: goodpartyOrg_allComponentsQuery,
	});
	if (!page) {
		notFound();
	}
	return <PageSections pageSections={page.pageSections?.list_pageSections} />;
}

export async function generateMetadata(props: Params, parent: ResolvingMetadata): Promise<Metadata> {
	const parentMetadata = await parent;
	const page = await sanityFetch({
		query: goodpartyOrg_allComponentsQuery,
	});

	return StructureMetaData(parentMetadata, {
		name: page?.singlePageOverviewNoHero?.field_pageName,
		seo: page?.seo,
		url: page?.href ?? undefined,
	});
}
