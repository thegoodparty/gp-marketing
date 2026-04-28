import type { ResolvingMetadata } from 'next';
import type { Params } from '~/lib/types';
import { Suspense } from 'react';
import { PageSections, type Sections } from '~/PageSections';
import { sanityFetch } from '~/sanity/sanityClient';
import { goodpartyOrg_homeQuery } from '~/sanity/groq';
import { notFound } from 'next/navigation';
import { StructureMetaData } from '~/components/StructureMetadata';
import { ExperimentExposureTracker } from '~/experiments/ExperimentExposureTracker';
import { resolvePageExperiments } from '~/experiments/resolvePageExperiments';

export default async function Page() {
	const page = await sanityFetch({ query: goodpartyOrg_homeQuery, tags: ['goodpartyOrg_home'] });

	if (!page) {
		notFound();
	}

	const controlSections = page.pageSections?.list_pageSections;

	return (
		<Suspense fallback={<PageSections pageSections={controlSections} />}>
			<ExperimentResolver pageId={page._id} controlSections={controlSections} />
		</Suspense>
	);
}

async function ExperimentResolver(props: {
	pageId: string;
	controlSections?: Sections[] | null;
}) {
	const result = await resolvePageExperiments({
		pageId: props.pageId,
		controlSections: props.controlSections,
	});

	return (
		<>
			{result.exposures.map((exp) => (
				<ExperimentExposureTracker key={exp.flagKey} flagKey={exp.flagKey} variant={exp.variant} />
			))}
			<PageSections pageSections={result.pageSections} />
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
