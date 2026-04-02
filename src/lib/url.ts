import { dataset, projectId } from '~/lib/env';

/** Default share image for Open Graph, Twitter, and schema when no page-specific image is set */
export const DEFAULT_SHARE_IMAGE = 'https://assets.goodparty.org/gp-share-2025.png';

/**
 * Returns the absolute base URL for the site.
 * Used for canonical URLs, sitemap, Open Graph, and schema.org.
 * Checks NEXT_PUBLIC_APP_BASE first (CLI override), then NEXT_PUBLIC_SITE_URL.
 * Production falls back to goodparty.org; VERCEL_URL is used for preview deployments.
 */
export function getBaseUrl(): string {
	const explicit = process.env['NEXT_PUBLIC_APP_BASE'] ?? process.env['NEXT_PUBLIC_SITE_URL'];
	if (explicit && typeof explicit === 'string') {
		const trimmed = explicit.trim().replace(/\/$/, '');
		return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
	}
	if (process.env['VERCEL_ENV'] === 'preview' && process.env['VERCEL_URL']) {
		return `https://${process.env['VERCEL_URL']}`;
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
