import type { ResolvingMetadata } from 'next';
import type { Params } from '~/lib/types';
import { PageSections } from '~/PageSections';
import { sanityFetch } from '~/sanity/sanityClient';
import { goodpartyOrg_homeQuery } from '~/sanity/groq';
import { notFound } from 'next/navigation';
import { StructureMetaData } from '~/components/StructureMetadata';

export default async function Page() {
	const page = await sanityFetch({ query: goodpartyOrg_homeQuery });

	if (!page) {
		notFound();
	}

	return <PageSections pageSections={page.pageSections?.list_pageSections} />;
}

export async function generateMetadata(props: Params, parent: ResolvingMetadata) {
	const parentMetadata = await parent;
	const page = await sanityFetch({ query: goodpartyOrg_homeQuery });

	return StructureMetaData(parentMetadata, {
		name: page?.singlePageOverviewNoHero?.field_pageName,
		seo: page?.seo,
		url: page?.href,
	});
}
