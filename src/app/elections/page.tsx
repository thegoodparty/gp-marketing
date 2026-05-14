import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { stegaClean } from 'next-sanity';
import { PageSections } from '~/PageSections';
import { sanityFetch } from '~/sanity/sanityClient';
import { goodpartyOrg_electionsQuery } from '~/sanity/groq';
import { StructureMetaData } from '~/components/StructureMetadata';
import { PageSchema } from '~/ui/PageSchema';
import { buildBreadcrumbSchema, buildSchemaGraph, buildWebPageSchema } from '~/lib/schema';
import { toAbsoluteUrl } from '~/lib/url';

export default async function Page() {
	const page = await sanityFetch({ query: goodpartyOrg_electionsQuery, tags: ['goodpartyOrg_landingPages'] });

	if (!page) {
		notFound();
	}

	const electionsUrl = page.href ? toAbsoluteUrl(page.href) : toAbsoluteUrl('/elections');
	const electionsName = page.detailPageOverviewNoHero?.field_pageName
		? stegaClean(page.detailPageOverviewNoHero.field_pageName)
		: 'Elections';
	const electionsDescription = page.seo?.field_metaDescription
		? stegaClean(page.seo.field_metaDescription)
		: undefined;
	const electionsGraph = buildSchemaGraph([
		buildWebPageSchema({
			url: electionsUrl,
			name: electionsName,
			description: electionsDescription,
			pageType: 'CollectionPage',
		}),
		buildBreadcrumbSchema([{ href: '/elections', label: electionsName }]),
	]);

	return (
		<>
			<PageSchema schema={electionsGraph ?? undefined} />
			<PageSections pageSections={page.pageSections?.list_pageSections} />
		</>
	);
}

export async function generateMetadata(parent: ResolvingMetadata): Promise<Metadata> {
	const parentMetadata = await parent;
	const page = await sanityFetch({ query: goodpartyOrg_electionsQuery, tags: ['goodpartyOrg_landingPages'] });

	return StructureMetaData(parentMetadata, {
		name: page?.detailPageOverviewNoHero?.field_pageName,
		seo: page?.seo,
		url: page?.href ?? undefined,
	});
}
