import type { Metadata, ResolvedMetadata } from 'next';
import type { Robots } from 'next/dist/lib/metadata/types/metadata-types';
import type { Group_seo } from 'sanity.types';
import { getBaseUrl } from '~/lib/url';

function toAbsoluteUrl(path: string): string {
	if (path.startsWith('http')) return path;
	const base = getBaseUrl();
	return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function StructureMetaData(parentMetadata: ResolvedMetadata, page?: { name?: string; seo?: Group_seo; url?: string } | null) {
	const metaTitle = page?.seo?.field_metaTitle || page?.name;
	const metaDescription = page?.seo?.field_metaDescription || parentMetadata.description;
	const ogImage = page?.seo?.img_openGraphImage ?? undefined;

	const robots = parentMetadata.robots as Robots;

	const absoluteUrl = page?.url ? toAbsoluteUrl(page.url) : undefined;
	const ogImages = [ogImage, ...(parentMetadata.openGraph?.images || [])]
		.filter((x): x is string => typeof x === 'string')
		.map(img => (img.startsWith('http') ? img : toAbsoluteUrl(img)));

	return {
		title: metaTitle,
		description: metaDescription,
		openGraph: {
			...(parentMetadata.openGraph as Metadata['openGraph']),
			title: metaTitle,
			images: ogImages.length > 0 ? ogImages : undefined,
			url: absoluteUrl,
		},
		twitter: {
			card: 'summary_large_image',
			title: metaTitle,
			description: metaDescription,
			images: ogImages.length > 0 ? ogImages : undefined,
		},
		alternates: {
			canonical: absoluteUrl,
		},
		robots,
	} satisfies Metadata;
}
