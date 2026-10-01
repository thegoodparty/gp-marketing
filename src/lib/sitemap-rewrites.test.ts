import { describe, expect, test } from 'bun:test';
import { peopleSitemapRewrites } from './sitemap-rewrites';
import { PEOPLE_SITEMAP_BAND_START, PEOPLE_SITEMAP_SHARD_COUNT } from './sitemap-entries';

describe('peopleSitemapRewrites', () => {
	test('returns one rule per shard, first and last ids matching the band bounds', () => {
		const rules = peopleSitemapRewrites('https://bucket.example');
		expect(rules).toHaveLength(64);
		expect(rules[0]).toEqual({
			source: '/sitemap/52.xml',
			destination: 'https://bucket.example/sitemap/people/0.xml',
		});
		expect(rules[63]).toEqual({
			source: '/sitemap/115.xml',
			destination: 'https://bucket.example/sitemap/people/63.xml',
		});
	});

	/**
	 * Drift guard: the helper inlines these two numbers rather than importing
	 * them (next.config.ts cannot load the sanity-client-laden sitemap-entries
	 * module), so this is what keeps the inlined copy from going stale.
	 */
	test('inlined band bounds match the sitemap-entries constants', () => {
		const rules = peopleSitemapRewrites('https://bucket.example');
		const firstId = Number(rules[0]?.source.match(/\/sitemap\/(\d+)\.xml/)?.[1]);
		expect(firstId).toBe(PEOPLE_SITEMAP_BAND_START);
		expect(rules).toHaveLength(PEOPLE_SITEMAP_SHARD_COUNT);
	});

	test('tolerates a trailing slash on the base URL', () => {
		const rules = peopleSitemapRewrites('https://bucket.example/');
		expect(rules[0]?.destination).toBe('https://bucket.example/sitemap/people/0.xml');
	});

	test('unset or empty base returns no rules, leaving the dynamic route in place', () => {
		expect(peopleSitemapRewrites(undefined)).toEqual([]);
		expect(peopleSitemapRewrites('')).toEqual([]);
	});
});
