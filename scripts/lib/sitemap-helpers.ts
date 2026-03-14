/**
 * File I/O, API fetchers, and splitting logic for sitemap generation.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { SitemapEntry } from './xml';

/** 51 US state/territory codes (50 states + DC) */
export const US_STATE_CODES = [
	'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
] as const;

const MAX_URLS_PER_SITEMAP = 50_000;
const MAX_BYTES_PER_SITEMAP = 50 * 1024 * 1024; // 50 MB
const BYTES_PER_ENTRY_ESTIMATE = 180;
const SPLIT_CHECK_INTERVAL = 1_000;

const GP_API_BASE = process.env['NEXT_PUBLIC_API_BASE'] ?? 'https://gp-api.goodparty.org';
const ELECTION_API_BASE = process.env['NEXT_PUBLIC_ELECTION_API_BASE'] ?? process.env['ELECTIONS_API_BASE_URL'] ?? 'https://election-api.goodparty.org';

export function getAppBase(): string {
	const explicit = process.env['NEXT_PUBLIC_APP_BASE'] ?? process.env['NEXT_PUBLIC_SITE_URL'];
	if (explicit) {
		const url = explicit.trim().replace(/\/$/, '');
		return url.startsWith('http') ? url : `https://${url}`;
	}
	if (process.env['VERCEL_ENV'] === 'preview' && process.env['VERCEL_URL']) {
		return `https://${process.env['VERCEL_URL']}`;
	}
	return 'https://goodparty.org';
}

function isErrorResponse(data: unknown): boolean {
	if (data === null || typeof data !== 'object') return false;
	const o = data as Record<string, unknown>;
	return 'error' in o || 'statusCode' in o || ('message' in o && 'statusCode' in o);
}

async function fetchJson<T>(url: string): Promise<T | null> {
	try {
		const res = await fetch(url);
		if (!res.ok) {
			console.error(`[sitemap] ${res.status} ${url}`);
			return null;
		}
		const text = await res.text();
		let parsed: unknown;
		try {
			parsed = JSON.parse(text) as unknown;
		} catch {
			console.error(`[sitemap] Invalid JSON from ${url}`);
			return null;
		}
		if (isErrorResponse(parsed)) {
			console.error(`[sitemap] Error response from ${url}`);
			return null;
		}
		return parsed as T;
	} catch (err) {
		console.error(`[sitemap] Fetch failed ${url}:`, err instanceof Error ? err.message : String(err));
		return null;
	}
}

/**
 * Fetches content from the GP API. Returns empty array on failure.
 */
export async function fetchGpContent<T = unknown>(path: string): Promise<T[]> {
	const url = `${GP_API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
	const data = await fetchJson<unknown>(url);
	if (data === null) return [];
	if (Array.isArray(data)) return data as T[];
	if (typeof data === 'object' && data !== null && 'data' in (data as object)) {
		const inner = (data as { data: unknown }).data;
		if (Array.isArray(inner)) return inner as T[];
	}
	return [];
}

/**
 * Fetches data from the Election API. Returns empty array on failure.
 */
export async function fetchElectionData<T = unknown>(
	path: string,
	params: Record<string, string>,
): Promise<T[]> {
	const search = new URLSearchParams(params).toString();
	const url = `${ELECTION_API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}?${search}`;
	const data = await fetchJson<unknown>(url);
	if (data === null) return [];
	if (Array.isArray(data)) return data as T[];
	if (typeof data === 'object' && data !== null && 'data' in (data as object)) {
		const inner = (data as { data: unknown }).data;
		if (Array.isArray(inner)) return inner as T[];
	}
	return [];
}

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
 * Slugifies a string for URL use.
 */
export function slugify(s: string): string {
	return s
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}
