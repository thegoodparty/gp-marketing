import type { ResolvingMetadata } from 'next';
import type { Params } from '~/lib/types';
import { stegaClean } from 'next-sanity';
import { sanityFetch } from '~/sanity/sanityClient';
import { goodpartyOrg_homeQuery } from '~/sanity/groq';
import { notFound } from 'next/navigation';
import { StructureMetaData } from '~/components/StructureMetadata';
import { ExperimentResolver } from '~/experiments/ExperimentResolver';
import { PageSchema } from '~/ui/PageSchema';
import {
	buildSchemaGraph,
	buildSoftwareApplicationSchema,
	buildWebPageSchema,
} from '~/lib/schema';
import { getBaseUrl } from '~/lib/url';

// SSR per request so ExperimentResolver reads the visitor's AMP_* cookie and resolves the variant
// on the server. Without the Suspense boundary the cookie read no longer sits behind a streamed
// hole, so the route has to opt out of static generation explicitly, as `/[slug]` already does.
export const dynamic = 'force-dynamic';

export default async function Page() {
	const page = await sanityFetch({ query: goodpartyOrg_homeQuery, tags: ['goodpartyOrg_home'] });

	if (!page) {
		notFound();
	}

	const controlSections = page.pageSections?.list_pageSections;

	const baseUrl = getBaseUrl();
	const homeDescription = page.seo?.field_metaDescription
		? stegaClean(page.seo.field_metaDescription)
		: 'GoodParty.org empowers independent candidates to run, win and serve. Access campaign tools, voter data, and support to level the playing field without deep pockets.';
	const homeName = page.singlePageOverviewNoHero?.field_pageName
		? stegaClean(page.singlePageOverviewNoHero.field_pageName)
		: 'GoodParty.org';

	const homeSchema = buildSchemaGraph([
		buildWebPageSchema({
			url: baseUrl,
			name: homeName,
			description: homeDescription,
		}),
		buildSoftwareApplicationSchema({
			baseUrl,
			description: homeDescription,
		}),
	]);

	return (
		<>
			<PageSchema schema={homeSchema ?? undefined} />
			{/* Awaited inline, not wrapped in Suspense: a fallback that renders the control sections would put a
			    second copy of the whole page (and a second <h1>) into the streamed HTML. */}
			<ExperimentResolver pageId={page._id} controlSections={controlSections} />
		</>
	);
}

export async function generateMetadata(_props: Params, parent: ResolvingMetadata) {
	const parentMetadata = await parent;
	const page = await sanityFetch({ query: goodpartyOrg_homeQuery, tags: ['goodpartyOrg_home'] });

	return StructureMetaData(parentMetadata, {
		name: page?.singlePageOverviewNoHero?.field_pageName,
		seo: page?.seo,
		url: page?.href,
	});
}
