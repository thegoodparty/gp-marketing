#!/usr/bin/env bun
/**
 * Post-deploy smoke crawl.
 *
 * Fetches the sitemap, samples a configurable number of URLs, then for each
 * sampled page:
 *   1. Asserts HTTP 200.
 *   2. Asserts at least one <h1> is present in the HTML.
 *   3. Collects every internal <a href> on the page and records any that
 *      return a non-200 response (broken internal link check).
 *
 * Usage:
 *   bun run smoke https://goodparty.org
 *   bun run smoke https://preview-branch.vercel.app --sample 50
 *   bun run smoke https://goodparty.org --sample all   (every URL — slow)
 *   bun run smoke https://goodparty.org --concurrency 5 --timeout 20000
 *
 * Environment variables (override flags):
 *   SMOKE_BASE_URL      Base URL (overrides positional argument)
 *   SMOKE_SAMPLE        Number of URLs to sample or "all" (default: 100)
 *   SMOKE_CONCURRENCY   Concurrent GET requests (default: 8)
 *   SMOKE_TIMEOUT_MS    Per-request timeout in ms (default: 15000)
 *
 * Exit code: 0 if all checks pass, 1 if any check fails.
 */

import { runWithConcurrency } from './validate-sitemap-urls';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

function parseArgs(): {
	baseUrl: string;
	sample: number | 'all';
	concurrency: number;
	timeoutMs: number;
} {
	const args = process.argv.slice(2);
	let baseUrl = process.env['SMOKE_BASE_URL'] ?? '';
	let sample: number | 'all' = Number(process.env['SMOKE_SAMPLE']) || 100;
	let concurrency = Number(process.env['SMOKE_CONCURRENCY']) || 8;
	let timeoutMs = Number(process.env['SMOKE_TIMEOUT_MS']) || 15_000;

	for (let i = 0; i < args.length; i++) {
		const arg = args[i] ?? '';
		if (arg.startsWith('http')) {
			baseUrl = arg;
		} else if (arg === '--sample' && args[i + 1]) {
			const v = args[++i]!;
			sample = v === 'all' ? 'all' : (Number.parseInt(v, 10) || 100);
		} else if (arg === '--concurrency' && args[i + 1]) {
			concurrency = Number.parseInt(args[++i]!, 10) || 8;
		} else if (arg === '--timeout' && args[i + 1]) {
			timeoutMs = Number.parseInt(args[++i]!, 10) || 15_000;
		}
	}

	if (!baseUrl) {
		console.error('Error: base URL is required.\n  Usage: bun run smoke https://goodparty.org');
		process.exit(1);
	}

	return { baseUrl: baseUrl.replace(/\/+$/, ''), sample, concurrency, timeoutMs };
}

// ---------------------------------------------------------------------------
// Sitemap fetching
// ---------------------------------------------------------------------------

async function fetchSitemapIndex(sitemapUrl: string): Promise<string[]> {
	const res = await fetch(sitemapUrl);
	if (!res.ok) throw new Error(`Sitemap index fetch failed: ${res.status} ${res.url}`);
	const xml = await res.text();

	// If it's a sitemapindex, fetch all child sitemaps.
	if (xml.includes('<sitemapindex')) {
		const childUrls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]!.trim());
		const pageUrlArrays = await Promise.all(childUrls.map(u => fetchPageUrls(u)));
		return pageUrlArrays.flat();
	}

	// Otherwise it's a urlset directly.
	return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]!.trim());
}

async function fetchPageUrls(sitemapUrl: string): Promise<string[]> {
	try {
		const res = await fetch(sitemapUrl);
		if (!res.ok) return [];
		const xml = await res.text();
		return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]!.trim());
	} catch {
		return [];
	}
}

// ---------------------------------------------------------------------------
// Sampling
// ---------------------------------------------------------------------------

function sample<T>(arr: T[], n: number): T[] {
	if (n >= arr.length) return [...arr];
	// Fisher-Yates partial shuffle for a uniform random sample.
	const copy = [...arr];
	for (let i = 0; i < n; i++) {
		const j = i + Math.floor(Math.random() * (copy.length - i));
		[copy[i], copy[j]] = [copy[j]!, copy[i]!];
	}
	return copy.slice(0, n);
}

// ---------------------------------------------------------------------------
// Page checks
// ---------------------------------------------------------------------------

interface PageResult {
	url: string;
	status: number | null;
	hasH1: boolean;
	error?: string;
	brokenLinks: BrokenLink[];
}

interface BrokenLink {
	href: string;
	status: number | null;
	error?: string;
}

function extractH1(html: string): boolean {
	return /<h1[\s>]/i.test(html);
}

function extractInternalLinks(html: string, origin: string): string[] {
	const hrefs = new Set<string>();
	const re = /href="([^"]+)"/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(html)) !== null) {
		const raw = m[1]!.trim();
		try {
			// Resolve relative paths against origin.
			const resolved = new URL(raw, origin);
			// Only keep same-origin paths; skip anchors, mailto, tel.
			if (resolved.origin === origin && !raw.startsWith('#')) {
				// Strip hash and query to avoid duplicate checks.
				hrefs.add(`${resolved.origin}${resolved.pathname}`);
			}
		} catch {
			// Ignore malformed hrefs.
		}
	}
	return [...hrefs];
}

async function fetchPage(
	url: string,
	timeoutMs: number,
): Promise<{ status: number | null; html: string; error?: string }> {
	try {
		const controller = new AbortController();
		const tid = setTimeout(() => controller.abort(), timeoutMs);
		const res = await fetch(url, {
			signal: controller.signal,
			headers: { Accept: 'text/html' },
		});
		clearTimeout(tid);
		const html = res.ok ? await res.text() : '';
		return { status: res.status, html };
	} catch (err) {
		return {
			status: null,
			html: '',
			error: err instanceof Error ? err.message : String(err),
		};
	}
}

async function checkLink(
	href: string,
	timeoutMs: number,
): Promise<{ status: number | null; error?: string }> {
	try {
		const controller = new AbortController();
		const tid = setTimeout(() => controller.abort(), timeoutMs);
		const res = await fetch(href, {
			method: 'HEAD',
			signal: controller.signal,
			redirect: 'follow',
		});
		clearTimeout(tid);
		if (res.status === 405) {
			// Server doesn't allow HEAD — try GET.
			const g = await fetch(href, {
				method: 'GET',
				signal: AbortSignal.timeout(timeoutMs),
				redirect: 'follow',
			});
			return { status: g.status };
		}
		return { status: res.status };
	} catch (err) {
		return {
			status: null,
			error: err instanceof Error ? err.message : String(err),
		};
	}
}

async function checkPage(
	url: string,
	origin: string,
	timeoutMs: number,
): Promise<PageResult> {
	const { status, html, error } = await fetchPage(url, timeoutMs);

	if (error || status === null) {
		return { url, status, hasH1: false, error, brokenLinks: [] };
	}

	const hasH1 = extractH1(html);
	const internalLinks = extractInternalLinks(html, origin);

	// Check all internal links found on this page (HEAD requests, fast).
	const brokenLinks: BrokenLink[] = [];
	const linkResults = await runWithConcurrency(internalLinks, 8, href =>
		checkLink(href, timeoutMs),
	);
	for (let i = 0; i < internalLinks.length; i++) {
		const r = linkResults[i]!;
		if (r.status === null || r.status >= 400) {
			brokenLinks.push({ href: internalLinks[i]!, status: r.status ?? null, error: r.error });
		}
	}

	return { url, status, hasH1, brokenLinks };
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

function printReport(results: PageResult[], durationMs: number, sampleSize: number | 'all'): boolean {
	const statusFails = results.filter(r => r.status !== 200);
	const h1Fails = results.filter(r => r.status === 200 && !r.hasH1);
	const linkFails = results.filter(r => r.brokenLinks.length > 0);
	const totalBrokenLinks = results.reduce((n, r) => n + r.brokenLinks.length, 0);

	const pass = statusFails.length === 0 && h1Fails.length === 0 && totalBrokenLinks === 0;

	console.log('\n--- Smoke crawl summary ---');
	console.log(`Sample: ${results.length} of ${sampleSize === 'all' ? 'all' : sampleSize} URLs`);
	console.log(`Duration: ${(durationMs / 1000).toFixed(1)}s`);
	console.log(`Status checks:    ${results.length - statusFails.length}/${results.length} passed`);
	console.log(`h1 checks:        ${results.filter(r => r.status === 200).length - h1Fails.length}/${results.filter(r => r.status === 200).length} passed`);
	console.log(`Broken int. links: ${totalBrokenLinks} across ${linkFails.length} pages`);
	console.log('---------------------------');

	if (statusFails.length > 0) {
		console.error(`\nSTATUS FAILURES (${statusFails.length}):`);
		for (const r of statusFails.slice(0, 20)) {
			console.error(`  ${r.url}  →  ${r.status ?? r.error}`);
		}
		if (statusFails.length > 20) console.error(`  … and ${statusFails.length - 20} more`);
	}

	if (h1Fails.length > 0) {
		console.error(`\nMISSING H1 (${h1Fails.length}):`);
		for (const r of h1Fails.slice(0, 20)) {
			console.error(`  ${r.url}`);
		}
		if (h1Fails.length > 20) console.error(`  … and ${h1Fails.length - 20} more`);
	}

	if (totalBrokenLinks > 0) {
		console.error(`\nBROKEN INTERNAL LINKS (${totalBrokenLinks} across ${linkFails.length} pages):`);
		for (const r of linkFails.slice(0, 10)) {
			console.error(`  ${r.url}`);
			for (const l of r.brokenLinks.slice(0, 5)) {
				console.error(`    → ${l.href}  [${l.status ?? l.error}]`);
			}
		}
		if (linkFails.length > 10) console.error(`  … and ${linkFails.length - 10} more pages with broken links`);
	}

	if (pass) {
		console.log('\nAll checks passed.');
	} else {
		console.error('\nSmoke crawl FAILED — see errors above.');
	}

	return pass;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
	const { baseUrl, sample: sampleSize, concurrency, timeoutMs } = parseArgs();
	const origin = new URL(baseUrl).origin;
	const sitemapUrl = `${baseUrl}/sitemap.xml`;

	console.log(`Fetching sitemap from ${sitemapUrl}…`);
	const allUrls = await fetchSitemapIndex(sitemapUrl);
	console.log(`Found ${allUrls.length} URLs in sitemap.`);

	if (allUrls.length === 0) {
		console.error('No URLs found in sitemap — aborting.');
		process.exit(1);
	}

	const urls = sampleSize === 'all' ? allUrls : sample(allUrls, sampleSize);
	console.log(`Checking ${urls.length} URLs (concurrency=${concurrency}, timeout=${timeoutMs}ms)…`);

	const start = Date.now();
	let done = 0;

	const results = await runWithConcurrency(urls, concurrency, async url => {
		const result = await checkPage(url, origin, timeoutMs);
		done++;
		if (done % 10 === 0 || done === urls.length) {
			process.stdout.write(`\r  Progress: ${done}/${urls.length}`);
		}
		return result;
	});
	console.log(''); // newline after progress line

	const durationMs = Date.now() - start;
	const pass = printReport(results, durationMs, sampleSize);

	process.exit(pass ? 0 : 1);
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});
