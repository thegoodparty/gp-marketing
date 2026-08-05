import { electionApiAuthHeaders } from '~/lib/electionApiAuth';

const ELECTION_API_CACHE_SECONDS = 3600;

export type ElectionApiJsonResult = {
	status: number;
	ok: boolean;
	json: unknown;
};

/**
 * Authenticated election-api GET that keeps the rotating M2M Authorization header
 * OUT of the Next.js Data Cache key.
 *
 * Next's fetch cache includes Authorization in its key, so minting a fresh token
 * every ~10 minutes (and per isolate) would bust the shared 1h cache. We mint
 * inside unstable_cache and key only on the URL; fetch itself uses cache:'no-store'.
 *
 * CLI scripts (bun/tsx) cannot load next/cache (it pulls server-only), so we fall
 * back to an uncached fetch outside the Next runtime.
 */
export async function fetchElectionApiJsonCached(
	url: string,
	tags?: readonly string[],
): Promise<ElectionApiJsonResult> {
	const run = async (): Promise<ElectionApiJsonResult> => {
		const authHeaders = await electionApiAuthHeaders();
		const res = await fetch(url, { headers: authHeaders, cache: 'no-store' });
		if (res.status === 404) return { status: 404, ok: false, json: null };
		if (!res.ok) return { status: res.status, ok: false, json: null };
		return { status: res.status, ok: true, json: await res.json() };
	};

	try {
		const { unstable_cache } = await import('next/cache');
		return await unstable_cache(run, ['election-api-json', url], {
			revalidate: ELECTION_API_CACHE_SECONDS,
			...(tags && tags.length > 0 ? { tags: [...tags] } : {}),
		})();
	} catch {
		return run();
	}
}
