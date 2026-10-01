/**
 * Builds the next.config.ts rewrite rules that proxy the /people sitemap band
 * straight to S3 at the Vercel edge, so crawlers keep hitting the exact
 * `goodparty.org/sitemap/<id>.xml` URLs GSC already knows while no function
 * runs to serve them.
 *
 * The band bounds (52..115) are inlined rather than imported from
 * `~/lib/sitemap-entries`: that module pulls in the Sanity client and other
 * server-only code next.config.ts should not load at config-eval time. The
 * test file pins these two numbers against the real exported constants so
 * the inlined copy cannot drift.
 */

/** Must equal PEOPLE_SITEMAP_BAND_START in ~/lib/sitemap-entries. */
const PEOPLE_SITEMAP_BAND_START = 52;

/** Must equal PEOPLE_SITEMAP_SHARD_COUNT in ~/lib/sitemap-entries. */
const PEOPLE_SITEMAP_SHARD_COUNT = 64;

export type SitemapRewriteRule = { source: string; destination: string };

/**
 * One rule per people shard: `/sitemap/<BAND_START + i>.xml` -> the matching
 * shard object in S3. `s3Base` tolerates a trailing slash since the env var
 * that feeds it is set by hand in Vercel.
 */
export function peopleSitemapRewrites(s3Base: string | undefined): SitemapRewriteRule[] {
	if (!s3Base) return [];
	const base = s3Base.replace(/\/$/, '');
	return Array.from({ length: PEOPLE_SITEMAP_SHARD_COUNT }, (_, i) => ({
		source: `/sitemap/${PEOPLE_SITEMAP_BAND_START + i}.xml`,
		destination: `${base}/sitemap/people/${i}.xml`,
	}));
}
