/**
 * Which hostnames this app may be indexed on. Dependency-free so edge middleware can
 * import it without pulling in Sanity or env modules.
 */

/** True for goodparty.org and any of its subdomains. */
export function isGoodPartyProductionHost(hostname: string): boolean {
	return hostname === 'goodparty.org' || hostname.endsWith('.goodparty.org');
}

/**
 * True when a response must carry `noindex` because it is not being served on a
 * goodparty.org production host.
 *
 * `VERCEL_ENV === 'preview'` alone is not enough, and that is the whole bug: the
 * preview environment deploys with `VERCEL_ENV=production`, so `getBaseUrl()`
 * resolves it to `https://goodparty.org` and every env-keyed guard reports
 * "production" while the deploy is actually served on a `*.vercel.app` hostname.
 * That covered the old `VERCEL_ENV === 'preview'` gate in middleware as well as
 * `isPreviewBaseUrl` behind robots.txt and /llms.txt, so the preview served the
 * permissive production robots.txt and Googlebot crawled it — Search Console listed
 * `gp-marketing-peach.vercel.app` as a discovery source for goodparty.org URLs.
 * Only the request host tells the truth about which hostname is being served, and
 * middleware is the one layer that can see it; robots.txt is generated at build time
 * and cannot.
 *
 * Kept as an allowlist so a hostname nobody anticipated gets `noindex` rather than
 * being assumed to be production. The consequence is that **a new production domain
 * must be added to `isGoodPartyProductionHost` or the whole site goes noindex on it.**
 * A missing Host header is the one case left indexable: it cannot be classified, it
 * does not occur over HTTP/1.1, and failing in that direction cannot take the live
 * site out of the index.
 *
 * The env check is retained on top of the host check for a preview that is one day
 * served on a `*.goodparty.org` hostname, which the allowlist would otherwise pass.
 */
export function shouldNoIndexHost(hostname: string | null | undefined): boolean {
	if (process.env['VERCEL_ENV'] === 'preview') return true;
	if (!hostname) return false;
	const bare = hostname.split(':')[0]?.toLowerCase();
	if (!bare) return false;
	return !isGoodPartyProductionHost(bare);
}
