import type { MetadataRoute } from 'next';
import { getBaseUrl, isPreviewBaseUrl } from '~/lib/url';

const AI_CRAWLERS = [
	'GPTBot',
	'OAI-SearchBot',
	'ClaudeBot',
	'PerplexityBot',
	'Google-Extended',
	'Applebot-Extended',
] as const;

export default function robots(): MetadataRoute.Robots {
	const baseUrl = getBaseUrl();

	if (isPreviewBaseUrl(baseUrl)) {
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
			...AI_CRAWLERS.map(userAgent => ({
				userAgent,
				allow: ['/'],
				disallow: ['/api', '/admin/*'],
			})),
			{
				userAgent: '*',
				allow: ['/'],
				disallow: ['/api', '/admin/*'],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
