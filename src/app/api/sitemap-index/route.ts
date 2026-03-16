/**
 * Sitemap index workaround for Next.js generateSitemaps bug (no root /sitemap.xml).
 * Serves the sitemap index that lists all child sitemaps. Rewrite in next.config maps /sitemap.xml here.
 */

import { NextResponse } from 'next/server';
import { getBaseUrl } from '~/lib/url';
import { US_STATE_CODES } from '~/lib/sitemap-entries';

const XMLNS = 'http://www.sitemaps.org/schemas/sitemap/0.9';

function escapeXml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export function GET() {
	const base = getBaseUrl();
	const lastmod = new Date().toISOString().slice(0, 10);

	const entries: { loc: string; lastmod: string }[] = [{ loc: `${base}/sitemap/0.xml`, lastmod }];
	for (let i = 0; i < US_STATE_CODES.length; i++) {
		entries.push({ loc: `${base}/sitemap/${i + 1}.xml`, lastmod });
		entries.push({ loc: `${base}/sitemap/${i + 1 + US_STATE_CODES.length}.xml`, lastmod });
	}

	const sitemapBlocks = entries.map(
		(e) =>
			`  <sitemap>
    <loc>${escapeXml(e.loc)}</loc>
    <lastmod>${escapeXml(e.lastmod)}</lastmod>
  </sitemap>`,
	);

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="${XMLNS}">
${sitemapBlocks.join('\n')}
</sitemapindex>
`;

	return new NextResponse(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600, s-maxage=3600',
		},
	});
}
