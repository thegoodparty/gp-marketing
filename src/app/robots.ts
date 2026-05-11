import type { MetadataRoute } from 'next';
import { getBaseUrl } from '~/lib/url';

function hostnameLooksLikePreview(host: string): boolean {
	return /\.vercel\.app$/i.test(host);
}

export default function robots(): MetadataRoute.Robots {
	const baseUrl = getBaseUrl();
	let host = '';
	try {
		host = new URL(baseUrl).hostname;
	} catch {
		host = '';
	}

	const isPreviewLike =
		process.env['VERCEL_ENV'] === 'preview' ||
		hostnameLooksLikePreview(host) ||
		baseUrl.includes('staging') ||
		baseUrl.includes('e6.digital');

	if (isPreviewLike) {
		return {
			rules: [
				{
					userAgent: '*',
					disallow: ['/'],
				},
			],
		};
	}

	return {
		rules: [
			{
				userAgent: 'Googlebot',
				allow: ['/'],
				disallow: ['/api', '/admin/*'],
			},
			{
				userAgent: '*',
				allow: ['/'],
				disallow: ['/api', '/admin/*'],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
