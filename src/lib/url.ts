/**
 * Returns the absolute base URL for the site.
 * Used for canonical URLs, sitemap, Open Graph, and schema.org.
 */
export function getBaseUrl(): string {
	const site = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;
	if (site && site !== 'undefined') {
		return site.startsWith('http') ? site : `https://${site}`;
	}
	return 'https://goodparty.org';
}

/**
 * Returns absolute URL for a Sanity image asset, or undefined if invalid.
 */
export function getSanityImageUrl(image: { asset?: { _ref?: string; url?: string } } | null | undefined): string | undefined {
	if (!image?.asset) return undefined;
	const asset = image.asset;
	if (typeof asset.url === 'string' && asset.url.startsWith('http')) return asset.url;
	if (typeof asset._ref === 'string') {
		const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '3rbseux7';
		const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
		let ref = asset._ref;
		if (ref.startsWith('image-')) ref = ref.replace('image-', '');
		const [id, dimensions, ext] = ref.split('-');
		if (!id || !dimensions || !ext) return undefined;
		return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${ext}`;
	}
	return undefined;
}
