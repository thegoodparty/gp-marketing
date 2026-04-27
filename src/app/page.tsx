import type { ResolvingMetadata } from 'next';
import type { Params } from '~/lib/types';
import { Suspense } from 'react';
import { PageSections, type Sections } from '~/PageSections';
import { sanityFetch } from '~/sanity/sanityClient';
import { goodpartyOrg_homeQuery, experiment_variantsByExperimentIdQuery } from '~/sanity/groq';
import { notFound } from 'next/navigation';
import { StructureMetaData } from '~/components/StructureMetadata';
import { resolveVariant } from '~/lib/experimentServer';
import { ExperimentExposureTracker } from '~/experiments/ExperimentExposureTracker';

const EXPERIMENT_FLAG_KEY = 'home_claude_layout_test';

export default async function Page() {
	const page = await sanityFetch({ query: goodpartyOrg_homeQuery, tags: ['goodpartyOrg_home'] });

	if (!page) {
		notFound();
	}

	const controlSections = page.pageSections?.list_pageSections;

	return (
		<Suspense fallback={<PageSections pageSections={controlSections} />}>
			<ExperimentResolver flagKey={EXPERIMENT_FLAG_KEY} controlSections={controlSections} />
		</Suspense>
	);
}

async function ExperimentResolver(props: {
	flagKey: string;
	controlSections?: Sections[] | null;
}) {
	const variant = await resolveVariant(props.flagKey);

	if (!variant || variant === 'control' || variant === 'off') {
		return <PageSections pageSections={props.controlSections} />;
	}

	const variantDocs = await sanityFetch({
		query: experiment_variantsByExperimentIdQuery,
		params: { experimentId: props.flagKey },
		tags: ['experiment_variant'],
	});

	const match = variantDocs?.find((d) => d.field_variantName === variant);

	if (!match) {
		return <PageSections pageSections={props.controlSections} />;
	}

	return (
		<>
			<ExperimentExposureTracker flagKey={props.flagKey} variant={variant} />
			<PageSections pageSections={match.pageSections?.list_pageSections} />
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
