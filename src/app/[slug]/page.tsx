import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { goodpartyOrg_landingPagesAndPolicyQuery } from '~/sanity/groq';
import { sanityFetch } from '~/sanity/sanityClient';

import { StructureMetaData } from '~/components/StructureMetadata';
import type { Params } from '~/lib/types';
import { RichTextContentSections } from '~/RichTextContentSections';
import { PageSections } from '~/PageSections';
import { HeaderBlock } from '~/ui/HeaderBlock';
import { Container } from '~/ui/Container';
import { client } from '~/lib/client';

export async function generateStaticParams() {
	const entries = await client.fetch<Array<string>>(
		'*[_type in ["goodpartyOrg_landingPages","policy"]][0..99]{"slug": select(_type == "goodpartyOrg_landingPages" => detailPageOverviewNoHero.field_slug,_type == "policy" => policyOverview.field_slug)}.slug',
	);
	return entries.map(entry => ({
		slug: entry,
	}));
}
export default async function Page(props: any) {
	const slug = (await props.params)['slug'];

	const page = await sanityFetch({
		query: goodpartyOrg_landingPagesAndPolicyQuery,
		params: {
			slug,
		},
	});

	if (!page || !(page._type === 'goodpartyOrg_landingPages' || page._type === 'policy')) {
		notFound();
	}

	if (page._type === 'goodpartyOrg_landingPages') {
		return <PageSections pageSections={page.pageSections?.list_pageSections} />;
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
