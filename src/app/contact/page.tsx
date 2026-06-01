import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { stegaClean } from 'next-sanity';

import { goodpartyOrg_contactQuery } from '~/sanity/groq';
import { sanityFetch } from '~/sanity/sanityClient';

import { StructureMetaData } from '~/components/StructureMetadata';

import { HeaderBlock } from '~/ui/HeaderBlock';
import { Container } from '~/ui/Container';

import { PageSections } from '~/PageSections';
import { PageSchema } from '~/ui/PageSchema';
import { buildWebPageSchema } from '~/lib/schema';
import { toAbsoluteUrl } from '~/lib/url';

export default async function Page() {
	const page = await sanityFetch({
		query: goodpartyOrg_contactQuery,
		tags: ['goodpartyOrg_contact'],
	});

	if (!page) {
		notFound();
	}

	const contactUrl = page.href ? toAbsoluteUrl(page.href) : toAbsoluteUrl('/contact');
	const contactName = page['contactPageOverview']?.field_pageTitle
		? stegaClean(page['contactPageOverview'].field_pageTitle)
		: 'Contact';
	const contactDescription = page.seo?.field_metaDescription
		? stegaClean(page.seo.field_metaDescription)
		: page['contactPageOverview']?.field_summaryDescription
			? stegaClean(page['contactPageOverview'].field_summaryDescription)
			: undefined;
	const contactSchema = buildWebPageSchema({
		url: contactUrl,
		name: contactName,
		description: contactDescription,
		pageType: 'ContactPage',
	});

	return (
		<div className='bg-goodparty-cream'>
			<PageSchema schema={contactSchema} />
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
		tags: ['goodpartyOrg_contact'],
	});

	return StructureMetaData(parentMetadata, {
		name: page?.contactPageOverview?.field_pageTitle,
		seo: page?.seo,
		url: page?.href ?? undefined,
	});
}
