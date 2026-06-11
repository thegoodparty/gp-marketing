#!/usr/bin/env bun
/**
 * Audits candidate profile claimed/unclaimed lookup: elections Race.brHashId vs GP public-campaigns.
 *
 * Pass A: For each candidacy slug, run the same lookup marketing uses (findCampaignByRace).
 * Pass B (optional): For lookup failures, check candidates.goodparty.org for pledged campaigns
 *   with a different raceId — confirmed primary/general PositionElection mismatches.
 *
 * Usage:
 *   bun run scripts/audit-claimed-profile-lookup.ts
 *   bun run scripts/audit-claimed-profile-lookup.ts --states WA,AZ
 *   bun run scripts/audit-claimed-profile-lookup.ts --slug heather-marie-wilson/washington-state-senate-district-43
 *   bun run scripts/audit-claimed-profile-lookup.ts --lookup-only
 *   bun run scripts/audit-claimed-profile-lookup.ts --concurrency 8
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fetchCandidacySlugs, findCampaignByRace, getCandidateBySlug } from '../src/lib/electionsApi';
import { US_STATE_CODES } from '../src/lib/sitemap-entries';
import {
	type AuditRow,
	CSV_HEADER,
	buildCandidatesSiteUrl,
	buildProfileUrl,
	extractProductRaceIdFromCandidatesHtml,
	isPledgedCandidatesPage,
	positionElectionIdFromBrHash,
	toCsvRow,
	vanitySlugFromCandidacySlug,
} from './lib/claimed-profile-audit';

const DEFAULT_SITE_BASE = 'https://goodparty.org';
const DEFAULT_CONCURRENCY = 6;
const DEFAULT_TIMEOUT_MS = 20_000;
const REPORT_DIR = join(process.cwd(), '.reports', 'claimed-profile-audit');

type CliArgs = {
	states: string[];
	slugs: string[];
	siteBase: string;
	concurrency: number;
	confirmMismatches: boolean;
	timeoutMs: number;
};

function parseArgs(): CliArgs {
	const args = process.argv.slice(2);
	let siteBase = process.env['NEXT_PUBLIC_SITE_URL']?.replace(/\/$/, '') || DEFAULT_SITE_BASE;
	let states: string[] = [];
	const slugs: string[] = [];
	let concurrency = DEFAULT_CONCURRENCY;
	let confirmMismatches = true;
	let timeoutMs = DEFAULT_TIMEOUT_MS;

	for (let i = 0; i < args.length; i++) {
		const arg = args[i] ?? '';
		if (arg === '--states' && args[i + 1]) {
			states = args[++i]!.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
		} else if (arg === '--slug' && args[i + 1]) {
			slugs.push(args[++i]!.trim());
		} else if (arg === '--site-base' && args[i + 1]) {
			siteBase = args[++i]!.replace(/\/$/, '');
		} else if (arg === '--concurrency' && args[i + 1]) {
			concurrency = Number.parseInt(args[++i]!, 10) || DEFAULT_CONCURRENCY;
		} else if (arg === '--timeout-ms' && args[i + 1]) {
			timeoutMs = Number.parseInt(args[++i]!, 10) || DEFAULT_TIMEOUT_MS;
		} else if (arg === '--lookup-only') {
			confirmMismatches = false;
		} else if (arg === '--no-confirm-mismatches') {
			confirmMismatches = false;
		}
	}

	if (states.length === 0 && slugs.length === 0) {
		states = [...US_STATE_CODES];
	}

	return { states, slugs, siteBase, concurrency, confirmMismatches, timeoutMs };
}

async function runWithPool<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
	const results: R[] = [];
	let idx = 0;

	async function worker(): Promise<void> {
		while (idx < items.length) {
			const i = idx++;
			const item = items[i];
			if (item === undefined) break;
			results[i] = await fn(item);
		}
	}

	await Promise.all(
		Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
	);
	return results;
}

async function fetchCandidatesPage(vanitySlug: string, timeoutMs: number): Promise<{ ok: boolean; html?: string }> {
	const url = buildCandidatesSiteUrl(vanitySlug);
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
		const res = await fetch(url, { signal: controller.signal });
		clearTimeout(timeoutId);
		if (!res.ok) return { ok: false };
		return { ok: true, html: await res.text() };
	} catch {
		return { ok: false };
	}
}

async function auditSlug(slug: string, options: CliArgs): Promise<AuditRow> {
	const candidate = await getCandidateBySlug({ slug, includeRace: true, includeStances: false });
	if (!candidate) {
		return {
			slug,
			firstName: '',
			lastName: '',
			electionsRaceId: '',
			lookupStatus: 'skipped',
			mismatchConfirmed: false,
			profileUrl: buildProfileUrl(options.siteBase, slug),
			skipReason: 'candidacy not found in elections API',
		};
	}

	const firstName = candidate.firstName ?? '';
	const lastName = candidate.lastName ?? '';
	const electionsRaceId = candidate.Race?.brHashId ?? '';

	if (!electionsRaceId || !firstName || !lastName) {
		return {
			slug,
			firstName,
			lastName,
			state: candidate.state,
			positionName: candidate.positionName,
			electionsRaceId,
			gpCandidateId: (candidate as { gpCandidateId?: string | null }).gpCandidateId,
			lookupStatus: 'skipped',
			mismatchConfirmed: false,
			profileUrl: buildProfileUrl(options.siteBase, slug),
			skipReason: 'missing raceId or candidate name',
		};
	}

	const claimed = await findCampaignByRace({
		raceId: electionsRaceId,
		firstName,
		lastName,
	});

	const baseRow: AuditRow = {
		slug,
		firstName,
		lastName,
		state: candidate.state,
		positionName: candidate.positionName,
		electionsRaceId,
		electionsPositionElection: positionElectionIdFromBrHash(electionsRaceId),
		electionsIsPrimary: (candidate.Race as { isPrimary?: boolean } | undefined)?.isPrimary,
		electionsElectionDate: candidate.Race?.electionDate,
		gpCandidateId: (candidate as { gpCandidateId?: string | null }).gpCandidateId,
		lookupStatus: claimed ? 'claimed' : 'lookup_failure',
		campaignId: claimed?.id,
		pledged: claimed?.details?.pledged,
		mismatchConfirmed: false,
		profileUrl: buildProfileUrl(options.siteBase, slug),
	};

	if (claimed) {
		const campaignRaceId = claimed.details?.raceId;
		if (campaignRaceId && campaignRaceId !== electionsRaceId) {
			baseRow.productRaceId = campaignRaceId;
			baseRow.productPositionElection = positionElectionIdFromBrHash(campaignRaceId);
			baseRow.mismatchConfirmed = true;
		}
		return baseRow;
	}

	if (!options.confirmMismatches) {
		return baseRow;
	}

	const vanitySlug = vanitySlugFromCandidacySlug(slug);
	const candidatesSiteUrl = buildCandidatesSiteUrl(vanitySlug);
	baseRow.candidatesSiteUrl = candidatesSiteUrl;

	const page = await fetchCandidatesPage(vanitySlug, options.timeoutMs);
	if (!page.ok || !page.html) {
		return baseRow;
	}

	const pledged = isPledgedCandidatesPage(page.html);
	baseRow.pledged = pledged;

	if (!pledged) {
		return baseRow;
	}

	const productRaceId = extractProductRaceIdFromCandidatesHtml(page.html);
	if (!productRaceId) {
		return baseRow;
	}

	baseRow.productRaceId = productRaceId;
	baseRow.productPositionElection = positionElectionIdFromBrHash(productRaceId);
	baseRow.mismatchConfirmed = productRaceId !== electionsRaceId;

	return baseRow;
}

async function collectSlugs(options: CliArgs): Promise<string[]> {
	if (options.slugs.length > 0) {
		return options.slugs;
	}

	const all: string[] = [];
	for (const state of options.states) {
		const slugs = await fetchCandidacySlugs(state);
		console.log(`  ${state}: ${slugs.length} candidacy slugs`);
		all.push(...slugs);
	}
	return all;
}

async function main(): Promise<void> {
	const options = parseArgs();
	const started = Date.now();

	console.log('Claimed profile lookup audit');
	console.log(`Site base: ${options.siteBase}`);
	if (options.slugs.length > 0) {
		console.log(`Slugs: ${options.slugs.join(', ')}`);
	} else {
		console.log(`States: ${options.states.join(', ')}`);
	}
	console.log(`Concurrency: ${options.concurrency}`);
	console.log(`Confirm mismatches (Pass B): ${options.confirmMismatches}`);

	const slugs = await collectSlugs(options);
	console.log(`Auditing ${slugs.length} candidacies...`);

	let done = 0;
	const rows = await runWithPool(slugs, options.concurrency, async (slug) => {
		const row = await auditSlug(slug, options);
		done += 1;
		if (done % 100 === 0 || done === slugs.length) {
			console.log(`  Progress: ${done}/${slugs.length}`);
		}
		return row;
	});

	const claimed = rows.filter((r) => r.lookupStatus === 'claimed');
	const lookupFailures = rows.filter((r) => r.lookupStatus === 'lookup_failure');
	const confirmedMismatches = rows.filter((r) => r.mismatchConfirmed);
	const skipped = rows.filter((r) => r.lookupStatus === 'skipped');

	const report = {
		timestamp: new Date().toISOString(),
		durationMs: Date.now() - started,
		options: {
			states: options.states,
			slugCount: slugs.length,
			confirmMismatches: options.confirmMismatches,
			siteBase: options.siteBase,
		},
		summary: {
			total: rows.length,
			claimed: claimed.length,
			lookupFailures: lookupFailures.length,
			confirmedMismatches: confirmedMismatches.length,
			skipped: skipped.length,
		},
		confirmedMismatches,
		lookupFailures: lookupFailures.filter((r) => !r.mismatchConfirmed),
	};

	await mkdir(REPORT_DIR, { recursive: true });
	const stamp = report.timestamp.replace(/[:.]/g, '-');
	const jsonPath = join(REPORT_DIR, `audit-${stamp}.json`);
	const csvPath = join(REPORT_DIR, `audit-${stamp}.csv`);

	const csvLines = [CSV_HEADER, ...rows.map((r) => toCsvRow(r))];
	await writeFile(jsonPath, JSON.stringify(report, null, 2));
	await writeFile(csvPath, csvLines.join('\n'));

	console.log('\nSummary');
	console.log(`  Total:                ${report.summary.total}`);
	console.log(`  Claimed (lookup OK):  ${report.summary.claimed}`);
	console.log(`  Lookup failures:      ${report.summary.lookupFailures}`);
	console.log(`  Confirmed mismatches: ${report.summary.confirmedMismatches}`);
	console.log(`  Skipped:              ${report.summary.skipped}`);
	console.log(`\nJSON: ${jsonPath}`);
	console.log(`CSV:  ${csvPath}`);

	if (confirmedMismatches.length > 0) {
		console.log('\nConfirmed mismatches (elections vs product raceId):');
		for (const row of confirmedMismatches.slice(0, 20)) {
			console.log(
				`  ${row.slug}: elections PE ${row.electionsPositionElection} vs product PE ${row.productPositionElection}`,
			);
		}
		if (confirmedMismatches.length > 20) {
			console.log(`  ... and ${confirmedMismatches.length - 20} more in report`);
		}
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
