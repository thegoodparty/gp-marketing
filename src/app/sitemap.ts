import type { MetadataRoute } from 'next';
import { getBaseUrl } from '~/lib/url';
import {
	fetchMainSitemapEntries,
	fetchStateElectionSitemapEntries,
	fetchPeopleSitemapEntries,
	getSitemapIds,
	PEOPLE_SITEMAP_BAND_START,
	PEOPLE_SITEMAP_SHARDS,
	US_STATE_CODES,
} from '~/lib/sitemap-entries';

/**
 * Rendered per request instead of prerendered at build.
 *
 * The people band is a live enumeration of ~216k pages across ~150 election-api
 * calls plus two gp-api reads, and those reads now fail closed so a wrong
 * sitemap can't be published. Prerendering makes that failure a *build* failure:
 * one blip in either upstream, or a gp-api deploy that hasn't landed yet, and
 * the entire marketing site stops shipping over a file only crawlers read.
 *
 * Dynamic keeps the strictness where it belongs — a bad upstream fails the
 * sitemap request, not the deploy — and costs nothing, because the underlying
 * fetches are still served from the tagged 1h data cache and this route is hit
 * by crawlers rather than users.
 */
export const dynamic = 'force-dynamic';

export function generateSitemaps() {
	return getSitemapIds();
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
	const n = Number(id);
	const base = getBaseUrl();
	// Shard 0 is marketing pages only; /people now lives in its own alphabetical band.
	if (n === 0) {
		return fetchMainSitemapEntries(base);
	}
	if (n >= 1 && n <= US_STATE_CODES.length) {
		const code = US_STATE_CODES[n - 1];
		if (code) return fetchStateElectionSitemapEntries(code, base);
	}
	const peopleIdx = n - PEOPLE_SITEMAP_BAND_START;
	if (peopleIdx >= 0 && peopleIdx < PEOPLE_SITEMAP_SHARDS.length) {
		const shard = PEOPLE_SITEMAP_SHARDS[peopleIdx];
		if (shard) return fetchPeopleSitemapEntries(base, shard);
	}
	return [];
}
