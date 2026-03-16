/**
 * File I/O and splitting logic for sitemap generation.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { SitemapEntry } from './xml';

const MAX_URLS_PER_SITEMAP = 50_000;
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
