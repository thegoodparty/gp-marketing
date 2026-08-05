import { createHmac, timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { personRevalidateSecret } from '~/lib/env';
import { personCacheTag } from '~/lib/electionsApi';
import { clearPeopleSitemapCache, PEOPLE_SITEMAP_CACHE_TAG } from '~/lib/sitemap-entries';

const SECRET_HEADER = 'x-revalidate-secret';
const HMAC_KEY = 'personRevalidate';
const PERSON_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function safeCompare(a: string, b: string): boolean {
	const da = createHmac('sha256', HMAC_KEY).update(a).digest();
	const db = createHmac('sha256', HMAC_KEY).update(b).digest();
	return timingSafeEqual(da, db);
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
		clearPeopleSitemapCache();
		return NextResponse.json({ revalidated: true, tag });
	} catch (err) {
		// Log the detail server-side; don't echo the raw error text to the caller.
		console.error('Person revalidation failed:', err);
		return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
	}
}
