import type { Metadata, ResolvingMetadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { stegaClean } from 'next-sanity';
import { format, parseISO } from 'date-fns';
import { goodpartyOrg_landingPagesAndPolicyQuery } from '~/sanity/groq';
import { sanityFetch } from '~/sanity/sanityClient';

import { StructureMetaData } from '~/components/StructureMetadata';
import type { Params } from '~/lib/types';
import { RichTextContentSections } from '~/RichTextContentSections';
import { PageSections } from '~/PageSections';
import { ExperimentResolver } from '~/experiments/ExperimentResolver';
import { HeaderBlock } from '~/ui/HeaderBlock';
import { Container } from '~/ui/Container';
import { PageSchema } from '~/ui/PageSchema';
import { buildWebPageSchema } from '~/lib/schema';
import { toAbsoluteUrl } from '~/lib/url';
import { SANITY_DOC_TYPE } from '~/lib/sanity-doc-types';

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

	if (!page || !(page._type === SANITY_DOC_TYPE.LANDING_PAGE || page._type === SANITY_DOC_TYPE.POLICY)) {
		notFound();
	}

	const pageUrl = page.href ? toAbsoluteUrl(page.href) : toAbsoluteUrl(`/${slug}`);
	const seoDescription = page.seo?.field_metaDescription
		? stegaClean(page.seo.field_metaDescription)
		: undefined;

	if (page._type === SANITY_DOC_TYPE.LANDING_PAGE) {
		const controlSections = page.pageSections?.list_pageSections;
		const landingName = page.detailPageOverviewNoHero?.field_pageName
			? stegaClean(page.detailPageOverviewNoHero.field_pageName)
			: slug;
		const landingSchema = buildWebPageSchema({
			url: pageUrl,
			name: landingName,
			description: seoDescription,
		});
		return (
			<>
				<PageSchema schema={landingSchema} />
				<Suspense fallback={<PageSections pageSections={controlSections} pageSlug={slug} />}>
					<ExperimentResolver pageId={page._id} controlSections={controlSections} pageSlug={slug} />
				</Suspense>
			</>
		);
	}
	if (page._type === SANITY_DOC_TYPE.POLICY) {
		const policyName = page.policyOverview?.field_policyName
			? stegaClean(page.policyOverview.field_policyName)
			: slug;
		const policySummary = page.policyOverview?.field_policySummary
			? stegaClean(page.policyOverview.field_policySummary)
			: undefined;
		const lastUpdated = page.policyOverview?.field_lastUpdated
			? parseISO(stegaClean(page.policyOverview.field_lastUpdated)).toISOString()
			: undefined;
		const policySchema = buildWebPageSchema({
			url: pageUrl,
			name: policyName,
			description: policySummary ?? seoDescription,
			dateModified: lastUpdated,
		});
		return (
			<>
				<PageSchema schema={policySchema} />
				<Container className='bg-goodparty-cream py-(--container-padding) flex flex-col gap-12' size='xl'>
				<HeaderBlock
					title={page.policyOverview?.field_policyName}
					copy={`${page.policyOverview?.field_policySummary ?? ''}${
						page.policyOverview?.field_lastUpdated
							? ` | ${format(parseISO(stegaClean(page.policyOverview.field_lastUpdated)), 'MMM d, yyyy')}`
							: ''
					}`}
				/>
					<RichTextContentSections contentSections={page.policySections?.block_policyText} />
				</Container>
			</>
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

	if (page?._type === SANITY_DOC_TYPE.LANDING_PAGE) {
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
