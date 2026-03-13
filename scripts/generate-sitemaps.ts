#!/usr/bin/env npx tsx
/**
 * Static sitemap generation. Fetches from Sanity CMS and Election API, writes XML to public/.
 * Usage: npx tsx scripts/generate-sitemaps.ts [--main-only] [--candidates-only] [--validate] [--redirect-handling remove|replace|keep] [--max-redirects N] [--no-follow-redirects]
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { convertToXML, generateRootIndex, type SitemapEntry, type SitemapIndexEntry } from './lib/xml';
import {
	fetchElectionData,
	formatLastmod,
	getAppBase,
	splitUrlsIntoChunks,
	US_STATE_CODES,
	writeSitemapFile,
} from './lib/sitemap-helpers';
import { scriptSanityClient } from './lib/sanity-client';

const OUTPUT_DIR = join(process.cwd(), 'public');
const SITEMAPS_DIR = join(OUTPUT_DIR, 'sitemaps');
const REPORT_DIR = join(process.cwd(), '.reports', 'sitemaps');

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
	const base = getAppBase();
	const entries: SitemapEntry[] = [];
	const lastmod = formatLastmod();

	// Singleton pages (home, blog index, contact, glossary index)
	const singletons = await scriptSanityClient.fetch<{
		home: string | null;
		blog: string | null;
		contact: string | null;
		glossary: string | null;
	}>(
		`{
			"home": *[_type=="goodpartyOrg_home"][0]._id,
			"blog": *[_type=="goodpartyOrg_allArticles"][0]._id,
			"contact": *[_type=="goodpartyOrg_contact"][0]._id,
			"glossary": *[_type=="goodpartyOrg_glossary"][0]._id
		}`,
	);
	if (singletons.home) entries.push(toEntry('/', 1.0, 'monthly'));
	if (singletons.blog) entries.push(toEntry('/blog', 1.0, 'monthly'));
	if (singletons.contact) entries.push(toEntry('/contact', 1.0, 'monthly'));
	if (singletons.glossary) entries.push(toEntry('/political-terms', 1.0, 'monthly'));

	// Landing pages + policies (includes elections, candidates, profile)
	const landingAndPolicySlugs = await scriptSanityClient.fetch<Array<{ slug: string | null }>>(
		`*[_type in ["goodpartyOrg_landingPages","policy"]][]{"slug": select(_type == "goodpartyOrg_landingPages" => detailPageOverviewNoHero.field_slug, _type == "policy" => policyOverview.field_slug)}`,
	);
	for (const { slug } of landingAndPolicySlugs) {
		if (slug) entries.push(toEntry(`/${slug}`, 1.0, 'monthly'));
	}

	// Articles
	const articles = await scriptSanityClient.fetch<Array<{ slug: string | null; updatedAt?: string }>>(
		`*[_type == "article"][]{"slug": editorialOverview.field_slug, "updatedAt": editorialOverview.field_lastUpdated}`,
	);
	for (const a of articles) {
		if (a.slug) {
			entries.push({
				loc: `${base}/blog/article/${a.slug}`,
				lastmod: a.updatedAt ? a.updatedAt.slice(0, 10) : lastmod,
				changefreq: 'monthly',
				priority: 0.7,
			});
		}
	}

	// Categories (blog sections)
	const categorySlugs = await scriptSanityClient.fetch<Array<string | null>>(
		`*[_type == "categories"][].tagOverview.field_slug`,
	);
	for (const slug of categorySlugs) {
		if (slug) entries.push(toEntry(`/blog/section/${slug}`, 0.7, 'weekly'));
	}

	// Topics (blog tags)
	const topicSlugs = await scriptSanityClient.fetch<Array<string | null>>(
		`*[_type == "topics"][].tagOverview.field_slug`,
	);
	for (const slug of topicSlugs) {
		if (slug) entries.push(toEntry(`/blog/tag/${slug}`, 0.7, 'weekly'));
	}

	// Glossary terms + letter index pages
	const glossaryTerms = await scriptSanityClient.fetch<
		Array<{ _id: string; title: string; slug: string | null }>
	>(
		`*[_type == "glossary"][]{_id, "title": glossaryTermOverview.field_glossaryTerm, "slug": glossaryTermOverview.field_slug}`,
	);
	const seenLetters = new Set<string>();
	for (const t of glossaryTerms) {
		if (t.slug) entries.push(toEntry(`/political-terms/${t.slug}`, 0.6, 'monthly'));
		const letter = t.title?.charAt(0)?.toLowerCase();
		if (letter && !seenLetters.has(letter)) {
			seenLetters.add(letter);
			entries.push(toEntry(`/political-terms/${letter}`, 0.6, 'monthly'));
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
			sanityProjectId: process.env['NEXT_PUBLIC_SANITY_PROJECT_ID'] ?? '3rbseux7',
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
