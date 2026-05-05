import type { Metadata, ResolvingMetadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { goodpartyOrg_landingPagesAndPolicyQuery } from '~/sanity/groq';
import { sanityFetch } from '~/sanity/sanityClient';

import { StructureMetaData } from '~/components/StructureMetadata';
import type { Params } from '~/lib/types';
import { RichTextContentSections } from '~/RichTextContentSections';
import { PageSections } from '~/PageSections';
import { ExperimentResolver } from '~/experiments/ExperimentResolver';
import { HeaderBlock } from '~/ui/HeaderBlock';
import { Container } from '~/ui/Container';

// SSR per request so ExperimentResolver reads the visitor's AMP_* cookie and
// resolves the variant on the server before HTML is sent (no client flicker).
// `generateStaticParams` is intentionally omitted: it is a build-time API for
// static generation and the Next.js docs only sanction combining it with
// `force-static`. Pairing it with `force-dynamic` is contradictory and causes
// dev/prod render differences. Unknown slugs are handled by `notFound()` below
// and the sitemap enumerates landing pages via `src/lib/sitemap-entries.ts`.
export const dynamic = 'force-dynamic';

export default async function Page(props: any) {
	const slug = (await props.params)['slug'];

	const page = await sanityFetch({
		query: goodpartyOrg_landingPagesAndPolicyQuery,
		params: {
			slug,
		},
		tags: ['goodpartyOrg_landingPages', 'policy'],
	});

	if (!page || !(page._type === 'goodpartyOrg_landingPages' || page._type === 'policy')) {
		notFound();
	}

	if (page._type === 'goodpartyOrg_landingPages') {
		const controlSections = page.pageSections?.list_pageSections;
		return (
			<Suspense fallback={<PageSections pageSections={controlSections} />}>
				<ExperimentResolver pageId={page._id} controlSections={controlSections} />
			</Suspense>
		);
	}
	if (page._type === 'policy') {
		return (
			<Container className='bg-goodparty-cream py-(--container-padding) flex flex-col gap-12' size='xl'>
				<HeaderBlock
					title={page.policyOverview?.field_policyName}
					copy={`${page.policyOverview?.field_policySummary}${page.policyOverview?.field_lastUpdated && ` | ${new Date(page.policyOverview.field_lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}`}
				/>
				<RichTextContentSections contentSections={page.policySections?.block_policyText as any} />
			</Container>
		);
	}
	return null;
}

export async function generateMetadata(props: Params, parent: ResolvingMetadata): Promise<Metadata> {
	const slug = (await props.params)['slug'];

	const parentMetadata = await parent;
	const page = await sanityFetch({
		query: goodpartyOrg_landingPagesAndPolicyQuery,
		params: {
			slug: slug,
		},
		tags: ['goodpartyOrg_landingPages', 'policy'],
	});

	if (page?._type === 'goodpartyOrg_landingPages') {
		return StructureMetaData(parentMetadata, {
			name: page?.detailPageOverviewNoHero?.field_pageName,
			seo: page?.seo,
			url: page?.href ?? undefined,
		});
	}

	return StructureMetaData(parentMetadata, {
		name: page?.policyOverview?.field_policyName,
		seo: page?.seo,
		url: page?.href ?? undefined,
	});
}
