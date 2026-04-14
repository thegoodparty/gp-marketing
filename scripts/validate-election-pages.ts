#!/usr/bin/env bun
/**
 * Validates election page content for display name regressions (e.g. "buckeye County" for city of Buckeye).
 * Fetches race slugs from Election API, GETs rendered pages, checks title/meta for anti-patterns.
 *
 * Usage:
 * - bun run scripts/validate-election-pages.ts --mode positions [--base-url URL] [--states AZ,AL,CA] [--concurrency N] [--sample N]
 * - bun run scripts/validate-election-pages.ts --mode state-pages [--base-url URL] [--states AZ,AL,CA] [--concurrency N]
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { US_STATE_CODES } from '../src/lib/sitemap-entries';

const DEFAULT_BASE_URL = 'https://goodparty.org';
const DEFAULT_CONCURRENCY = 10;
const DEFAULT_SAMPLE_PER_STATE = 20;
const DEFAULT_TIMEOUT_MS = 15_000;
const STATE_FACTS_MARKER = /data-section=["']Location Facts Block["']/i;

const ELECTION_API_BASE =
	process.env['NEXT_PUBLIC_ELECTION_API_BASE'] ??
	process.env['ELECTIONS_API_BASE_URL'] ??
	'https://election-api.goodparty.org';

const BAD_PATTERNS = [
	/\b[a-z][a-z-]*\s+County\b/, // lowercase word + " County" = broken fallback (e.g. "buckeye County"), not "Yuma County"
	/\bundefined\b/i,
	/\bnull\b/i,
	/\[object\s/i,
];

export interface PageCheckResult {
	url: string;
	status: number;
	durationMs: number;
	title?: string;
	description?: string;
	invalid: string[];
}

export interface ElectionPageReport {
	baseUrl: string;
	timestamp: string;
	durationMs: number;
	summary: {
		total: number;
		valid: number;
		invalid: number;
		errors: number;
	};
	invalid: PageCheckResult[];
	errors: Array<{ url: string; error: string }>;
}

function parseArgs(): {
	baseUrl: string;
	states: string[];
	concurrency: number;
	samplePerState: number;
	mode: 'positions' | 'state-pages';
} {
	const args = process.argv.slice(2);
	let baseUrl = DEFAULT_BASE_URL;
	let states: string[] = [];
	let concurrency = DEFAULT_CONCURRENCY;
	let samplePerState = DEFAULT_SAMPLE_PER_STATE;
	let mode: 'positions' | 'state-pages' = 'positions';

	for (let i = 0; i < args.length; i++) {
		const arg = args[i] ?? '';
		if (arg === '--base-url' && args[i + 1]) {
			baseUrl = args[++i]!.replace(/\/$/, '');
			if (!baseUrl.startsWith('http')) baseUrl = `https://${baseUrl}`;
		} else if (arg === '--states' && args[i + 1]) {
			states = args[++i]!.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
		} else if (arg === '--concurrency' && args[i + 1]) {
			concurrency = Number.parseInt(args[++i]!, 10) || DEFAULT_CONCURRENCY;
		} else if (arg === '--sample' && args[i + 1]) {
			samplePerState = Number.parseInt(args[++i]!, 10) || DEFAULT_SAMPLE_PER_STATE;
		} else if (arg === '--mode' && args[i + 1]) {
			const value = (args[++i] ?? '').toLowerCase();
			if (value === 'positions' || value === 'state-pages') {
				mode = value;
			}
		}
	}

	if (states.length === 0 && mode === 'positions') {
		const shuffled = [...US_STATE_CODES].sort(() => Math.random() - 0.5);
		states = shuffled.slice(0, 3).filter(Boolean);
	} else if (states.length === 0 && mode === 'state-pages') {
		states = [...US_STATE_CODES];
	}

	return { baseUrl, states, concurrency, samplePerState, mode };
}

async function fetchElectionJson<T>(path: string, params: Record<string, string>): Promise<T[]> {
	const search = new URLSearchParams(params).toString();
	const url = `${ELECTION_API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}?${search}`;
	try {
		const res = await fetch(url);
		if (!res.ok) return [];
		const data: unknown = await res.json();
		if (Array.isArray(data)) return data as T[];
		if (data && typeof data === 'object' && 'data' in data) {
			const inner = (data as { data: unknown }).data;
			if (Array.isArray(inner)) return inner as T[];
		}
		return [];
	} catch {
		return [];
	}
}

export function buildPageUrls(
	baseUrl: string,
	racesByState: Map<string, Array<{ slug?: string }>>,
	samplePerState: number,
): string[] {
	const urls: string[] = [];
	for (const races of racesByState.values()) {
		const seen = new Set<string>();
		let count = 0;
		for (const r of races) {
			if (count >= samplePerState) break;
			if (!r.slug) continue;
			const parts = r.slug.split('/');
			const positionSlug = parts.pop();
			if (!positionSlug) continue;
			const prefix = parts.join('/');
			const path = `/elections/${prefix}/position/${positionSlug}`;
			if (seen.has(path)) continue;
			seen.add(path);
			urls.push(`${baseUrl}${path}`);
			urls.push(`${baseUrl}${path}/candidates`);
			count += 2;
		}
	}
	return urls;
}

export function buildStatePageUrls(baseUrl: string, states: string[]): string[] {
	return states.map((state) => `${baseUrl}/elections/${state.toLowerCase()}`);
}

export function extractTitleAndDescription(html: string): { title?: string; description?: string } {
	const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
	const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
	return {
		title: titleMatch?.[1]?.trim(),
		description: descMatch?.[1]?.trim(),
	};
}

export function checkContent(text: string): string[] {
	const invalid: string[] = [];
	for (const re of BAD_PATTERNS) {
		const match = text.match(re);
		if (match) invalid.push(match[0] ?? String(re));
	}
	return invalid;
}

export function checkStatePageFactsContent(url: string, html: string): string[] {
	const invalid: string[] = [];
	const path = (() => {
		try {
			return new URL(url).pathname;
		} catch {
			return '';
		}
	})();
	const stateMatch = path.match(/^\/elections\/([a-z]{2})\/?$/i);
	if (!stateMatch) return invalid;
	const state = stateMatch[1]!.toUpperCase();
	if (STATE_FACTS_MARKER.test(html)) {
		invalid.push('Location Facts Block section marker found');
	}
	const factsHeading = new RegExp(`>${state}\\s*facts<`, 'i');
	const stateNameHeading = new RegExp(`>\\s*[A-Za-z\\s]+\\s+facts\\s*<`, 'i');
	if (factsHeading.test(html) || stateNameHeading.test(html)) {
		invalid.push('State facts heading found');
	}
	return invalid;
}

export type CheckedPage = { result: PageCheckResult; error?: string };

export function categorizeResults(checked: CheckedPage[]): {
	summary: ElectionPageReport['summary'];
	invalid: PageCheckResult[];
	errors: Array<{ url: string; error: string }>;
} {
	const errors: Array<{ url: string; error: string }> = [];
	const invalid: PageCheckResult[] = [];

	for (const item of checked) {
		if (item.error !== undefined) {
			errors.push({ url: item.result.url, error: item.error });
		} else if (item.result.invalid.length > 0) {
			invalid.push(item.result);
		}
	}

	const total = checked.length;
	const errorsCount = errors.length;
	const invalidCount = invalid.length;
	const valid = total - errorsCount - invalidCount;

	return {
		summary: { total, valid, invalid: invalidCount, errors: errorsCount },
		invalid,
		errors,
	};
}

async function checkPage(
	url: string,
	timeoutMs: number,
	mode: 'positions' | 'state-pages',
): Promise<{ result: PageCheckResult; error?: string }> {
	const start = Date.now();
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
		const res = await fetch(url, { signal: controller.signal });
		clearTimeout(timeoutId);
		const durationMs = Date.now() - start;

		if (!res.ok) {
			return {
				result: {
					url,
					status: res.status,
					durationMs,
					invalid: [`HTTP ${res.status}`],
				},
			};
		}

		const html = await res.text();
		const { title, description } = extractTitleAndDescription(html);
		const combined = [title, description].filter(Boolean).join(' ');
		const invalid = mode === 'state-pages'
			? checkStatePageFactsContent(url, html)
			: checkContent(combined);

		return {
			result: {
				url,
				status: res.status,
				durationMs,
				title,
				description,
				invalid,
			},
		};
	} catch (err) {
		return {
			result: {
				url,
				status: 0,
				durationMs: Date.now() - start,
				invalid: ['fetch failed'],
			},
			error: err instanceof Error ? err.message : String(err),
		};
	}
}

async function runWithPool<T, R>(
	items: T[],
	concurrency: number,
	fn: (item: T) => Promise<R>,
): Promise<R[]> {
	const results: R[] = [];
	let idx = 0;

	async function worker(): Promise<void> {
		while (idx < items.length) {
			const i = idx++;
			const item = items[i];
			if (item === undefined) break;
			const r = await fn(item);
			results[i] = r;
		}
	}

	const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
	await Promise.all(workers);
	return results;
}

async function main(): Promise<void> {
	const { baseUrl, states, concurrency, samplePerState, mode } = parseArgs();

	console.log(`Base URL: ${baseUrl}`);
	console.log(`States: ${states.join(', ')}`);
	console.log(`Mode: ${mode}`);
	if (mode === 'positions') {
		console.log(`Sample per state: ${samplePerState}`);
	}

	let urls: string[] = [];
	if (mode === 'positions') {
		const racesByState = new Map<string, Array<{ slug?: string }>>();
		for (const state of states) {
			const races = await fetchElectionJson<{ slug?: string }>('v1/races', {
				state,
				raceColumns: 'slug',
			});
			racesByState.set(state, races);
		}
		urls = buildPageUrls(baseUrl, racesByState, samplePerState);
	} else {
		urls = buildStatePageUrls(baseUrl, states);
	}
	console.log(`Checking ${urls.length} pages...`);

	const start = Date.now();
	const checked = await runWithPool(urls, concurrency, url =>
		checkPage(url, DEFAULT_TIMEOUT_MS, mode),
	);
	const durationMs = Date.now() - start;

	const { summary, invalid, errors } = categorizeResults(checked);

	const report: ElectionPageReport = {
		baseUrl,
		timestamp: new Date().toISOString(),
		durationMs,
		summary,
		invalid,
		errors,
	};

	const reportDir = join(process.cwd(), '.reports', 'sitemaps');
	await mkdir(reportDir, { recursive: true });
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
	const outPath = join(reportDir, `election-page-report-${timestamp}.json`);
	await writeFile(outPath, JSON.stringify(report, null, 2), 'utf-8');
	console.log(`Report written to ${outPath}`);

	console.log(`\nSummary: ${report.summary.valid} valid, ${report.summary.invalid} invalid, ${report.summary.errors} errors`);

	if (invalid.length > 0) {
		console.log('\nInvalid pages (first 10):');
		for (const r of invalid.slice(0, 10)) {
			console.log(`  ${r.url}`);
			console.log(`    Patterns: ${r.invalid.join(', ')}`);
		}
	}

	if (invalid.length > 0 || errors.length > 0) {
		process.exit(1);
	}
}

if (import.meta.main) {
	main().catch(err => {
		console.error(err);
		process.exit(1);
	});
}
