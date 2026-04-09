import type { Metadata, ResolvedMetadata } from 'next';
import type { Robots } from 'next/dist/lib/metadata/types/metadata-types';
import type { Group_seo } from 'sanity.types';
import { DEFAULT_SHARE_IMAGE, getBaseUrl, toAbsoluteUrl } from '~/lib/url';

function metaString(value: unknown): string | undefined {
	if (typeof value === 'string') return value;
	if (typeof value === 'number' && Number.isFinite(value)) return String(value);
	return undefined;
}

export async function StructureMetaData(parentMetadata: ResolvedMetadata, page?: { name?: string; seo?: Group_seo; url?: string } | null) {
	const metaTitle = metaString(page?.seo?.field_metaTitle) ?? metaString(page?.name);
	const metaDescription =
		metaString(page?.seo?.field_metaDescription) ?? metaString(parentMetadata.description);
	const ogImage = page?.seo?.img_openGraphImage ?? undefined;

	const robots = parentMetadata.robots as Robots;

	const absoluteUrl = page?.url ? toAbsoluteUrl(page.url) : getBaseUrl();
	const ogImages = [ogImage, ...(parentMetadata.openGraph?.images || [])]
		.filter((x): x is string => typeof x === 'string')
		.map(img => (img.startsWith('http') ? img : toAbsoluteUrl(img)));
	const images = ogImages.length > 0 ? ogImages : [DEFAULT_SHARE_IMAGE];

	return {
		title: metaTitle,
		description: metaDescription,
		openGraph: {
			...(parentMetadata.openGraph as Metadata['openGraph']),
			title: metaTitle,
			images,
			url: absoluteUrl,
		},
		twitter: {
			card: 'summary_large_image',
			title: metaTitle,
			description: metaDescription,
			images,
		},
		alternates: {
			canonical: absoluteUrl,
		},
		robots,
	} satisfies Metadata;
}
