#!/usr/bin/env bun
/**
 * Validates election page content for display name regressions (e.g. "buckeye County" for city of Buckeye).
 * Fetches race slugs from Election API, GETs rendered pages, checks title/meta for anti-patterns.
 *
 * Usage: bun run scripts/validate-election-pages.ts [--base-url URL] [--states AZ,AL,CA] [--concurrency N] [--sample N]
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { US_STATE_CODES } from '../src/lib/sitemap-entries';

const DEFAULT_BASE_URL = 'https://goodparty.org';
const DEFAULT_CONCURRENCY = 10;
const DEFAULT_SAMPLE_PER_STATE = 20;
const DEFAULT_TIMEOUT_MS = 15_000;

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
} {
	const args = process.argv.slice(2);
	let baseUrl = DEFAULT_BASE_URL;
	let states: string[] = [];
	let concurrency = DEFAULT_CONCURRENCY;
	let samplePerState = DEFAULT_SAMPLE_PER_STATE;

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
		}
	}

	if (states.length === 0) {
		const shuffled = [...US_STATE_CODES].sort(() => Math.random() - 0.5);
		states = shuffled.slice(0, 3).filter(Boolean);
	}

	return { baseUrl, states, concurrency, samplePerState };
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

function buildPageUrls(
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

function extractTitleAndDescription(html: string): { title?: string; description?: string } {
	const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
	const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
	return {
		title: titleMatch?.[1]?.trim(),
		description: descMatch?.[1]?.trim(),
	};
}

function checkContent(text: string): string[] {
	const invalid: string[] = [];
	for (const re of BAD_PATTERNS) {
		const match = text.match(re);
		if (match) invalid.push(match[0] ?? String(re));
	}
	return invalid;
}

async function checkPage(
	url: string,
	timeoutMs: number,
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
		const invalid = checkContent(combined);

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

async function runWithConcurrency<T, R>(
	items: T[],
	concurrency: number,
	fn: (item: T) => Promise<R>,
): Promise<R[]> {
	const results: R[] = [];
	const executing: Promise<void>[] = [];
	for (const item of items) {
		const p = fn(item).then(r => {
			results.push(r);
		});
		executing.push(p);
		if (executing.length >= concurrency) {
			await Promise.race(executing);
			for (let i = executing.length - 1; i >= 0; i--) {
				const status = await Promise.race(executing.map(e => e.then(() => 'done').catch(() => 'done')));
				// Remove settled promises
				const stillPending = executing.filter(e => {
					let settled = false;
					e.then(() => { settled = true; }).catch(() => { settled = true; });
					return !settled;
				});
				// Simpler: just await any one to finish
				break;
			}
			// Simpler approach: use a pool
		}
	}
	await Promise.all(executing);
	return results;
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
	const { baseUrl, states, concurrency, samplePerState } = parseArgs();

	console.log(`Base URL: ${baseUrl}`);
	console.log(`States: ${states.join(', ')}`);
	console.log(`Sample per state: ${samplePerState}`);

	const racesByState = new Map<string, Array<{ slug?: string }>>();
	for (const state of states) {
		const races = await fetchElectionJson<{ slug?: string }>('v1/races', {
			state,
			raceColumns: 'slug',
		});
		racesByState.set(state, races);
	}

	const urls = buildPageUrls(baseUrl, racesByState, samplePerState);
	console.log(`Checking ${urls.length} pages...`);

	const start = Date.now();
	const checked = await runWithPool(urls, concurrency, url =>
		checkPage(url, DEFAULT_TIMEOUT_MS),
	);
	const durationMs = Date.now() - start;

	const invalid: PageCheckResult[] = [];
	const errors: Array<{ url: string; error: string }> = [];

	for (const { result, error } of checked) {
		if (error) {
			errors.push({ url: result.url, error });
		}
		if (result.invalid.length > 0) {
			invalid.push(result);
		}
	}

	const valid = checked.length - invalid.length - errors.length;
	const report: ElectionPageReport = {
		baseUrl,
		timestamp: new Date().toISOString(),
		durationMs,
		summary: {
			total: checked.length,
			valid,
			invalid: invalid.length,
			errors: errors.length,
		},
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

main().catch(err => {
	console.error(err);
	process.exit(1);
});
