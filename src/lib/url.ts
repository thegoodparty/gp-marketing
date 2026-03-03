import { dataset, projectId } from '~/lib/env';

/** Default share image for Open Graph, Twitter, and schema when no page-specific image is set */
export const DEFAULT_SHARE_IMAGE = 'https://assets.goodparty.org/gp-share-2025.png';

/**
 * Returns the absolute base URL for the site.
 * Used for canonical URLs, sitemap, Open Graph, and schema.org.
 */
export function getBaseUrl(): string {
	const site = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;
	if (site) {
		const url = site.startsWith('http') ? site : `https://${site}`;
		return url.replace(/\/$/, '');
	}
	return 'https://goodparty.org';
}

/**
 * Converts a path to an absolute URL using the site base. Pass-through for already-absolute URLs.
 */
export function toAbsoluteUrl(path: string): string {
	if (path.startsWith('http')) return path;
	const base = getBaseUrl();
	return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Parses a Sanity image _ref and returns CDN URL + parsed parts, or undefined if invalid.
 * Shared by getSanityImageUrl and ResponsiveImage.
 */
export function parseSanityImageRef(ref: string): { url: string; id: string; dimensions: string; ext: string } | undefined {
	let r = ref.startsWith('image-') ? ref.replace('image-', '') : ref;
	const [id, dimensions, ext] = r.split('-');
	if (!id || !dimensions || !ext) return undefined;
	return {
		url: `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${ext}`,
		id,
		dimensions,
		ext,
	};
}

/**
 * Returns absolute URL for a Sanity image asset, or undefined if invalid.
 */
export function getSanityImageUrl(image: { asset?: { _ref?: string; url?: string } } | null | undefined): string | undefined {
	if (!image?.asset) return undefined;
	const asset = image.asset;
	if (typeof asset.url === 'string' && asset.url.startsWith('http')) return asset.url;
	if (typeof asset._ref === 'string') {
		const parsed = parseSanityImageRef(asset._ref);
		return parsed?.url;
	}
	return undefined;
}
