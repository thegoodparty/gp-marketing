import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { PageSections } from '~/PageSections';
import { sanityFetch } from '~/sanity/sanityClient';
import { goodpartyOrg_candidatesQuery } from '~/sanity/groq';
import { StructureMetaData } from '~/components/StructureMetadata';

export default async function Page() {
	const page = await sanityFetch({ query: goodpartyOrg_candidatesQuery, tags: ['goodpartyOrg_landingPages'] });

	if (!page) {
		notFound();
	}

	return <PageSections pageSections={page.pageSections?.list_pageSections} />;
}

export async function generateMetadata(
	parent: ResolvingMetadata,
): Promise<Metadata> {
	const parentMetadata = await parent;
	const page = await sanityFetch({ query: goodpartyOrg_candidatesQuery, tags: ['goodpartyOrg_landingPages'] });

	return StructureMetaData(parentMetadata, {
		name: page?.detailPageOverviewNoHero?.field_pageName,
		seo: page?.seo,
		url: page?.href ?? undefined,
	});
}
