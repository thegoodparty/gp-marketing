import { afterEach, describe, expect, test } from 'bun:test';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
	clearPeopleSitemapCache,
	fetchPeopleSitemapEntries,
	MAX_URLS_PER_SITEMAP,
	peopleShardForPersonId,
	PEOPLE_SITEMAP_SHARDS,
	US_STATE_CODES,
} from '../src/lib/sitemap-entries';
import { fetchPeopleShards } from './lib/sitemap-helpers';
import { runPeopleShardsOut } from './generate-sitemaps';

const originalFetch = globalThis.fetch;
const base = 'https://goodparty.org';
const aliceId = 'aaaaaaaa-1111-2222-3333-444444444444';

type MockPerson = { id: string; slug: string; state: string | null };

/**
 * A trimmed copy of the fixture in src/lib/sitemap-entries.test.ts, scoped to
 * what this file's tests need (persons + candidacies). It stands in for the
 * same four upstream feeds so `fetchPeopleSitemapEntries` runs its real
 * enumeration logic against canned responses.
 */
function mockUpstream(opts: { persons: MockPerson[]; candidacies?: Record<string, string[]> }): string[] {
	const urls: string[] = [];
	globalThis.fetch = (async (input: RequestInfo | URL) => {
		const raw = String(input);
		urls.push(raw);
		const url = new URL(raw);
		const json = (body: unknown) =>
			new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });

		if (url.pathname.endsWith('/public-person-profiles/published')) return json([]);
		if (url.pathname.endsWith('/public-person-profiles/unlisted')) return json([]);
		if (url.pathname.endsWith('/v1/persons')) {
			const ids = url.searchParams.get('ids');
			if (ids) {
				const want = new Set(ids.split(','));
				return json(opts.persons.filter((p) => want.has(p.id)).map(({ id, slug }) => ({ id, slug })));
			}
			const state = url.searchParams.get('state');
			return json(opts.persons.filter((p) => p.state === state).map(({ id, slug }) => ({ id, slug })));
		}
		if (url.pathname.endsWith('/v1/candidacies')) {
			const state = url.searchParams.get('state') ?? '';
			return json((opts.candidacies?.[state] ?? []).map((personId) => ({ personId, positionName: 'Mayor', officeTitle: null })));
		}
		if (url.pathname.endsWith('/v1/officeholders')) return json([]);
		return json([]);
	}) as typeof fetch;
	return urls;
}

const envKeys = ['NEXT_PUBLIC_APP_BASE', 'NEXT_PUBLIC_SITE_URL', 'VERCEL_ENV', 'VERCEL_URL', 'NODE_ENV'] as const;

async function withTempDir(fn: (dir: string) => Promise<void>): Promise<void> {
	const dir = await mkdtemp(join(tmpdir(), 'people-shards-'));
	try {
		await fn(dir);
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
}

afterEach(() => {
	globalThis.fetch = originalFetch;
	clearPeopleSitemapCache();
});

describe('runPeopleShardsOut', () => {
	test('a single shard writes only that file, with the seeded person landing where peopleShardForPersonId predicts', async () => {
		mockUpstream({ persons: [{ id: aliceId, slug: 'alice-smith', state: 'WY' }], candidacies: { WY: [aliceId] } });
		const aliceShard = peopleShardForPersonId(aliceId);

		await withTempDir(async (outDir) => {
			await runPeopleShardsOut(outDir, aliceShard);

			const files = await readdir(outDir);
			expect(files).toEqual([`${aliceShard}.xml`]);

			const xml = await readFile(join(outDir, `${aliceShard}.xml`), 'utf-8');
			expect(xml).toContain(`<loc>${base}/people/alice-smith-aaaaaaaa</loc>`);
		});
	});

	// Shard 0 is a real shard (see the comment on peopleShardForPersonId), so a
	// neighboring shard with no matching person still has to come out as a
	// valid, empty-bodied file rather than being skipped or left malformed.
	test('a shard with no matching person still writes a valid, empty-bodied file', async () => {
		mockUpstream({ persons: [{ id: aliceId, slug: 'alice-smith', state: 'WY' }], candidacies: { WY: [aliceId] } });
		const aliceShard = peopleShardForPersonId(aliceId);
		const emptyShard = (aliceShard + 1) % PEOPLE_SITEMAP_SHARDS.length;

		await withTempDir(async (outDir) => {
			await runPeopleShardsOut(outDir, emptyShard);

			const xml = await readFile(join(outDir, `${emptyShard}.xml`), 'utf-8');
			expect(xml).toContain('<urlset');
			expect(xml).toContain('</urlset>');
			expect(xml).not.toContain('<url>');
		});
	});

	test('refuses to run against a local base URL, and writes nothing', async () => {
		const snapshot: Partial<Record<(typeof envKeys)[number], string | undefined>> = {};
		for (const k of envKeys) snapshot[k] = process.env[k];
		try {
			delete process.env['VERCEL_ENV'];
			delete process.env['NEXT_PUBLIC_APP_BASE'];
			(process.env as Record<string, string | undefined>)['NODE_ENV'] = 'development';
			process.env['NEXT_PUBLIC_SITE_URL'] = 'http://localhost:3009';

			await withTempDir(async (outDir) => {
				await expect(runPeopleShardsOut(outDir, 0)).rejects.toThrow(/local base URL/);
				expect(await readdir(outDir)).toEqual([]);
			});
		} finally {
			for (const k of envKeys) {
				const v = snapshot[k];
				if (v === undefined) delete process.env[k];
				else (process.env as Record<string, string | undefined>)[k] = v;
			}
		}
	});

	test('a full run exits non-zero and writes nothing when the upstream returns an empty corpus', async () => {
		mockUpstream({ persons: [] });

		await withTempDir(async (outDir) => {
			await expect(runPeopleShardsOut(outDir, null)).rejects.toThrow(/total-floor/);
			const files = await readdir(outDir).catch(() => []);
			expect(files).toEqual([]);
		});
	});

	// Every id shares the same first 8 hex chars (personIdSuffix reads those),
	// so every one of them lands in the same shard and the mocked state sweep
	// alone can push a single shard over the 50,000-URL ceiling.
	test('a shard over the 50,000-URL ceiling exits non-zero, naming the shard', async () => {
		const count = MAX_URLS_PER_SITEMAP + 1;
		const ids = Array.from({ length: count }, (_, i) => `00000000-1111-2222-3333-${i.toString(16).padStart(12, '0')}`);
		mockUpstream({
			persons: ids.map((id, i) => ({ id, slug: `person-${i}`, state: 'WY' })),
			candidacies: { WY: ids },
		});
		const shard = peopleShardForPersonId(ids[0]!);

		await withTempDir(async (outDir) => {
			await expect(runPeopleShardsOut(outDir, shard)).rejects.toThrow(
				new RegExp(`shard-ceiling.*shard ${shard} holds ${count} URLs`),
			);
			const files = await readdir(outDir).catch(() => []);
			expect(files).toEqual([]);
		});
	});

	// The concern this covers: getCachedPeopleSitemapData shares one in-flight
	// corpus walk across concurrent callers but clears it once that walk
	// settles, so building all 64 shards sequentially would re-walk the corpus
	// once per shard. Building them concurrently (fetchPeopleShards) shares it.
	test('one process performs one corpus enumeration for all 64 shards', async () => {
		const many = Array.from(
			{ length: 200 },
			(_, i) => `${(i * 7919).toString(16).padStart(8, '0')}-1111-2222-3333-444444444444`,
		);
		const urls = mockUpstream({
			persons: many.map((id) => ({ id, slug: `person-${id.slice(0, 8)}`, state: 'WY' })),
			candidacies: { WY: many },
		});

		await fetchPeopleShards([...PEOPLE_SITEMAP_SHARDS], (shard) => fetchPeopleSitemapEntries(base, shard));

		const stateSweepCalls = urls.filter((u) => u.includes('/v1/persons') && u.includes('state=') && !u.includes('ids='));
		expect(stateSweepCalls.length).toBe(US_STATE_CODES.length);
	});
});
