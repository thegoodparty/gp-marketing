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
 * Authenticated election-api GET, keyed only on the URL so the shared 1h Data
 * Cache hits across isolates.
 *
 * The M2M Authorization header is acquired OUTSIDE this URL cache. It has its
 * own cross-isolate pool (see electionApiAuth), so this is cheap on the hot path
 * (an in-memory hit) and only mints on the rare renewal — and keeping it out of
 * the wrapped function avoids nesting unstable_cache calls. fetch itself uses
 * cache:'no-store', so the token never enters the URL cache key regardless.
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
	const authHeaders = await electionApiAuthHeaders();
	const run = async (): Promise<ElectionApiJsonResult> => {
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
