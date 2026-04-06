/**
 * Integration test: validates every URL in every child sitemap resolves to HTTP 200.
 *
 * This test prevents regressions like the 3,627-URL 404 incident by exhaustively
 * checking that every URL the sitemap advertises to search engines actually exists.
 *
 * Usage:
 *   SITEMAP_BASE_URL=https://goodparty.org bun test integration/validate-sitemap-urls.test.ts
 *   SITEMAP_BASE_URL=http://localhost:3009 bun test integration/validate-sitemap-urls.test.ts
 *
 * Environment variables:
 *   SITEMAP_BASE_URL     Required. Base URL to validate against.
 *   SITEMAP_CONCURRENCY  Concurrent requests per sitemap (default: 20)
 *   SITEMAP_TIMEOUT_MS   Per-request timeout in ms (default: 10000)
 *
 * CI recommendation: do NOT run this on every PR — it hits a live site and takes
 * 30–60 minutes. Run nightly on a schedule and/or manually after deploys.
 */

import { describe, test } from 'bun:test';
import {
	fetchSitemapUrls,
	validateUrl,
	runWithConcurrency,
	type ValidationResult,
} from '../scripts/validate-sitemap-urls';
import { getSitemapIds, US_STATE_CODES } from '../src/lib/sitemap-entries';

const BASE_URL = (() => {
	const url = process.env['SITEMAP_BASE_URL'];
	if (!url) {
		throw new Error(
			'SITEMAP_BASE_URL env var is required.\n' +
				'Example: SITEMAP_BASE_URL=https://goodparty.org bun test integration/validate-sitemap-urls.test.ts',
		);
	}
	return url.replace(/\/+$/, '');
})();

const CONCURRENCY = Number(process.env['SITEMAP_CONCURRENCY']) || 20;
const TIMEOUT_MS = Number(process.env['SITEMAP_TIMEOUT_MS']) || 10_000;

function sitemapLabel(id: number): string {
	if (id === 0) return 'main';
	if (id <= US_STATE_CODES.length) return `elections/${US_STATE_CODES[id - 1]}`;
	const i = id - US_STATE_CODES.length - 1;
	return `candidates/${US_STATE_CODES[i] ?? id}`;
}

function formatFailureReport(
	failures: ValidationResult[],
	total: number,
	id: number,
	label: string,
): string {
	const byStatus = new Map<string, string[]>();
	for (const f of failures) {
		const key = f.error ? 'network-error' : String(f.status);
		const entry = f.error
			? `${f.url}  [${f.error}]`
			: f.finalUrl
				? `${f.url}  [→ ${f.finalUrl}]`
				: f.url;
		const bucket = byStatus.get(key) ?? [];
		bucket.push(entry);
		byStatus.set(key, bucket);
	}

	const lines: string[] = [
		`${failures.length}/${total} URLs failed in sitemap/${id}.xml (${label}):\n`,
	];
	for (const [status, urls] of byStatus) {
		lines.push(`  HTTP ${status} (${urls.length}):`);
		for (const u of urls.slice(0, 25)) lines.push(`    ${u}`);
		if (urls.length > 25) lines.push(`    … and ${urls.length - 25} more`);
		lines.push('');
	}
	return lines.join('\n');
}

const sitemapIds = getSitemapIds();

describe('Sitemap URL Resolution', () => {
	for (const { id } of sitemapIds) {
		const label = sitemapLabel(id);

		test(
			`sitemap/${id}.xml (${label}): all URLs return HTTP 200`,
			async () => {
				const urls = await fetchSitemapUrls(`${BASE_URL}/sitemap/${id}.xml`);

				// Empty sitemaps are valid — a state may have no candidates yet
				if (urls.length === 0) return;

				const results = await runWithConcurrency(urls, CONCURRENCY, (url) =>
					validateUrl(url, { timeout: TIMEOUT_MS }),
				);

				const failures = results.filter((r) => r.status !== 200);

				if (failures.length > 0) {
					throw new Error(formatFailureReport(failures, urls.length, id, label));
				}
			},
			// 5 minutes per sitemap — large states (CA, TX) can have thousands of URLs
			5 * 60_000,
		);
	}
});
