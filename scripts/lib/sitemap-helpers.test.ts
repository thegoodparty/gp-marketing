import { describe, expect, test } from 'bun:test';
import { MAX_URLS_PER_SITEMAP } from '../../src/lib/sitemap-entries';
import { convertToXML } from './xml';
import {
	fetchPeopleShards,
	isLocalBaseUrl,
	isWellFormedSitemapXml,
	PEOPLE_SITEMAP_TOTAL_FLOOR,
	runPeopleShardGates,
	validateShardCeilings,
	validateShardCount,
	validateTotalFloor,
	validateXmlWellFormed,
	type PeopleShardBuild,
} from './sitemap-helpers';

function entry(n: number) {
	return { loc: `https://goodparty.org/people/person-${n}`, lastmod: '2026-01-01', changefreq: 'weekly', priority: 0.5 };
}

describe('validateShardCount', () => {
	test('passes when the count matches exactly', () => {
		expect(validateShardCount(64, 64)).toBeNull();
	});

	test('fails and names both counts when the count is off', () => {
		const failure = validateShardCount(63, 64);
		expect(failure?.gate).toBe('shard-count');
		expect(failure?.message).toContain('expected exactly 64');
		expect(failure?.message).toContain('got 63');
	});
});

describe('validateShardCeilings', () => {
	test('passes every shard under the ceiling', () => {
		expect(validateShardCeilings([{ shard: 0, urlCount: MAX_URLS_PER_SITEMAP - 1 }])).toEqual([]);
	});

	test('fails a shard at or over the ceiling, naming the shard', () => {
		const failures = validateShardCeilings([
			{ shard: 3, urlCount: MAX_URLS_PER_SITEMAP },
			{ shard: 9, urlCount: 10 },
		]);
		expect(failures).toHaveLength(1);
		expect(failures[0]?.gate).toBe('shard-ceiling');
		expect(failures[0]?.message).toContain('shard 3');
	});
});

describe('validateTotalFloor', () => {
	test('passes at or above the floor', () => {
		expect(validateTotalFloor(PEOPLE_SITEMAP_TOTAL_FLOOR, PEOPLE_SITEMAP_TOTAL_FLOOR)).toBeNull();
	});

	test('fails below the floor, naming the total', () => {
		const failure = validateTotalFloor(1, 400_000);
		expect(failure?.gate).toBe('total-floor');
		expect(failure?.message).toContain('totals 1 URLs');
		expect(failure?.message).toContain('400000 floor');
	});
});

describe('isWellFormedSitemapXml', () => {
	test('accepts the generators own output', () => {
		expect(isWellFormedSitemapXml(convertToXML([entry(1), entry(2)]))).toBe(true);
		expect(isWellFormedSitemapXml(convertToXML([]))).toBe(true);
	});

	test('rejects a missing XML declaration', () => {
		expect(isWellFormedSitemapXml('<urlset></urlset>')).toBe(false);
	});

	test('rejects an unclosed <url> block', () => {
		const xml = convertToXML([entry(1)]).replace('</url>', '');
		expect(isWellFormedSitemapXml(xml)).toBe(false);
	});

	test('rejects an unescaped ampersand', () => {
		const xml = convertToXML([entry(1)]).replace('person-1', 'person & 1');
		expect(isWellFormedSitemapXml(xml)).toBe(false);
	});

	test('accepts a properly escaped ampersand', () => {
		const xml = convertToXML([entry(1)]).replace('person-1', 'person &amp; 1');
		expect(isWellFormedSitemapXml(xml)).toBe(true);
	});
});

describe('validateXmlWellFormed', () => {
	test('names the shard on failure', () => {
		const failure = validateXmlWellFormed(12, '<urlset></urlset>');
		expect(failure?.gate).toBe('xml-well-formed');
		expect(failure?.message).toContain('shard 12');
	});

	test('returns null when the XML is well-formed', () => {
		expect(validateXmlWellFormed(12, convertToXML([entry(1)]))).toBeNull();
	});
});

describe('runPeopleShardGates', () => {
	// `urlCount` is passed independently of the XML body: the gates read it as
	// the source of truth for ceiling/floor checks (it is what the real caller
	// computes from `entries.length`), and well-formedness is checked against
	// `xml` alone, so a tiny fixed body is enough to exercise both here.
	function build(shard: number, urlCount: number): PeopleShardBuild {
		return { shard, urlCount, xml: convertToXML([entry(shard)]) };
	}

	test('all-green: exact shard count, every shard under the ceiling, total over the floor, valid XML', () => {
		const shards = [build(0, 3), build(1, 3)];
		expect(runPeopleShardGates(shards, { expectedShardCount: 2, totalFloor: 5 })).toEqual([]);
	});

	test('single-shard mode skips shard-count and total-floor entirely', () => {
		const shards = [build(17, 1)];
		expect(runPeopleShardGates(shards, {})).toEqual([]);
	});

	test('collects every failing gate, not just the first', () => {
		const shards = [build(0, 1), build(1, MAX_URLS_PER_SITEMAP)];
		const failures = runPeopleShardGates(shards, { expectedShardCount: 3, totalFloor: 400_000 });
		const gates = failures.map((f) => f.gate).sort();
		expect(gates).toEqual(['shard-ceiling', 'shard-count', 'total-floor']);
	});
});

describe('isLocalBaseUrl', () => {
	test('flags localhost and loopback hosts', () => {
		expect(isLocalBaseUrl('http://localhost:3009')).toBe(true);
		expect(isLocalBaseUrl('http://127.0.0.1:3009')).toBe(true);
	});

	test('does not flag the production host', () => {
		expect(isLocalBaseUrl('https://goodparty.org')).toBe(false);
	});

	test('does not flag an unparseable string as local', () => {
		expect(isLocalBaseUrl('not-a-url')).toBe(false);
	});
});

describe('fetchPeopleShards', () => {
	test('fires every shard concurrently rather than one at a time', async () => {
		let inFlight = 0;
		let maxInFlight = 0;
		const fetchShard = async (shard: number) => {
			inFlight++;
			maxInFlight = Math.max(maxInFlight, inFlight);
			await Promise.resolve();
			inFlight--;
			return [entry(shard)];
		};

		await fetchPeopleShards([0, 1, 2, 3], fetchShard);
		expect(maxInFlight).toBeGreaterThan(1);
	});

	test('pairs each shard with its own entries, in the shards given', async () => {
		const results = await fetchPeopleShards([5, 9], async (shard) => [entry(shard)]);
		expect(results).toEqual([
			{ shard: 5, entries: [entry(5)] },
			{ shard: 9, entries: [entry(9)] },
		]);
	});
});
