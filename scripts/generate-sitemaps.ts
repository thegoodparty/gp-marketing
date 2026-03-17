#!/usr/bin/env npx tsx
/**
 * Static sitemap generation. Fetches from GP API and Election API, writes XML to public/.
 * Usage: npx tsx scripts/generate-sitemaps.ts [--main-only] [--candidates-only] [--validate] [--redirect-handling remove|replace|keep] [--max-redirects N] [--no-follow-redirects]
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { convertToXML, generateRootIndex, type SitemapEntry, type SitemapIndexEntry } from './lib/xml';
import {
	fetchElectionData,
	fetchGpContent,
	formatLastmod,
	getAppBase,
	splitUrlsIntoChunks,
	US_STATE_CODES,
	writeSitemapFile,
	slugify,
} from './lib/sitemap-helpers';

const OUTPUT_DIR = join(process.cwd(), 'public');
const SITEMAPS_DIR = join(OUTPUT_DIR, 'sitemaps');
const REPORT_DIR = join(process.cwd(), '.reports', 'sitemaps');

const STATIC_ROUTES = [
	{ path: '/', priority: 1.0, changefreq: 'monthly' as const },
	{ path: '/about', priority: 1.0, changefreq: 'monthly' as const },
	{ path: '/elections', priority: 1.0, changefreq: 'monthly' as const },
	{ path: '/blog', priority: 1.0, changefreq: 'monthly' as const },
	{ path: '/faqs', priority: 1.0, changefreq: 'monthly' as const },
	{ path: '/contact', priority: 1.0, changefreq: 'monthly' as const },
];

interface CliArgs {
	mainOnly: boolean;
	candidatesOnly: boolean;
	validate: boolean;
	redirectHandling: 'remove' | 'replace' | 'keep';
	maxRedirects: number;
	noFollowRedirects: boolean;
}

function parseArgs(): CliArgs {
	const args = process.argv.slice(2);
	const result: CliArgs = {
		mainOnly: false,
		candidatesOnly: false,
		validate: false,
		redirectHandling: 'remove',
		maxRedirects: 5,
		noFollowRedirects: false,
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === '--main-only') result.mainOnly = true;
		else if (arg === '--candidates-only') result.candidatesOnly = true;
		else if (arg === '--validate') result.validate = true;
		else if (arg === '--redirect-handling' && args[i + 1]) {
			const v = args[++i] as string;
			if (v === 'remove' || v === 'replace' || v === 'keep') result.redirectHandling = v;
		} else if (arg === '--max-redirects' && args[i + 1]) {
			result.maxRedirects = Number.parseInt(args[++i]!, 10) || 5;
		} else if (arg === '--no-follow-redirects') result.noFollowRedirects = true;
	}

	if (result.mainOnly && result.candidatesOnly) {
		console.error('--main-only and --candidates-only are mutually exclusive');
		process.exit(1);
	}

	return result;
}

function toEntry(path: string, priority: number, changefreq: string): SitemapEntry {
	const base = getAppBase();
	return {
		loc: `${base}${path.startsWith('/') ? path : `/${path}`}`,
		lastmod: formatLastmod(),
		changefreq,
		priority,
	};
}

async function fetchMainContentEntries(): Promise<SitemapEntry[]> {
	const entries: SitemapEntry[] = [];

	// Static routes
	for (const r of STATIC_ROUTES) {
		entries.push(toEntry(r.path, r.priority, r.changefreq));
	}

	// Blog articles
	const blogArticles = await fetchGpContent<{ slug?: string; updatedAt?: string; section?: { slug?: string } }>(
		'v1/content/type/blogArticle',
	);
	for (const a of blogArticles) {
		if (a.slug) {
			entries.push({
				loc: `${getAppBase()}/blog/article/${a.slug}`,
				lastmod: a.updatedAt ? a.updatedAt.slice(0, 10) : formatLastmod(),
				changefreq: 'monthly',
				priority: 0.7,
			});
		}
	}

	// Blog sections (from article data)
	const sectionSlugs = new Set<string>();
	for (const a of blogArticles) {
		const slug = a.section?.slug ?? (a as { sectionSlug?: string }).sectionSlug;
		if (slug) sectionSlugs.add(slug);
	}
	for (const slug of sectionSlugs) {
		entries.push(toEntry(`/blog/section/${slug}`, 0.7, 'weekly'));
	}

	// FAQ articles
	const faqArticles = await fetchGpContent<{ title?: string; slug?: string }>('v1/content/type/faqArticle');
	for (const f of faqArticles) {
		const slug = f.slug ?? (f.title ? slugify(f.title) : null);
		if (slug) entries.push(toEntry(`/faqs/${slug}`, 0.7, 'monthly'));
	}

	// Glossary terms
	const glossaryItems = await fetchGpContent<{ slug?: string }>('v1/content/type/glossaryItem');
	for (const g of glossaryItems) {
		if (g.slug) entries.push(toEntry(`/political-terms/${g.slug}`, 0.6, 'monthly'));
	}

	// Fallback: try by-slug endpoint if main returns empty (some APIs structure differently)
	if (glossaryItems.length === 0) {
		const bySlug = await fetchGpContent<{ slug?: string }>('v1/content/type/glossaryItem/by-slug');
		for (const g of bySlug) {
			if (g.slug) entries.push(toEntry(`/political-terms/${g.slug}`, 0.6, 'monthly'));
		}
	}

	return entries;
}

async function fetchStateElectionEntries(stateCode: string): Promise<SitemapEntry[]> {
	const entries: SitemapEntry[] = [];
	const code = stateCode.toUpperCase();
	const stateLower = code.toLowerCase();

	const places = await fetchElectionData<{ slug?: string }>('v1/places', {
		state: code,
		placeColumns: 'slug',
	});
	for (const p of places) {
		if (p.slug) entries.push(toEntry(`/elections/${p.slug}`, 0.7, 'weekly'));
	}

	const races = await fetchElectionData<{ slug?: string }>('v1/races', {
		state: code,
		raceColumns: 'slug',
	});
	for (const r of races) {
		if (r.slug) entries.push(toEntry(`/elections/${stateLower}/position/${r.slug}`, 0.7, 'weekly'));
	}

	return entries;
}

async function fetchCandidateEntries(stateCode: string): Promise<SitemapEntry[]> {
	const code = stateCode.toUpperCase();
	const candidacies = await fetchElectionData<{ slug?: string }>('v1/candidacies', {
		state: code,
		columns: 'slug',
	});
	const entries: SitemapEntry[] = [];
	for (const c of candidacies) {
		if (c.slug) entries.push(toEntry(`/candidate/${c.slug}`, 0.7, 'weekly'));
	}
	return entries;
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
	const start = Date.now();
	const base = getAppBase();

	console.log(`Generating sitemaps (base: ${base})...`);
	if (args.mainOnly) console.log('Mode: main-only');
	if (args.candidatesOnly) console.log('Mode: candidates-only');

	await mkdir(SITEMAPS_DIR, { recursive: true });

	const indexEntries: SitemapIndexEntry[] = [];
	const allGeneratedUrls: string[] = [];
	const stats: { category: string; urls: number; files: number }[] = [];

	// Main content sitemap
	if (!args.candidatesOnly) {
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
	if (!args.mainOnly && !args.candidatesOnly) {
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

	// Candidate sitemaps
	let candFileCount = 0;
	let candUrlCount = 0;
	if (!args.mainOnly) {
		for (const state of US_STATE_CODES) {
			const entries = await fetchCandidateEntries(state);
			if (entries.length === 0) continue;

			candUrlCount += entries.length;
			const chunks = splitUrlsIntoChunks(entries);
			const lastmod = formatLastmod();
			const stateLower = state.toLowerCase();

			for (let i = 0; i < chunks.length; i++) {
				const filename = chunks.length === 1 ? 'index.xml' : `index-${i + 1}.xml`;
				const path = `sitemaps/candidates/${stateLower}/sitemap/${filename}`;
				await writeSitemapFile(OUTPUT_DIR, path, convertToXML(chunks[i]!));
				indexEntries.push({ loc: `${base}/${path}`, lastmod });
				allGeneratedUrls.push(...chunks[i]!.map((e) => e.loc));
				candFileCount++;
			}
		}
		stats.push({ category: 'candidates', urls: candUrlCount, files: candFileCount });
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
			gpApiBase: process.env['NEXT_PUBLIC_API_BASE'] ?? 'https://gp-api.goodparty.org',
			electionApiBase: process.env['NEXT_PUBLIC_ELECTION_API_BASE'] ?? process.env['ELECTIONS_API_BASE_URL'] ?? 'https://election-api.goodparty.org',
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

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
