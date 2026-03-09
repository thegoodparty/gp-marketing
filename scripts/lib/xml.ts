/**
 * XML serialization utilities for sitemap generation.
 * Escapes special characters and produces standards-compliant sitemap XML.
 */

export interface SitemapEntry {
	loc: string;
	lastmod: string;
	changefreq: string;
	priority: number;
}

/**
 * Escapes XML special characters in text content.
 */
export function escapeXml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/**
 * Converts sitemap entries to a full sitemap XML document.
 */
export function convertToXML(entries: SitemapEntry[], xmlns = 'http://www.sitemaps.org/schemas/sitemap/0.9'): string {
	const urlBlocks = entries.map(
		(e) =>
			`  <url>
    <loc>${escapeXml(e.loc)}</loc>
    <lastmod>${escapeXml(e.lastmod)}</lastmod>
    <changefreq>${escapeXml(e.changefreq)}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
	);
	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="${xmlns}">
${urlBlocks.join('\n')}
</urlset>
`;
}

export interface SitemapIndexEntry {
	loc: string;
	lastmod: string;
}

/**
 * Generates a sitemap index XML document.
 */
export function generateRootIndex(entries: SitemapIndexEntry[]): string {
	const xmlns = 'http://www.sitemaps.org/schemas/sitemap/0.9';
	const sitemapBlocks = entries.map(
		(e) =>
			`  <sitemap>
    <loc>${escapeXml(e.loc)}</loc>
    <lastmod>${escapeXml(e.lastmod)}</lastmod>
  </sitemap>`,
	);
	return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="${xmlns}">
${sitemapBlocks.join('\n')}
</sitemapindex>
`;
}
