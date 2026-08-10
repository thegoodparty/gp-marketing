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
