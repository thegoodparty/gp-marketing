/**
 * Validates URLs in a sitemap by making HEAD requests.
 * Usage: bun run scripts/validate-sitemap-urls.ts [sitemap-url] [--concurrency N] [--timeout N] [--dry-run] [--trace-redirects] [--redirect-handling remove|replace|keep] [--max-redirects N] [--no-follow-redirects]
 *
 * redirect-handling:
 *   remove  - treat redirects as invalid (for pruning)
 *   replace - add replacements (from->to) to report; use prune --apply-replacements to update sitemaps
 *   keep    - leave redirects as separate category (default)
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DEFAULT_SITEMAP_URL = 'https://goodparty.org/sitemap.xml';
const DEFAULT_CONCURRENCY = 20;
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_REDIRECTS = 5;

export interface ValidationResult {
	url: string;
	status: number | null;
	durationMs: number;
	error?: string;
	redirectChain?: Array<{ url: string; status: number }>;
	finalUrl?: string;
	finalStatus?: number;
}

export interface ValidationReport {
	sitemapUrl: string;
	timestamp: string;
	durationMs: number;
	summary: {
		total: number;
		valid: number;
		redirects: number;
		clientErrors: number;
		serverErrors: number;
		networkFailures: number;
	};
	invalid: ValidationResult[];
	redirects: ValidationResult[];
	all: ValidationResult[];
	/** When redirectHandling=replace: URLs to replace in sitemaps (from -> to) */
	replacements?: Array<{ from: string; to: string }>;
}

export interface ValidateUrlOpts {
	timeout: number;
	traceRedirects: boolean;
	maxRedirects: number;
	noFollowRedirects: boolean;
}

function parseArgs(): {
	sitemapUrl: string;
	concurrency: number;
	timeout: number;
	dryRun: boolean;
	traceRedirects: boolean;
	redirectHandling: 'remove' | 'replace' | 'keep';
	maxRedirects: number;
	noFollowRedirects: boolean;
} {
	const args = process.argv.slice(2);
	let sitemapUrl = DEFAULT_SITEMAP_URL;
	let concurrency = DEFAULT_CONCURRENCY;
	let timeout = DEFAULT_TIMEOUT_MS;
	let dryRun = false;
	let traceRedirects = false;
	let redirectHandling: 'remove' | 'replace' | 'keep' = 'remove';
	let maxRedirects = DEFAULT_MAX_REDIRECTS;
	let noFollowRedirects = false;

	for (let i = 0; i < args.length; i++) {
		const arg = args[i] ?? '';
		if (arg === '--concurrency' && args[i + 1]) {
			concurrency = Number.parseInt(args[i + 1]!, 10);
			i++;
		} else if (arg === '--timeout' && args[i + 1]) {
			timeout = Number.parseInt(args[i + 1]!, 10);
			i++;
		} else if (arg === '--dry-run') {
			dryRun = true;
		} else if (arg === '--trace-redirects') {
			traceRedirects = true;
		} else if (arg === '--redirect-handling' && args[i + 1]) {
			const v = args[++i] as string;
			if (v === 'remove' || v === 'replace' || v === 'keep') redirectHandling = v;
		} else if (arg === '--max-redirects' && args[i + 1]) {
			maxRedirects = Number.parseInt(args[i + 1]!, 10) || DEFAULT_MAX_REDIRECTS;
			i++;
		} else if (arg === '--no-follow-redirects') {
			noFollowRedirects = true;
		} else if (!arg.startsWith('--') && arg.startsWith('http')) {
			sitemapUrl = arg;
		}
	}

	return {
		sitemapUrl,
		concurrency,
		timeout,
		dryRun,
		traceRedirects,
		redirectHandling,
		maxRedirects,
		noFollowRedirects,
	};
}

export async function fetchSitemapUrls(sitemapUrl: string): Promise<string[]> {
	const res = await fetch(sitemapUrl);
	if (!res.ok) {
		throw new Error(`Failed to fetch sitemap: ${res.status} ${res.statusText}`);
	}
	const xml = await res.text();
	const locRegex = /<loc>([^<]+)<\/loc>/g;
	const urls: string[] = [];
	let match: RegExpExecArray | null;
	while ((match = locRegex.exec(xml)) !== null) {
		urls.push(match[1]!.trim());
	}
	return urls;
}

export async function validateUrl(
	url: string,
	opts: Partial<ValidateUrlOpts> & { timeout: number },
): Promise<ValidationResult> {
	const start = Date.now();
	const maxRedirects = opts.maxRedirects ?? DEFAULT_MAX_REDIRECTS;
	const noFollow = opts.noFollowRedirects ?? false;
	const traceRedirects = opts.traceRedirects ?? false;

		if (noFollow || !traceRedirects) {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), opts.timeout);
			let res = await fetch(url, {
				method: 'HEAD',
				redirect: noFollow ? 'manual' : 'follow',
				signal: controller.signal,
			});
			clearTimeout(timeoutId);

			if (res.status === 405 || res.status === 501) {
				const getController = new AbortController();
				const getTimeoutId = setTimeout(() => getController.abort(), opts.timeout);
				res = await fetch(url, {
					method: 'GET',
					redirect: noFollow ? 'manual' : 'follow',
					signal: getController.signal,
				});
				clearTimeout(getTimeoutId);
			}

			const finalUrl = !noFollow && res.url && res.url !== url ? res.url : undefined;
			return {
				url,
				status: res.status,
				durationMs: Date.now() - start,
				finalUrl,
			};
		} catch (err) {
			return {
				url,
				status: null,
				durationMs: Date.now() - start,
				error: err instanceof Error ? err.message : String(err),
			};
		}
	}

	const chain: Array<{ url: string; status: number }> = [];
	const seen = new Set<string>();
	let currentUrl = url;

	for (let hop = 0; hop < maxRedirects; hop++) {
		if (seen.has(currentUrl)) {
			return {
				url,
				status: null,
				durationMs: Date.now() - start,
				error: 'Circular redirect detected',
				redirectChain: chain,
				finalUrl: currentUrl,
			};
		}
		seen.add(currentUrl);

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), opts.timeout);

			let res = await fetch(currentUrl, {
				method: 'HEAD',
				redirect: 'manual',
				signal: controller.signal,
			});
			clearTimeout(timeoutId);

			if (res.status === 405 || res.status === 501) {
				const getController = new AbortController();
				const getTimeoutId = setTimeout(() => getController.abort(), opts.timeout);
				res = await fetch(currentUrl, {
					method: 'GET',
					redirect: 'manual',
					signal: getController.signal,
				});
				clearTimeout(getTimeoutId);
			}

			if (res.status >= 300 && res.status < 400) {
				const location = res.headers.get('location');
				if (location) {
					chain.push({ url: currentUrl, status: res.status });
					currentUrl = new URL(location, currentUrl).href;
					continue;
				}
			}

			return {
				url,
				status: res.status,
				durationMs: Date.now() - start,
				redirectChain: chain.length > 0 ? chain : undefined,
				finalUrl: chain.length > 0 ? currentUrl : undefined,
				finalStatus: res.status,
			};
		} catch (err) {
			return {
				url,
				status: null,
				durationMs: Date.now() - start,
				error: err instanceof Error ? err.message : String(err),
				redirectChain: chain.length > 0 ? chain : undefined,
				finalUrl: chain.length > 0 ? currentUrl : undefined,
			};
		}
	}

	return {
		url,
		status: null,
		durationMs: Date.now() - start,
		error: 'Max redirect hops exceeded',
		redirectChain: chain,
		finalUrl: currentUrl,
	};
}

export async function runWithConcurrency<T, R>(
	items: T[],
	concurrency: number,
	fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
	const results: R[] = new Array(items.length);
	let nextIndex = 0;

	async function worker(): Promise<void> {
		while (nextIndex < items.length) {
			const index = nextIndex++;
			const item = items[index]!;
			results[index] = await fn(item, index);
		}
	}

	const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
	await Promise.all(workers);
	return results;
}

export function categorizeResults(results: ValidationResult[]): {
	valid: ValidationResult[];
	redirects: ValidationResult[];
	invalid: ValidationResult[];
} {
	const valid: ValidationResult[] = [];
	const redirects: ValidationResult[] = [];
	const invalid: ValidationResult[] = [];

	for (const r of results) {
		if (r.error || r.status === null) {
			invalid.push(r);
		} else if (r.status >= 300 && r.status < 400) {
			redirects.push(r);
		} else if (r.status === 200) {
			valid.push(r);
		} else {
			invalid.push(r);
		}
	}

	return { valid, redirects, invalid };
}

export function buildReport(
	sitemapUrl: string,
	results: ValidationResult[],
	durationMs: number,
	redirectHandling: 'remove' | 'replace' | 'keep' = 'keep',
): ValidationReport {
	let { valid, redirects, invalid } = categorizeResults(results);
	const replacements: Array<{ from: string; to: string }> = [];

	if (redirectHandling === 'remove') {
		invalid = [...invalid, ...redirects];
		redirects = [];
	} else if (redirectHandling === 'replace') {
		for (const r of [...valid, ...redirects]) {
			if (r.finalUrl && r.finalUrl !== r.url) {
				replacements.push({ from: r.url, to: r.finalUrl });
			}
		}
	}

	return {
		sitemapUrl,
		timestamp: new Date().toISOString(),
		durationMs,
		summary: {
			total: results.length,
			valid: valid.length,
			redirects: redirects.length,
			clientErrors: invalid.filter((r) => r.status !== null && r.status >= 400 && r.status < 500).length,
			serverErrors: invalid.filter((r) => r.status !== null && r.status >= 500).length,
			networkFailures: invalid.filter((r) => r.status === null).length,
		},
		invalid,
		redirects,
		all: results,
		...(replacements.length > 0 && { replacements }),
	};
}

function printSummary(report: ValidationReport): void {
	const s = report.summary;
	console.log('\n--- Sitemap validation summary ---');
	console.log(`Sitemap: ${report.sitemapUrl}`);
	console.log(`Duration: ${(report.durationMs / 1000).toFixed(1)}s`);
	console.log(`Total URLs: ${s.total}`);
	console.log(`Valid (200): ${s.valid}`);
	console.log(`Redirects (3xx): ${s.redirects}`);
	console.log(`Client errors (4xx): ${s.clientErrors}`);
	console.log(`Server errors (5xx): ${s.serverErrors}`);
	console.log(`Network failures: ${s.networkFailures}`);
	console.log('---------------------------------\n');

	if (report.replacements && report.replacements.length > 0) {
		console.log(`Replacements (${report.replacements.length}): run prune with --apply-replacements to update sitemaps`);
		for (const r of report.replacements.slice(0, 5)) {
			console.log(`  ${r.from} -> ${r.to}`);
		}
		if (report.replacements.length > 5) {
			console.log(`  ... and ${report.replacements.length - 5} more`);
		}
	}

	if (report.invalid.length > 0) {
		console.log('Invalid URLs (first 20):');
		for (const r of report.invalid.slice(0, 20)) {
			console.log(`  ${r.url} -> ${r.status ?? r.error}`);
		}
		if (report.invalid.length > 20) {
			console.log(`  ... and ${report.invalid.length - 20} more`);
		}
	}
}

export interface RunValidationOpts {
	redirectHandling: 'remove' | 'replace' | 'keep';
	maxRedirects: number;
	noFollowRedirects: boolean;
}

/**
 * Runs validation on a list of URLs (e.g. from generate-sitemaps). Writes report to public/sitemaps/.
 */
export async function runValidationFromGenerate(
	urls: string[],
	opts: RunValidationOpts,
): Promise<void> {
	const REPORT_DIR = join(process.cwd(), '.reports', 'sitemaps');
	const CONCURRENCY = 20;
	const TIMEOUT_MS = 10_000;

	await mkdir(REPORT_DIR, { recursive: true });

	const traceRedirects = !opts.noFollowRedirects;
	let completed = 0;
	const total = urls.length;
	const progressInterval = Math.max(1, Math.floor(total / 10));

	const start = Date.now();
	const results = await runWithConcurrency(urls, CONCURRENCY, async (url) => {
		const result = await validateUrl(url, {
			timeout: TIMEOUT_MS,
			traceRedirects,
			maxRedirects: opts.maxRedirects,
			noFollowRedirects: opts.noFollowRedirects,
		});
		completed++;
		if (completed % progressInterval === 0 || completed === total) {
			const pct = Math.round((completed / total) * 100);
			console.log(`Progress: ${pct}% (${completed}/${total})`);
		}
		return result;
	});

	const durationMs = Date.now() - start;
	const report = buildReport('(generated)', results, durationMs, opts.redirectHandling);

	const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
	const outPath = join(REPORT_DIR, `validation-report-${timestamp}.json`);
	await writeFile(outPath, JSON.stringify(report, null, 2), 'utf-8');
	console.log(`Validation report: ${outPath}`);

	printSummary(report);
}

async function main(): Promise<void> {
	const {
		sitemapUrl,
		concurrency,
		timeout,
		dryRun,
		traceRedirects,
		redirectHandling,
		maxRedirects,
		noFollowRedirects,
	} = parseArgs();

	console.log(`Fetching sitemap from ${sitemapUrl}...`);
	const urls = await fetchSitemapUrls(sitemapUrl);
	console.log(`Found ${urls.length} URLs`);

	if (dryRun) {
		console.log('Dry run - skipping validation');
		return;
	}

	console.log(`Validating with concurrency=${concurrency}, timeout=${timeout}ms...`);
	const start = Date.now();

	let completed = 0;
	const total = urls.length;
	const progressInterval = Math.max(1, Math.floor(total / 10));

	const results = await runWithConcurrency(urls, concurrency, async (url) => {
		const result = await validateUrl(url, {
			timeout,
			traceRedirects,
			maxRedirects,
			noFollowRedirects,
		});
		completed++;
		if (completed % progressInterval === 0 || completed === total) {
			const pct = Math.round((completed / total) * 100);
			console.log(`Progress: ${pct}% (${completed}/${total})`);
		}
		return result;
	});

	const durationMs = Date.now() - start;
	const report = buildReport(sitemapUrl, results, durationMs, redirectHandling);

	const outDir = join(process.cwd(), '.reports', 'sitemaps');
	await mkdir(outDir, { recursive: true });
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
	const outPath = join(outDir, `validation-report-${timestamp}.json`);
	await writeFile(outPath, JSON.stringify(report, null, 2), 'utf-8');
	console.log(`Report written to ${outPath}`);

	printSummary(report);
}

if (import.meta.main) {
	main().catch((err) => {
		console.error(err);
		process.exit(1);
	});
}
