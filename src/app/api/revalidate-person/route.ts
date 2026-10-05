import { createHmac, timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { githubSitemapDispatchToken, personRevalidateSecret } from '~/lib/env';
import { PEOPLE_REMOVALS_CACHE_TAG, personCacheTag } from '~/lib/electionsApi';
import {
	clearPeopleSitemapCache,
	peopleShardForPersonId,
	PEOPLE_SITEMAP_CACHE_TAG,
} from '~/lib/sitemap-entries';

const SECRET_HEADER = 'x-revalidate-secret';
const HMAC_KEY = 'personRevalidate';
const PERSON_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const GITHUB_SITEMAP_DISPATCH_URL =
	'https://api.github.com/repos/thegoodparty/gp-marketing/actions/workflows/generate-people-sitemaps.yml/dispatches';

function safeCompare(a: string, b: string): boolean {
	const da = createHmac('sha256', HMAC_KEY).update(a).digest();
	const db = createHmac('sha256', HMAC_KEY).update(b).digest();
	return timingSafeEqual(da, db);
}

/**
 * Fires the single-shard regeneration for this person's static sitemap file.
 * Static files can't be busted by a cache tag, so without this the delisting
 * (or new page) would only reach the sitemap on the next hourly cron run.
 *
 * Fire-and-forget by design: the webhook's response must not depend on GitHub's
 * availability, so this is never awaited by the caller and the promise carries
 * its own `.catch`, attached synchronously, so a rejection never reaches the
 * runtime as unhandled.
 */
function dispatchPeopleSitemapShard(personId: string): void {
	if (!githubSitemapDispatchToken) {
		console.warn(
			'People sitemap shard dispatch skipped: GITHUB_SITEMAP_DISPATCH_TOKEN is not set',
		);
		return;
	}

	const shard = peopleShardForPersonId(personId);
	void fetch(GITHUB_SITEMAP_DISPATCH_URL, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${githubSitemapDispatchToken}`,
			Accept: 'application/vnd.github+json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ ref: 'develop', inputs: { shard: String(shard) } }),
	})
		.then((res) => {
			if (res.status !== 204) {
				console.error(`People sitemap shard dispatch failed: GitHub responded ${res.status}`);
			}
		})
		.catch((err) => {
			console.error('People sitemap shard dispatch failed:', err);
		});
}

/**
 * On-demand cache bust for a single public /people/* page. gp-api calls this
 * after a publish/unpublish/delete/edit. We bust the per-person cache tag rather
 * than a path so the regeneration is independent of the name-based slug and so a
 * delete (which makes the loader return null → notFound) also takes effect.
 */
export async function POST(req: NextRequest) {
	if (!personRevalidateSecret) {
		return NextResponse.json(
			{ error: 'Revalidation not configured: MARKETING_REVALIDATE_SECRET is not set' },
			{ status: 503 },
		);
	}

	const provided = req.headers.get(SECRET_HEADER);
	if (!provided || !safeCompare(provided, personRevalidateSecret)) {
		return NextResponse.json({ error: 'Invalid or missing revalidate secret' }, { status: 401 });
	}

	let body: { personId?: unknown };
	try {
		body = (await req.json()) as { personId?: unknown };
	} catch {
		return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const personId = typeof body.personId === 'string' ? body.personId.trim() : '';
	if (!PERSON_ID_RE.test(personId)) {
		return NextResponse.json({ error: 'Invalid personId' }, { status: 400 });
	}

	try {
		const tag = personCacheTag(personId);
		revalidateTag(tag);
		// Bust the Next.js data cache for people-sitemap upstream fetches across
		// all instances, then drop this instance's in-memory Promise so shards
		// re-seed from the freshly invalidated cache.
		revalidateTag(PEOPLE_SITEMAP_CACHE_TAG);
		// A takedown also has to reach the OTHER profiles that carry this person's
		// photo on an "Other Candidates" or "Nearby Officials" card.
		revalidateTag(PEOPLE_REMOVALS_CACHE_TAG);
		clearPeopleSitemapCache();
		dispatchPeopleSitemapShard(personId);
		return NextResponse.json({ revalidated: true, tag });
	} catch (err) {
		// Log the detail server-side; don't echo the raw error text to the caller.
		console.error('Person revalidation failed:', err);
		return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
	}
}
