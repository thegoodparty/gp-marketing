/**
 * File I/O and splitting logic for sitemap generation.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { MAX_URLS_PER_SITEMAP } from '../../src/lib/sitemap-entries';
import type { SitemapEntry } from './xml';

const MAX_BYTES_PER_SITEMAP = 50 * 1024 * 1024; // 50 MB
const BYTES_PER_ENTRY_ESTIMATE = 180;
const SPLIT_CHECK_INTERVAL = 1_000;

/**
 * Splits URL entries into chunks respecting 50k URL and 50MB limits.
 * Checks splitting need every 1,000 URLs.
 */
export function splitUrlsIntoChunks(entries: SitemapEntry[]): SitemapEntry[][] {
	if (entries.length <= MAX_URLS_PER_SITEMAP) {
		const estBytes = entries.length * BYTES_PER_ENTRY_ESTIMATE;
		if (estBytes <= MAX_BYTES_PER_SITEMAP) return [entries];
	}

	const chunks: SitemapEntry[][] = [];
	let current: SitemapEntry[] = [];
	let currentBytes = 0;

	for (let i = 0; i < entries.length; i++) {
		current.push(entries[i]!);
		currentBytes += BYTES_PER_ENTRY_ESTIMATE;

		const shouldSplit =
			current.length >= MAX_URLS_PER_SITEMAP ||
			currentBytes >= MAX_BYTES_PER_SITEMAP ||
			(i > 0 && (i + 1) % SPLIT_CHECK_INTERVAL === 0 && currentBytes >= MAX_BYTES_PER_SITEMAP);

		if (shouldSplit && current.length > 0) {
			chunks.push(current);
			current = [];
			currentBytes = 0;
		}
	}
	if (current.length > 0) chunks.push(current);
	return chunks;
}

/**
 * Ensures directory exists and writes the sitemap file.
 */
export async function writeSitemapFile(outputDir: string, relativePath: string, xml: string): Promise<string> {
	const fullPath = join(outputDir, relativePath);
	await mkdir(dirname(fullPath), { recursive: true });
	await writeFile(fullPath, xml, 'utf-8');
	return fullPath;
}

/**
 * Formats date as YYYY-MM-DD for lastmod.
 */
export function formatLastmod(d: Date = new Date()): string {
	return d.toISOString().slice(0, 10);
}

/**
 * Floor on total URLs across the /people band, checked by the shard-emission
 * gate in generate-sitemaps.ts. The live corpus is ~478k; 400k leaves headroom
 * for normal day-to-day drift while still catching an upstream that silently
 * returned a fraction of the table -- an empty or partial corpus would
 * otherwise publish a shrunken but individually well-formed band. Raise it
 * only if the corpus legitimately shrinks below this line.
 */
export const PEOPLE_SITEMAP_TOTAL_FLOOR = 400_000;

/** A single failed validation gate, named so the CLI can report which one tripped. */
export interface GateFailure {
	gate: 'shard-count' | 'shard-ceiling' | 'total-floor' | 'xml-well-formed';
	message: string;
}

/** Fails unless the emitted file count matches the band's declared shard count exactly. */
export function validateShardCount(actual: number, expected: number): GateFailure | null {
	if (actual === expected) return null;
	return { gate: 'shard-count', message: `expected exactly ${expected} people shard files, got ${actual}` };
}

/** Fails any shard at or over the sitemap protocol's 50,000-URL ceiling. */
export function validateShardCeilings(shards: readonly { shard: number; urlCount: number }[]): GateFailure[] {
	return shards
		.filter((s) => s.urlCount >= MAX_URLS_PER_SITEMAP)
		.map((s) => ({
			gate: 'shard-ceiling' as const,
			message: `shard ${s.shard} holds ${s.urlCount} URLs, at or over the ${MAX_URLS_PER_SITEMAP} ceiling`,
		}));
}

/** Fails if the band's total URL count drops below `floor` -- see PEOPLE_SITEMAP_TOTAL_FLOOR. */
export function validateTotalFloor(total: number, floor: number): GateFailure | null {
	if (total >= floor) return null;
	return { gate: 'total-floor', message: `people band totals ${total} URLs, under the ${floor} floor` };
}

/**
 * Cheap structural well-formedness check, not a full XML parser: matching tag
 * counts and no unescaped `&`. That is enough for a file this script itself
 * serializes with a fixed, known-good template (convertToXML) -- the failure
 * mode this guards is a generator bug (a skipped escape, a truncated write),
 * not arbitrary untrusted XML.
 */
export function isWellFormedSitemapXml(xml: string): boolean {
	if (!xml.startsWith('<?xml')) return false;
	if ((xml.match(/<urlset[ >]/g) ?? []).length !== 1) return false;
	if ((xml.match(/<\/urlset>/g) ?? []).length !== 1) return false;
	const urlOpen = (xml.match(/<url>/g) ?? []).length;
	const urlClose = (xml.match(/<\/url>/g) ?? []).length;
	if (urlOpen !== urlClose) return false;
	const locOpen = (xml.match(/<loc>/g) ?? []).length;
	const locClose = (xml.match(/<\/loc>/g) ?? []).length;
	if (locOpen !== locClose || locOpen !== urlOpen) return false;
	if (/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/.test(xml)) return false;
	return true;
}

/** Wraps isWellFormedSitemapXml as a gate, naming the shard that failed to parse. */
export function validateXmlWellFormed(shard: number, xml: string): GateFailure | null {
	if (isWellFormedSitemapXml(xml)) return null;
	return { gate: 'xml-well-formed', message: `shard ${shard} did not parse as well-formed XML` };
}

export interface PeopleShardBuild {
	shard: number;
	urlCount: number;
	xml: string;
}

/**
 * Runs every gate against a built set of people shards. `expectedShardCount`
 * and `totalFloor` are omitted by the single-shard CLI path (`--shard N`),
 * where neither question -- "is this the whole band?" -- applies to one file.
 */
export function runPeopleShardGates(
	shards: readonly PeopleShardBuild[],
	opts: { expectedShardCount?: number; totalFloor?: number },
): GateFailure[] {
	const failures: GateFailure[] = [];
	if (opts.expectedShardCount !== undefined) {
		const f = validateShardCount(shards.length, opts.expectedShardCount);
		if (f) failures.push(f);
	}
	failures.push(...validateShardCeilings(shards));
	if (opts.totalFloor !== undefined) {
		const total = shards.reduce((sum, s) => sum + s.urlCount, 0);
		const f = validateTotalFloor(total, opts.totalFloor);
		if (f) failures.push(f);
	}
	for (const s of shards) {
		const f = validateXmlWellFormed(s.shard, s.xml);
		if (f) failures.push(f);
	}
	return failures;
}

/** True when a base URL resolves to a local dev host -- the shard emitter must refuse to run against one. */
export function isLocalBaseUrl(baseUrl: string): boolean {
	try {
		const host = new URL(baseUrl).hostname;
		return host === 'localhost' || host === '127.0.0.1' || host === '::1';
	} catch {
		return false;
	}
}

/**
 * Fetches every requested shard concurrently. getCachedPeopleSitemapData
 * (src/lib/sitemap-entries.ts) shares one in-flight corpus walk across
 * concurrent callers but clears it once that walk settles, so a sequential
 * loop here would re-walk the ~150-request corpus once per shard instead of
 * once for the whole band.
 *
 * Generic in the per-shard result so callers can pass either the CLI's
 * SitemapEntry mapper or the raw MetadataRoute.Sitemap fetcher directly.
 */
export async function fetchPeopleShards<T>(
	shards: readonly number[],
	fetchShard: (shard: number) => Promise<T>,
): Promise<{ shard: number; entries: T }[]> {
	return Promise.all(shards.map(async (shard) => ({ shard, entries: await fetchShard(shard) })));
}
