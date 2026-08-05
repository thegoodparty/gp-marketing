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
 * unstable_cache only works inside the Next server runtime. In CLI scripts (bun/tsx)
 * and unit tests the module still imports, but invoking unstable_cache outside the
 * runtime hangs/misbehaves — so we gate on NEXT_RUNTIME and fall back to an uncached
 * fetch there. Inside the Next runtime we do NOT swallow errors: a genuine cache-layer
 * or run() failure propagates to the caller instead of silently degrading.
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

	if (!process.env['NEXT_RUNTIME']) return run();

	const { unstable_cache } = await import('next/cache');
	return await unstable_cache(run, ['election-api-json', url], {
		revalidate: ELECTION_API_CACHE_SECONDS,
		...(tags && tags.length > 0 ? { tags: [...tags] } : {}),
	})();
}
