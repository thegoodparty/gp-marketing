import type { ResolvingMetadata } from 'next';
import type { Params } from '~/lib/types';
import { PageSections } from '~/PageSections';
import { sanityFetch } from '~/sanity/sanityClient';
import { goodpartyOrg_homeQuery } from '~/sanity/groq';
import { notFound } from 'next/navigation';
import { StructureMetaData } from '~/components/StructureMetadata';
import { HomepageExperiment } from '~/experiments/homepage/HomepageExperiment';
import { HomepageVariantA } from '~/experiments/homepage/HomepageVariantA';
import { HomepageVariantB } from '~/experiments/homepage/HomepageVariantB';
import { HomepageVariantC } from '~/experiments/homepage/HomepageVariantC';

export default async function Page() {
	const page = await sanityFetch({ query: goodpartyOrg_homeQuery, tags: ['goodpartyOrg_home'] });

	if (!page) {
		notFound();
	}

	return (
		<HomepageExperiment
			control={<PageSections pageSections={page.pageSections?.list_pageSections} />}
			variantA={<HomepageVariantA />}
			variantB={<HomepageVariantB />}
			variantC={<HomepageVariantC />}
		/>
	);
}

export async function generateMetadata(props: Params, parent: ResolvingMetadata) {
	const parentMetadata = await parent;
	const page = await sanityFetch({ query: goodpartyOrg_homeQuery, tags: ['goodpartyOrg_home'] });

	return StructureMetaData(parentMetadata, {
		name: page?.singlePageOverviewNoHero?.field_pageName,
		seo: page?.seo,
		url: page?.href,
	});
}
