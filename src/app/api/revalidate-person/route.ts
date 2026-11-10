import { createHmac, timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { githubSitemapDispatchToken, personRevalidateSecret } from '~/lib/env';
import { ELECTION_DATA_CACHE_TAG } from '~/lib/electionApiFetch';
import { PEOPLE_PUBLISHED_CACHE_TAG, PEOPLE_REMOVALS_CACHE_TAG, personCacheTag } from '~/lib/electionsApi';
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

/**
 * The site-wide lists a person can move into or out of, and the tag on every
 * cached read of each. Every profile and election page reads both lists, so
 * busting a list re-renders all of them.
 */
const LISTING_TAGS: Record<string, string> = {
	published: PEOPLE_PUBLISHED_CACHE_TAG,
	unlisted: PEOPLE_REMOVALS_CACHE_TAG,
};

/**
 * The lists gp-api says this write changed. A caller from before `listings`
 * existed gets every list, which is what every call used to do, and so does a
 * value this route does not know: re-rendering too much costs money, while
 * re-rendering too little can keep a takedown's photo on other pages.
 */
function changedListingTags(listings: unknown): string[] {
	if (Array.isArray(listings) && listings.every((item): item is string => typeof item === 'string' && Object.hasOwn(LISTING_TAGS, item))) {
		return [...new Set(listings.map(item => LISTING_TAGS[item] as string))];
	}
	if (listings !== undefined) {
		console.warn('revalidate-person: unrecognized listings, refreshing every list', listings);
	}
	return Object.values(LISTING_TAGS);
}

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
 * after every write that changes what the page shows, with
 * `{ personId, listings }`: `listings` names the site-wide lists ("published",
 * "unlisted") the write moved the person into or out of, and is empty for an
 * edit. We bust the per-person cache tag rather than a path so the regeneration
 * is independent of the name-based slug and so a delete (which makes the loader
 * return null → notFound) also takes effect.
 *
 * `{ scope: 'election-data' }` instead refreshes every page built from election
 * data, for the nightly load to call once it has swapped in new data.
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

	let body: { personId?: unknown; listings?: unknown; scope?: unknown };
	try {
		body = (await req.json()) as { personId?: unknown; listings?: unknown; scope?: unknown };
	} catch {
		return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	if (body.scope === 'election-data') {
		try {
			revalidateTag(ELECTION_DATA_CACHE_TAG);
			return NextResponse.json({ revalidated: true, tag: ELECTION_DATA_CACHE_TAG });
		} catch (err) {
			console.error('Election data revalidation failed:', err);
			return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
		}
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
		// A publish or a takedown also has to reach the OTHER pages that carry
		// this person's photo on a card. An edit reaches them through the
		// person tag on their read of this person's profile.
		for (const listingTag of changedListingTags(body.listings)) {
			revalidateTag(listingTag);
		}
		clearPeopleSitemapCache();
		dispatchPeopleSitemapShard(personId);
		return NextResponse.json({ revalidated: true, tag });
	} catch (err) {
		// Log the detail server-side; don't echo the raw error text to the caller.
		console.error('Person revalidation failed:', err);
		return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
	}
}
