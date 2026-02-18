import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { goodpartyOrg_embedPageQuery } from '~/sanity/groq';
import { sanityFetch } from '~/sanity/sanityClient';
import { StructureMetaData } from '~/components/StructureMetadata';
import type { Params } from '~/lib/types';
import { client } from '~/lib/client';

export async function generateStaticParams() {
	const entries = await client.fetch<Array<{ slug: string | null }>>(
		'*[_type=="goodpartyOrg_embedPage"][0..99]{"slug":embedPageOverview.field_slug}',
	);
	return entries
		.filter((entry): entry is { slug: string } => Boolean(entry.slug))
		.map((entry) => ({
			slug: entry.slug,
		}));
}

export default async function Page(props: { params: Promise<{ slug: string }> }) {
	const slug = (await props.params)['slug'];

	const page = await sanityFetch({
		query: goodpartyOrg_embedPageQuery,
		params: { slug },
	});

	if (!page || page._type !== 'goodpartyOrg_embedPage') {
		notFound();
	}

	const overview = page.embedPageOverview;
	const embedUrl = overview?.field_embedUrl;
	const allowFullscreen = overview?.field_allowFullscreen ?? true;
	const title = overview?.field_pageName ?? 'Embed';

	if (!embedUrl) {
		notFound();
	}

	return (
		<div className="relative min-h-screen w-full">
			<div className="fixed inset-0 z-[999998] flex items-center justify-center bg-goodparty-cream">
				<div className="h-8 w-8 border-2 border-goodparty-midnight border-t-transparent rounded-full animate-spin" />
			</div>
			<iframe
				src={embedUrl}
				title={title}
				allow={allowFullscreen ? 'fullscreen' : ''}
				sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
				className="fixed inset-0 z-[999999] h-full w-full border-0"
			/>
		</div>
	);
}

export async function generateMetadata(
	props: Params,
	parent: ResolvingMetadata,
): Promise<Metadata> {
	const slug = (await props.params)['slug'];
	const parentMetadata = await parent;

	const page = await sanityFetch({
		query: goodpartyOrg_embedPageQuery,
		params: { slug },
	});

	if (!page || page._type !== 'goodpartyOrg_embedPage') {
		return {};
	}

	return StructureMetaData(parentMetadata, {
		name: page.embedPageOverview?.field_pageName,
		seo: page.seo,
		url: page.href ?? undefined,
	});
}
