import type { MetadataRoute } from 'next';
import { getBaseUrl } from '~/lib/url';

export default function robots(): MetadataRoute.Robots {
	const baseUrl = getBaseUrl();
	const isStaging = baseUrl.includes('staging') || baseUrl.includes('e6.digital');

	if (isStaging) {
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
			},
			{
				userAgent: ['*'],
				allow: ['/'],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
