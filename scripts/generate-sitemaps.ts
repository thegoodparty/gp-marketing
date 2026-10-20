#!/usr/bin/env npx tsx
/**
 * Offline sitemap generation.
 * `--people-shards-out <dir>` emits the /people band's per-shard XML files for
 * production serving -- the scheduled workflow (task 03) publishes them to S3.
 * Every other mode here (the default report-based run, `--main-only`,
 * `--people-only`, `--validate`) remains for validation and auditing only; the
 * Next.js dynamic routes handle the rest of production serving.
 * Usage: npx tsx scripts/generate-sitemaps.ts [--main-only] [--people-only] [--validate] [--redirect-handling remove|replace|keep] [--max-redirects N] [--no-follow-redirects]
 * Usage: npx tsx scripts/generate-sitemaps.ts --people-shards-out <dir> [--shard N]
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { convertToXML, generateRootIndex, type SitemapEntry, type SitemapIndexEntry } from './lib/xml';
import { getBaseUrl } from '../src/lib/url';
import {
	fetchPeopleShards,
	formatLastmod,
	isLocalBaseUrl,
	PEOPLE_SITEMAP_TOTAL_FLOOR,
	runPeopleShardGates,
	splitUrlsIntoChunks,
	writeSitemapFile,
} from './lib/sitemap-helpers';
import {
	fetchMainSitemapEntries,
	fetchStateElectionSitemapEntries,
	fetchPeopleSitemapEntries,
	PEOPLE_SITEMAP_SHARD_COUNT,
	PEOPLE_SITEMAP_SHARDS,
	US_STATE_CODES,
} from '../src/lib/sitemap-entries';

const REPORT_DIR = join(process.cwd(), '.reports', 'sitemaps');
const OUTPUT_DIR = join(REPORT_DIR, 'static');
const SITEMAPS_DIR = join(OUTPUT_DIR, 'sitemaps');

interface CliArgs {
	mainOnly: boolean;
	peopleOnly: boolean;
	validate: boolean;
	redirectHandling: 'remove' | 'replace' | 'keep';
	maxRedirects: number;
	noFollowRedirects: boolean;
	peopleShardsOut: string | null;
	shard: number | null;
}

function parseArgs(): CliArgs {
	const args = process.argv.slice(2);
	const result: CliArgs = {
		mainOnly: false,
		peopleOnly: false,
		validate: false,
		redirectHandling: 'remove',
		maxRedirects: 5,
		noFollowRedirects: false,
		peopleShardsOut: null,
		shard: null,
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === '--main-only') result.mainOnly = true;
		else if (arg === '--people-only') result.peopleOnly = true;
		else if (arg === '--validate') result.validate = true;
		else if (arg === '--redirect-handling' && args[i + 1]) {
			const v = args[++i] as string;
			if (v === 'remove' || v === 'replace' || v === 'keep') result.redirectHandling = v;
		} else if (arg === '--max-redirects' && args[i + 1]) {
			result.maxRedirects = Number.parseInt(args[++i]!, 10) || 5;
		} else if (arg === '--no-follow-redirects') result.noFollowRedirects = true;
		else if (arg === '--people-shards-out' && args[i + 1]) {
			result.peopleShardsOut = args[++i] as string;
		} else if (arg === '--shard' && args[i + 1]) {
			result.shard = Number.parseInt(args[++i]!, 10);
		}
	}

	if (result.mainOnly && result.peopleOnly) {
		console.error('--main-only and --people-only are mutually exclusive');
		process.exit(1);
	}

	if (result.shard !== null && result.peopleShardsOut === null) {
		console.error('--shard requires --people-shards-out');
		process.exit(1);
	}

	if (
		result.peopleShardsOut !== null &&
		(result.mainOnly || result.peopleOnly || result.validate)
	) {
		console.error('--people-shards-out cannot be combined with --main-only, --people-only, or --validate');
		process.exit(1);
	}

	if (
		result.shard !== null &&
		(!Number.isInteger(result.shard) || result.shard < 0 || result.shard >= PEOPLE_SITEMAP_SHARD_COUNT)
	) {
		console.error(`--shard must be an integer in [0, ${PEOPLE_SITEMAP_SHARD_COUNT})`);
		process.exit(1);
	}

	return result;
}

function toSitemapEntry(entry: { url: string; lastModified?: string | Date; changeFrequency?: string; priority?: number }): SitemapEntry {
	const lastmod =
		typeof entry.lastModified === 'string'
			? entry.lastModified.slice(0, 10)
			: entry.lastModified instanceof Date
				? entry.lastModified.toISOString().slice(0, 10)
				: formatLastmod();
	return {
		loc: entry.url,
		lastmod,
		changefreq: entry.changeFrequency ?? 'monthly',
		priority: entry.priority ?? 0.5,
	};
}

async function fetchMainContentEntries(): Promise<SitemapEntry[]> {
	const base = getBaseUrl();
	const entries = await fetchMainSitemapEntries(base);
	return entries.map(toSitemapEntry);
}

async function fetchStateElectionEntries(stateCode: string): Promise<SitemapEntry[]> {
	const base = getBaseUrl();
	const entries = await fetchStateElectionSitemapEntries(stateCode, base);
	return entries.map(toSitemapEntry);
}

async function fetchPeopleEntries(shard: number): Promise<SitemapEntry[]> {
	const base = getBaseUrl();
	const entries = await fetchPeopleSitemapEntries(base, shard);
	return entries.map(toSitemapEntry);
}

/**
 * Emits the /people band as one XML file per shard, gated so a bad band is
 * never handed off: every check below runs against the fetched entries before
 * any file is written, so a gate failure (thrown as an Error) leaves `outDir`
 * untouched rather than partially written.
 */
export async function runPeopleShardsOut(outDir: string, onlyShard: number | null): Promise<void> {
	const base = getBaseUrl();
	if (isLocalBaseUrl(base)) {
		throw new Error(
			`[sitemap] getBaseUrl() resolved to ${base}; refusing to emit people shards with a local base URL. ` +
				'Set NEXT_PUBLIC_APP_BASE/NEXT_PUBLIC_SITE_URL so it resolves to the production host in the Action context.',
		);
	}

	const shardsToBuild = onlyShard !== null ? [onlyShard] : [...PEOPLE_SITEMAP_SHARDS];
	const isFullRun = onlyShard === null;

	console.log(`Fetching ${shardsToBuild.length} people shard(s) (base: ${base})...`);
	const start = Date.now();

	// fetchPeopleSitemapEntries already warns per-shard at 80% of the ceiling
	// (it is called with a defined shard here, never the whole-corpus path).
	const fetched = await fetchPeopleShards(shardsToBuild, fetchPeopleEntries);
	const built = fetched.map(({ shard, entries }) => ({
		shard,
		urlCount: entries.length,
		xml: convertToXML(entries),
	}));

	const failures = runPeopleShardGates(built, {
		expectedShardCount: isFullRun ? PEOPLE_SITEMAP_SHARD_COUNT : undefined,
		totalFloor: isFullRun ? PEOPLE_SITEMAP_TOTAL_FLOOR : undefined,
	});

	if (failures.length > 0) {
		throw new Error(
			`[sitemap] people shard validation failed; no files written:\n${failures
				.map((f) => `  [${f.gate}] ${f.message}`)
				.join('\n')}`,
		);
	}

	await mkdir(outDir, { recursive: true });
	for (const { shard, xml } of built) {
		await writeSitemapFile(outDir, `${shard}.xml`, xml);
	}

	const durationMs = Date.now() - start;
	const totalUrls = built.reduce((sum, b) => sum + b.urlCount, 0);
	console.log(
		`Wrote ${built.length} people shard file(s), ${totalUrls} URLs total, to ${outDir} (${(durationMs / 1000).toFixed(1)}s)`,
	);
}

async function runValidation(
	allUrls: string[],
	opts: { redirectHandling: CliArgs['redirectHandling']; maxRedirects: number; noFollowRedirects: boolean },
): Promise<void> {
	const { runValidationFromGenerate } = await import('./validate-sitemap-urls');
	await runValidationFromGenerate(allUrls, opts);
}

async function main(): Promise<void> {
	const args = parseArgs();

	if (args.peopleShardsOut !== null) {
		await runPeopleShardsOut(args.peopleShardsOut, args.shard);
		return;
	}

	const start = Date.now();
	const base = getBaseUrl();

	console.log(`Generating sitemaps (base: ${base})...`);
	if (args.mainOnly) console.log('Mode: main-only');
	if (args.peopleOnly) console.log('Mode: people-only');

	await mkdir(SITEMAPS_DIR, { recursive: true });

	const indexEntries: SitemapIndexEntry[] = [];
	const allGeneratedUrls: string[] = [];
	const stats: { category: string; urls: number; files: number }[] = [];

	// Main content sitemap
	if (!args.peopleOnly) {
		const mainEntries = await fetchMainContentEntries();
		const chunks = splitUrlsIntoChunks(mainEntries);
		const lastmod = formatLastmod();

		if (chunks.length === 1) {
			const path = 'sitemaps/sitemap.xml';
			await writeSitemapFile(OUTPUT_DIR, path, convertToXML(chunks[0]!));
			indexEntries.push({ loc: `${base}/${path}`, lastmod });
			allGeneratedUrls.push(...chunks[0]!.map((e) => e.loc));
		} else {
			for (let i = 0; i < chunks.length; i++) {
				const path = `sitemaps/sitemap-${i + 1}.xml`;
				await writeSitemapFile(OUTPUT_DIR, path, convertToXML(chunks[i]!));
				indexEntries.push({ loc: `${base}/${path}`, lastmod });
				allGeneratedUrls.push(...chunks[i]!.map((e) => e.loc));
			}
		}
		stats.push({ category: 'main', urls: mainEntries.length, files: chunks.length });
	}

	// State sitemaps
	let stateFileCount = 0;
	let stateUrlCount = 0;
	if (!args.mainOnly && !args.peopleOnly) {
		for (const state of US_STATE_CODES) {
			const entries = await fetchStateElectionEntries(state);
			if (entries.length === 0) continue;

			stateUrlCount += entries.length;
			const chunks = splitUrlsIntoChunks(entries);
			const lastmod = formatLastmod();
			const stateLower = state.toLowerCase();

			for (let i = 0; i < chunks.length; i++) {
				const filename = chunks.length === 1 ? 'index.xml' : `index-${i + 1}.xml`;
				const path = `sitemaps/state/${stateLower}/sitemap/${filename}`;
				await writeSitemapFile(OUTPUT_DIR, path, convertToXML(chunks[i]!));
				indexEntries.push({ loc: `${base}/${path}`, lastmod });
				allGeneratedUrls.push(...chunks[i]!.map((e) => e.loc));
				stateFileCount++;
			}
		}
		stats.push({ category: 'state', urls: stateUrlCount, files: stateFileCount });
	}

	// People sitemaps, sharded by person id to mirror the served band.
	let peopleFileCount = 0;
	let peopleUrlCount = 0;
	if (!args.mainOnly) {
		for (const shard of PEOPLE_SITEMAP_SHARDS) {
			const entries = await fetchPeopleEntries(shard);
			if (entries.length === 0) continue;

			peopleUrlCount += entries.length;
			const chunks = splitUrlsIntoChunks(entries);
			const lastmod = formatLastmod();

			for (let i = 0; i < chunks.length; i++) {
				const filename = chunks.length === 1 ? 'index.xml' : `index-${i + 1}.xml`;
				const path = `sitemaps/people/shard-${String(shard).padStart(2, '0')}/sitemap/${filename}`;
				await writeSitemapFile(OUTPUT_DIR, path, convertToXML(chunks[i]!));
				indexEntries.push({ loc: `${base}/${path}`, lastmod });
				allGeneratedUrls.push(...chunks[i]!.map((e) => e.loc));
				peopleFileCount++;
			}
		}
		stats.push({ category: 'people', urls: peopleUrlCount, files: peopleFileCount });
	}

	// Root index
	await writeFile(join(OUTPUT_DIR, 'sitemap.xml'), generateRootIndex(indexEntries), 'utf-8');

	const durationMs = Date.now() - start;

	// Generation report
	await mkdir(REPORT_DIR, { recursive: true });
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
	const reportPath = join(REPORT_DIR, `generation-report-${timestamp}.json`);
	const report = {
		timestamp: new Date().toISOString(),
		durationMs,
		environment: {
			appBase: base,
			sanityProjectId: process.env['NEXT_PUBLIC_SANITY_PROJECT_ID'] ?? '3rbseux7',
			electionApiBase: process.env['ELECTIONS_API_BASE_URL'] ?? 'https://election-api.goodparty.org',
		},
		stats: {
			totalUrls: allGeneratedUrls.length,
			totalSitemaps: indexEntries.length,
			byCategory: stats,
		},
		sitemaps: indexEntries.map((e) => e.loc),
	};
	await writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');

	console.log(`Generated ${allGeneratedUrls.length} URLs in ${indexEntries.length} sitemaps (${(durationMs / 1000).toFixed(1)}s)`);
	console.log(`Report: ${reportPath}`);

	if (args.validate && allGeneratedUrls.length > 0) {
		console.log('Running URL validation...');
		await runValidation(allGeneratedUrls, {
			redirectHandling: args.redirectHandling,
			maxRedirects: args.maxRedirects,
			noFollowRedirects: args.noFollowRedirects,
		});
	}
}

if (import.meta.main) {
	main().catch((err) => {
		console.error(err);
		process.exit(1);
	});
}
