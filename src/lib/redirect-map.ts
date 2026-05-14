import { dataset, projectId } from '~/lib/env';

export type RedirectMap = Record<string, { to: string; permanent: boolean }>;

export interface RedirectEntry {
	field_fromUrl?: string;
	field_toUrl?: string;
	field_permanentRedirect?: boolean;
}

/** GROQ for CMS-driven paths; keep in sync with `src/app/api/redirects/route.ts`. */
export const REDIRECTS_GROQ =
	'*[_type=="goodpartyOrg_redirects"][0].list_redirects[]{field_fromUrl,field_toUrl,field_permanentRedirect}';

const SANITY_QUERY_API_VERSION = '2025-10-08';

export function normalizePath(path: string): string {
	return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

export function entriesToRedirectMap(entries: RedirectEntry[] | null | undefined): RedirectMap {
	const map: RedirectMap = {};
	if (!entries) return map;
	for (const entry of entries) {
		if (entry.field_fromUrl && entry.field_toUrl) {
			map[normalizePath(entry.field_fromUrl)] = {
				to: entry.field_toUrl,
				permanent: entry.field_permanentRedirect ?? false,
			};
		}
	}
	return map;
}

/**
 * Load redirect rules from Sanity without calling this app’s `/api/redirects`.
 * Same-origin fetches from middleware deadlock Next.js dev (e.g. Bun + Turbopack).
 */
export async function fetchRedirectMapFromSanityCdn(): Promise<RedirectMap> {
	const query = encodeURIComponent(REDIRECTS_GROQ);
	const url = `https://${projectId}.apicdn.sanity.io/v${SANITY_QUERY_API_VERSION}/data/query/${dataset}?query=${query}`;
	const res = await fetch(url, { headers: { Accept: 'application/json' } });
	if (!res.ok) throw new Error(`Sanity CDN responded ${res.status}`);
	const data = (await res.json()) as { result: RedirectEntry[] | null };
	return entriesToRedirectMap(data.result);
}
