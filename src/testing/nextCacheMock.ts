/**
 * The one `next/cache` mock for the logic suite.
 *
 * bun keeps the first `mock.module` registration for a specifier and ignores
 * later ones from other files in the same run. Two test files each mocking
 * `next/cache` with a different subset of exports therefore means whichever
 * registration loses gets a module missing the export it needs — and because the
 * loser silently falls through to the real CJS `next/cache`, the failure is an
 * import-time SyntaxError in an unrelated file rather than anything pointing at
 * the collision. Every test that needs `next/cache` mocked imports this module
 * instead, so the registration always carries the union of the exports.
 *
 * `unstable_cache` is a faithful passthrough: it records its arguments and runs
 * the wrapped function immediately, so it stays harmless for files that only
 * care about `revalidateTag`.
 */
import { mock } from 'bun:test';

export type CachedOptions = { revalidate?: number; tags?: readonly string[] };

/** Arguments of the most recent `unstable_cache` call. */
export const lastCacheCall: { keyParts?: unknown; options?: CachedOptions } = {};

export const unstable_cache = mock(
	(
		fn: (...args: unknown[]) => unknown,
		keyParts: unknown,
		options: CachedOptions,
	) => {
		lastCacheCall.keyParts = keyParts;
		lastCacheCall.options = options;
		return (...args: unknown[]) => fn(...args);
	},
);

export const revalidateTag = mock((tag: string) => tag);

export function resetNextCacheMock(): void {
	unstable_cache.mockClear();
	revalidateTag.mockClear();
	delete lastCacheCall.keyParts;
	delete lastCacheCall.options;
}

void mock.module('next/cache', () => ({ unstable_cache, revalidateTag }));
