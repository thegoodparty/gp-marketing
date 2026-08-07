import { electionApiAuthHeaders } from '~/lib/electionApiAuth';

const ELECTION_API_CACHE_SECONDS = 3600;

export type ElectionApiJsonResult = {
	status: number;
	ok: boolean;
	json: unknown;
};

/**
 * A non-ok response that must not be cached. Carries the status so the caller can
 * tell a retryable 5xx from a deterministic 4xx without re-parsing a message.
 */
export class ElectionApiError extends Error {
	public readonly status: number;

	public constructor(status: number, url: string) {
		super(`election-api ${status} ${url}`);
		this.name = 'ElectionApiError';
		this.status = status;
	}
}

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
		// Anything else non-ok throws rather than returning: unstable_cache stores
		// whatever the wrapped function *returns*, so a returned failure would be
		// memoized under this URL for the full hour — and because the caller retries
		// through this same cached entry, run() would never re-execute. One transient
		// 5xx would blank the field site-wide until the window elapsed. 404 is the
		// exception: it is a real, stable answer worth caching.
		if (!res.ok) throw new ElectionApiError(res.status, url);
		return { status: res.status, ok: true, json: await res.json() };
	};

	if (!process.env['NEXT_RUNTIME']) return run();

	const { unstable_cache } = await import('next/cache');
	return await unstable_cache(run, ['election-api-json', url], {
		revalidate: ELECTION_API_CACHE_SECONDS,
		...(tags && tags.length > 0 ? { tags: [...tags] } : {}),
	})();
}
