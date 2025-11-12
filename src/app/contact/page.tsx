import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';

import { goodpartyOrg_contactQuery } from '~/sanity/groq';
import { sanityFetch } from '~/sanity/sanityClient';

import { StructureMetaData } from '~/components/StructureMetadata';

import { HeaderBlock } from '~/ui/HeaderBlock';
import { Container } from '~/ui/Container';

import { PageSections } from '~/PageSections';

export default async function Page() {
	const page = await sanityFetch({
		query: goodpartyOrg_contactQuery,
	});

	if (!page) {
		notFound();
	}
	return (
		<div className='bg-goodparty-cream'>
			<Container size='xl' className='py-(--container-padding) grid md:grid-cols-2'>
				<HeaderBlock
					title={page['contactPageOverview']?.field_pageTitle}
					copy={page['contactPageOverview']?.field_summaryDescription}
					layout='left'
				/>
				{/* Contact form goes here */}
			</Container>
			<PageSections pageSections={page.pageSections?.list_pageSections} />
		</div>
	);
}

export async function generateMetadata(parent: ResolvingMetadata): Promise<Metadata> {
	const parentMetadata = await parent;
	const page = await sanityFetch({
		query: goodpartyOrg_contactQuery,
	});

	return StructureMetaData(parentMetadata, {
		name: page?.contactPageOverview?.field_pageTitle,
		seo: page?.seo,
		url: page?.href ?? undefined,
	});
}
