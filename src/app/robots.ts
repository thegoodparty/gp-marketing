import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
	const site = String(process.env.NEXT_PUBLIC_SITE_URL) || String(process.env.VERCEL_URL);
	const isStaging = site.includes('staging') || site.includes('e6.digital');

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
		sitemap: `${site}/sitemap.xml`,
	};
}
