import type { Metadata, ResolvedMetadata } from 'next';
import type { Robots } from 'next/dist/lib/metadata/types/metadata-types';
import type { Group_seo } from 'sanity.types';

export async function StructureMetaData(parentMetadata: ResolvedMetadata, page?: { name?: string; seo?: Group_seo; url?: string } | null) {
	const metaTitle = page?.seo?.field_metaTitle || page?.name;
	const metaDescription = page?.seo?.field_metaDescription || parentMetadata.description;
	const ogImage = page?.seo?.img_openGraphImage ?? undefined;

	const robots = parentMetadata.robots as Robots;

	return {
		title: metaTitle,
		description: metaDescription,
		openGraph: {
			...(parentMetadata.openGraph as Metadata['openGraph']),
			title: metaTitle,
			images: [ogImage, ...(parentMetadata.openGraph?.images || [])].filter(x => typeof x === 'string'),
			url: page?.url,
		},
		alternates: {
			canonical: page?.url,
		},
		robots,
	} satisfies Metadata;
}
