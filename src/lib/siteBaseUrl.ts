/**
 * Public site base URL only (canonical, sitemap, OG). No Sanity/env image deps so
 * Sanity Studio and root-level modules can import this without Vite alias issues.
 */

const PRODUCTION_HOST = 'https://goodparty.org';

export const SITE_NAME = 'GoodParty.org';

function sanitizeSiteUrl(value: string | undefined): string | undefined {
	if (value == null || typeof value !== 'string') return undefined;
	const cleaned = value.replace(/[\s\r\n]+/g, '').replace(/\/$/, '');
	if (!cleaned) return undefined;
	return cleaned.startsWith('http') ? cleaned : `https://${cleaned}`;
}

/**
 * Returns the absolute base URL for the site.
 * Checks NEXT_PUBLIC_APP_BASE first (CLI override), then NEXT_PUBLIC_SITE_URL.
 * Production never uses a *.vercel.app host; preview uses VERCEL_URL.
 */
export function getBaseUrl(): string {
	const explicit =
		sanitizeSiteUrl(process.env['NEXT_PUBLIC_APP_BASE']) ?? sanitizeSiteUrl(process.env['NEXT_PUBLIC_SITE_URL']);

	const isProd =
		process.env['VERCEL_ENV'] === 'production' ||
		(process.env['NODE_ENV'] === 'production' && !process.env['VERCEL_ENV']);

	if (isProd) {
		if (explicit) {
			try {
				if (!/\.vercel\.app$/i.test(new URL(explicit).hostname)) return explicit;
			} catch {
				/* fall through to PRODUCTION_HOST */
			}
		}
		return PRODUCTION_HOST;
	}

	if (explicit) return explicit;
	if (process.env['VERCEL_ENV'] === 'preview' && process.env['VERCEL_URL']) {
		return `https://${process.env['VERCEL_URL']}`;
	}
	return PRODUCTION_HOST;
}
