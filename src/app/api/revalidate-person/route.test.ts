import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { PEOPLE_SITEMAP_CACHE_TAG } from '~/lib/sitemap-entries';
import { resetNextCacheMock, revalidateTag } from '~/testing/nextCacheMock';

/**
 * Integration coverage for the receiving half of the gp-api → marketing
 * cache-bust seam. gp-api's `MarketingRevalidationService` is unit-tested on its
 * own side, but nothing exercised this handler, so a drift in the wire format
 * (header name, body key, id casing) would only surface as a stale public page
 * in production — the failure is silent, because the sender treats every
 * response as best-effort and never retries.
 *
 * The request shape asserted here is the contract gp-api sends:
 *   POST /api/revalidate-person
 *   x-revalidate-secret: <MARKETING_REVALIDATE_SECRET>
 *   { "personId": "<uuid>" }
 *
 * See packages/gp-api/src/personProfiles/services/marketing-revalidation.service.ts
 * in the omni repo. Changing either side without the other breaks revalidation.
 */

const SECRET = 'test-revalidate-secret';
const PERSON_ID = '74eee01a-1111-4222-8333-444444444444';

// `~/lib/env` reads process.env once at module scope, and a sibling test file may
// already have evaluated it, so setting the env var here would be too late. Mock
// the module instead, spreading the real exports so the rest of the suite still
// sees the genuine values. The secret is fixed for the file because the route
// binds it at import; the unconfigured (503) branch is a guard clause and is not
// covered here.
const realEnv = await import('~/lib/env');
mock.module('~/lib/env', () => ({ ...realEnv, personRevalidateSecret: SECRET }));

// `~/lib/sitemap-entries` is deliberately NOT mocked. Stubbing
// `clearPeopleSitemapCache` would hand the stub to `sitemap-entries.test.ts`,
// which calls the real one to reset module-level cache state between its cases —
// bun keeps the first `mock.module` for a specifier, so whichever file evaluated
// first would decide, and that file's fetch-count assertions would turn
// order-dependent. The real function only nulls an in-process promise, so it is
// safe to run here; the observable half of the sitemap bust is the revalidated
// tag, which is asserted below.

const { POST } = await import('./route');

async function post(body: unknown, secret?: string | null): Promise<Response> {
	const headers = new Headers({ 'content-type': 'application/json' });
	if (secret != null) headers.set('x-revalidate-secret', secret);
	const req = new Request('https://marketing.test/api/revalidate-person', {
		method: 'POST',
		headers,
		body: typeof body === 'string' ? body : JSON.stringify(body),
	});
	// The handler only touches the standard Request surface (headers + json()).
	return POST(req as never);
}

beforeEach(() => {
	resetNextCacheMock();
});

describe('POST /api/revalidate-person', () => {
	test('busts the person tag for a request in gp-api wire format', async () => {
		const res = await post({ personId: PERSON_ID }, SECRET);

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({
			revalidated: true,
			tag: `person:${PERSON_ID}`,
		});
		expect(revalidateTag).toHaveBeenCalledWith(`person:${PERSON_ID}`);
	});

	test('also busts the people sitemap so a new page is discoverable', async () => {
		await post({ personId: PERSON_ID }, SECRET);

		expect(revalidateTag).toHaveBeenCalledWith(PEOPLE_SITEMAP_CACHE_TAG);
	});

	// Postgres hands gp-api lowercase uuids today, but the tag is what pairs this
	// bust with the tag the page's fetches were cached under, so casing must not
	// be load-bearing.
	test('normalizes id casing so the tag matches the one the page cached under', async () => {
		const res = await post({ personId: PERSON_ID.toUpperCase() }, SECRET);

		expect(res.status).toBe(200);
		expect(revalidateTag).toHaveBeenCalledWith(`person:${PERSON_ID}`);
	});

	test('rejects a wrong secret without revalidating', async () => {
		const res = await post({ personId: PERSON_ID }, 'not-the-secret');

		expect(res.status).toBe(401);
		expect(revalidateTag).not.toHaveBeenCalled();
	});

	// A secret of a different length must not throw: the comparison HMACs both
	// sides to equal-length digests before timingSafeEqual, which would otherwise
	// throw on a length mismatch and turn a 401 into a 500.
	test('rejects a secret of a different length as 401, not 500', async () => {
		const res = await post({ personId: PERSON_ID }, 'short');

		expect(res.status).toBe(401);
	});

	test('rejects a missing secret header', async () => {
		const res = await post({ personId: PERSON_ID });

		expect(res.status).toBe(401);
		expect(revalidateTag).not.toHaveBeenCalled();
	});

	test('rejects a personId that is not a uuid', async () => {
		const res = await post({ personId: 'allen-slagle' }, SECRET);

		expect(res.status).toBe(400);
		expect(revalidateTag).not.toHaveBeenCalled();
	});

	test('rejects a missing personId', async () => {
		const res = await post({}, SECRET);

		expect(res.status).toBe(400);
	});

	test('rejects a malformed body', async () => {
		const res = await post('{not json', SECRET);

		expect(res.status).toBe(400);
		expect(revalidateTag).not.toHaveBeenCalled();
	});
});
