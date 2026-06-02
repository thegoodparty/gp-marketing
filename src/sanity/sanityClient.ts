import { createClient, type SanityQueries } from '@sanity/client';
import { projectId, dataset } from 'env';
import { draftMode } from 'next/headers';
import { token } from '~/lib/env';

async function sleep(ms: number): Promise<void> {
	await new Promise<void>(resolve => setTimeout(resolve, ms));
}

function isAbortError(err: unknown): boolean {
	return err instanceof Error && err.name === 'AbortError';
}

/**
 * Transient TLS / proxy / middlebox resets are common on corporate networks during
 * parallel static generation; retry a few times with backoff before failing the build.
 */
function isRetryableSanityError(err: unknown): boolean {
	if (!err || typeof err !== 'object') return false;
	if (isAbortError(err)) return false;

	const e = err as { code?: string; isNetworkError?: boolean; statusCode?: number; message?: string };
	if (e.isNetworkError) return true;
	if (
		e.code === 'ECONNRESET' ||
		e.code === 'ETIMEDOUT' ||
		e.code === 'ECONNREFUSED' ||
		e.code === 'ESOCKETTIMEDOUT'
	)
		return true;
	if (typeof e.statusCode === 'number' && e.statusCode >= 500 && e.statusCode <= 504) return true;

	const msg = String(e.message ?? '');
	if (/socket connection was closed|socket timed out|ECONNRESET|ETIMEDOUT|fetch failed|network error|UND_ERR_CONNECT_TIMEOUT/i.test(msg))
		return true;
	return false;
}

async function withSanityNetworkRetries<T>(fn: () => Promise<T>): Promise<T> {
	const maxAttempts = 3;
	const baseMs = 400;
	let lastErr: unknown;
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (err) {
			lastErr = err;
			if (!isRetryableSanityError(err) || attempt === maxAttempts) throw err;
			const delay = baseMs * 2 ** (attempt - 1) + Math.random() * 250;
			if (process.env['NODE_ENV'] !== 'production' || process.env['SANITY_FETCH_VERBOSE'] === '1') {
				console.warn(`[sanity] fetch retry ${attempt}/${maxAttempts} (${err instanceof Error ? err.message : err})`);
			}
			await sleep(delay);
		}
	}
	throw lastErr;
}

// Canonical: tag-based revalidation via sanityFetch. electionsApi.ts and ashby.ts use time-based caching; migrate to tags in a follow-up.
const _sanityClient = createClient({
	projectId,
	dataset,
	apiVersion: '2025-10-08',
	useCdn: true,
	perspective: 'published',
	/** Extra attempts on top of get-it defaults; static builds fan out many parallel CDN requests. */
	maxRetries: 10,
});

const _sanityFetch = _sanityClient.fetch.bind(_sanityClient);
_sanityClient.fetch = (async (...args: Parameters<typeof _sanityFetch>) =>
	withSanityNetworkRetries(async () => _sanityFetch(...args))) as typeof _sanityClient.fetch;

export const sanityClient = _sanityClient;

// Pull the augmented SanityQueries interface:
declare module '@sanity/client' {
	// Augmentation anchor for generated query result types (see sanity typegen)
	/* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type -- merged by sanity typegen */
	interface SanityQueries {}
	/* eslint-enable @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type */
}

// Helper type: any string key from the generated TypeMap
type QueryKey = Extract<keyof SanityQueries, string>;

export async function sanityFetch<Q extends QueryKey>({
	query,
	params,
	tags = [],
}: {
	query: Q;
	params?: Record<string, unknown>;
	tags?: string[];
}): Promise<SanityQueries[Q]> {
	const isDraft = (await draftMode()).isEnabled;

	if (!isDraft) {
		return sanityClient.fetch(query, params, {
			perspective: 'published',
			next: { tags },
		});
	}
	return sanityClient.fetch(query, params, {
		perspective: 'drafts',
		token: token,
		stega: {
			enabled: true,
			studioUrl: 'https://goodparty-marketing.sanity.studio/studio/main',
		},
	});
}
