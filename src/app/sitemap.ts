import type { MetadataRoute } from 'next';
import { getBaseUrl } from '~/lib/url';
import {
	fetchMainSitemapEntries,
	fetchStateElectionSitemapEntries,
	fetchCandidateSitemapEntries,
	US_STATE_CODES,
} from '~/lib/sitemap-entries';

export function generateSitemaps() {
	const ids: { id: number }[] = [{ id: 0 }];
	for (let i = 0; i < US_STATE_CODES.length; i++) {
		ids.push({ id: i + 1 });
		ids.push({ id: i + 1 + US_STATE_CODES.length });
	}
	return ids;
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
	const n = Number(id);
	const base = getBaseUrl();
	if (n === 0) return fetchMainSitemapEntries(base);
	if (n >= 1 && n <= US_STATE_CODES.length) {
		const code = US_STATE_CODES[n - 1];
		if (code) return fetchStateElectionSitemapEntries(code, base);
	}
	const candidateIdx = n - US_STATE_CODES.length - 1;
	if (candidateIdx >= 0 && candidateIdx < US_STATE_CODES.length) {
		const code = US_STATE_CODES[candidateIdx];
		if (code) return fetchCandidateSitemapEntries(code, base);
	}
	return [];
}
