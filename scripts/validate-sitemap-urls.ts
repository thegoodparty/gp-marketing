/**
 * Validates all URLs in a sitemap by making HEAD requests.
 * Usage: bun run scripts/validate-sitemap-urls.ts [sitemap-url] [--concurrency N] [--timeout N] [--dry-run] [--trace-redirects]
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DEFAULT_SITEMAP_URL = 'https://goodparty.org/sitemap.xml';
const DEFAULT_CONCURRENCY = 20;
const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_REDIRECT_HOPS = 5;

interface ValidationResult {
	url: string;
	status: number | null;
	durationMs: number;
	error?: string;
	redirectChain?: Array<{ url: string; status: number }>;
	finalUrl?: string;
	finalStatus?: number;
}

interface ValidationReport {
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
}

function parseArgs(): {
	sitemapUrl: string;
	concurrency: number;
	timeout: number;
	dryRun: boolean;
	traceRedirects: boolean;
} {
	const args = process.argv.slice(2);
	let sitemapUrl = DEFAULT_SITEMAP_URL;
	let concurrency = DEFAULT_CONCURRENCY;
	let timeout = DEFAULT_TIMEOUT_MS;
	let dryRun = false;
	let traceRedirects = false;

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
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
		} else if (!arg.startsWith('--') && arg.startsWith('http')) {
			sitemapUrl = arg;
		}
	}

	return { sitemapUrl, concurrency, timeout, dryRun, traceRedirects };
}

async function fetchSitemapUrls(sitemapUrl: string): Promise<string[]> {
	const res = await fetch(sitemapUrl);
	if (!res.ok) {
		throw new Error(`Failed to fetch sitemap: ${res.status} ${res.statusText}`);
	}
	const xml = await res.text();
	// Regex-based parsing; does not handle CDATA, XML entities, or namespaced tags.
	const locRegex = /<loc>([^<]+)<\/loc>/g;
	const urls: string[] = [];
	let match: RegExpExecArray | null;
	while ((match = locRegex.exec(xml)) !== null) {
		urls.push(match[1]!.trim());
	}
	return urls;
}

async function validateUrl(
	url: string,
	opts: { timeout: number; traceRedirects: boolean },
): Promise<ValidationResult> {
	const start = Date.now();

	if (!opts.traceRedirects) {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), opts.timeout);
			let res = await fetch(url, {
				method: 'HEAD',
				redirect: 'follow',
				signal: controller.signal,
			});
			clearTimeout(timeoutId);

			if (res.status === 405 || res.status === 501) {
				const getController = new AbortController();
				const getTimeoutId = setTimeout(() => getController.abort(), opts.timeout);
				res = await fetch(url, { method: 'GET', redirect: 'follow', signal: getController.signal });
				clearTimeout(getTimeoutId);
			}

			return {
				url,
				status: res.status,
				durationMs: Date.now() - start,
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
	let currentUrl = url;

	for (let hop = 0; hop < MAX_REDIRECT_HOPS; hop++) {
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

async function runWithConcurrency<T, R>(
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

function categorizeResults(results: ValidationResult[]): {
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

function buildReport(
	sitemapUrl: string,
	results: ValidationResult[],
	durationMs: number,
): ValidationReport {
	const { valid, redirects, invalid } = categorizeResults(results);

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

async function main(): Promise<void> {
	const { sitemapUrl, concurrency, timeout, dryRun, traceRedirects } = parseArgs();

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

	const results = await runWithConcurrency(urls, concurrency, async (url, index) => {
		const result = await validateUrl(url, { timeout, traceRedirects });
		completed++;
		if (completed % progressInterval === 0 || completed === total) {
			const pct = Math.round((completed / total) * 100);
			console.log(`Progress: ${pct}% (${completed}/${total})`);
		}
		return result;
	});

	const durationMs = Date.now() - start;
	const report = buildReport(sitemapUrl, results, durationMs);

	const outDir = join(process.cwd(), '.reports', 'sitemaps');
	await mkdir(outDir, { recursive: true });
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
	const outPath = join(outDir, `validation-report-${timestamp}.json`);
	await writeFile(outPath, JSON.stringify(report, null, 2), 'utf-8');
	console.log(`Report written to ${outPath}`);

	printSummary(report);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
