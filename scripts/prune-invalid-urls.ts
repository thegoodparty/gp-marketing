#!/usr/bin/env npx tsx
/**
 * Removes invalid URLs from existing sitemap XML files using a validation report.
 * Usage: npx tsx scripts/prune-invalid-urls.ts --report <path-to-validation-report.json> [--apply-replacements]
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ValidationReport } from './validate-sitemap-urls';

function parseArgs(): { reportPath: string; applyReplacements: boolean } {
	const args = process.argv.slice(2);
	let reportPath = '';
	let applyReplacements = false;
	for (let i = 0; i < args.length; i++) {
		if (args[i] === '--report' && args[i + 1]) {
			reportPath = args[++i]!;
		} else if (args[i] === '--apply-replacements') {
			applyReplacements = true;
		}
	}
	return { reportPath, applyReplacements };
}

/**
 * Extracts <url>...</url> blocks from sitemap XML and returns the loc value for each.
 */
function extractUrlsFromSitemapXml(xml: string): Array<{ fullBlock: string; loc: string }> {
	const urlBlocks: Array<{ fullBlock: string; loc: string }> = [];
	const urlRegex = /<url>([\s\S]*?)<\/url>/g;
	const locRegex = /<loc>([^<]+)<\/loc>/;
	let match: RegExpExecArray | null;
	while ((match = urlRegex.exec(xml)) !== null) {
		const block = match[1]!;
		const locMatch = block.match(locRegex);
		if (locMatch) {
			urlBlocks.push({ fullBlock: match[0]!, loc: locMatch[1]!.trim() });
		}
	}
	return urlBlocks;
}

/**
 * Replaces <loc> values according to the replacements map. Returns updated XML and count of replacements.
 */
function replaceUrlsInSitemapXml(
	xml: string,
	replacements: Map<string, string>,
): { replacedXml: string; replacedCount: number } {
	let replacedCount = 0;
	const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	for (const [from, to] of replacements) {
		const re = new RegExp(`(<loc>)${escapeRe(from)}(</loc>)`, 'g');
		const matches = xml.match(re);
		if (matches) {
			replacedCount += matches.length;
			xml = xml.replace(re, (_, open: string, close: string) => open + to + close);
		}
	}
	return { replacedXml: xml, replacedCount };
}

/**
 * Removes <url> blocks whose loc is in the invalid set.
 */
function pruneSitemapXml(xml: string, invalidUrls: Set<string>): { prunedXml: string; removedCount: number } {
	const urlBlocks = extractUrlsFromSitemapXml(xml);
	let removedCount = 0;
	const keptBlocks: string[] = [];

	for (const { fullBlock, loc } of urlBlocks) {
		if (invalidUrls.has(loc)) {
			removedCount++;
		} else {
			keptBlocks.push(fullBlock);
		}
	}

	const urlsetOpenMatch = xml.match(/<urlset[^>]*>/);
	if (!urlsetOpenMatch) return { prunedXml: xml, removedCount: 0 };

	const beforeUrlset = xml.slice(0, xml.indexOf('<urlset'));
	const urlsetOpen = urlsetOpenMatch[0]!;
	const newContent = keptBlocks.join('\n');
	const prunedXml = `${beforeUrlset}${urlsetOpen}\n${newContent}\n</urlset>\n`;

	return { prunedXml, removedCount };
}

async function main(): Promise<void> {
	const { reportPath, applyReplacements } = parseArgs();
	if (!reportPath) {
		console.error('Usage: npx tsx scripts/prune-invalid-urls.ts --report <path-to-validation-report.json> [--apply-replacements]');
		process.exit(1);
	}

	const resolvedPath = join(process.cwd(), reportPath);
	let report: ValidationReport;
	try {
		const raw = await readFile(resolvedPath, 'utf-8');
		report = JSON.parse(raw) as ValidationReport;
	} catch (err) {
		console.error('Failed to read report:', err instanceof Error ? err.message : String(err));
		process.exit(1);
	}

	const invalidUrls = new Set(report.invalid.map((r) => r.url));
	const replacements = new Map(
		(report.replacements ?? []).map((r) => [r.from, r.to] as [string, string]),
	);

	if (invalidUrls.size === 0 && (!applyReplacements || replacements.size === 0)) {
		console.log('No invalid URLs to prune and no replacements to apply.');
		return;
	}

	const publicDir = join(process.cwd(), 'public');
	const sitemapsDir = join(publicDir, 'sitemaps');

	async function findXmlFiles(dir: string): Promise<string[]> {
		const { readdir } = await import('node:fs/promises');
		const files: string[] = [];
		try {
			const entries = await readdir(dir, { withFileTypes: true });
			for (const e of entries) {
				const fp = join(dir, e.name);
				if (e.isDirectory()) {
					files.push(...(await findXmlFiles(fp)));
				} else if (e.name.endsWith('.xml')) {
					files.push(fp);
				}
			}
		} catch {
			// dir may not exist
		}
		return files;
	}

	const xmlFiles = await findXmlFiles(sitemapsDir);
	let totalRemoved = 0;
	let totalReplaced = 0;

	for (const sitemapPath of xmlFiles) {
		try {
			let xml = await readFile(sitemapPath, 'utf-8');
			if (!xml.includes('<urlset')) continue;

			let fileChanged = false;

			if (applyReplacements && replacements.size > 0) {
				const { replacedXml, replacedCount } = replaceUrlsInSitemapXml(xml, replacements);
				if (replacedCount > 0) {
					xml = replacedXml;
					totalReplaced += replacedCount;
					fileChanged = true;
					console.log(`  ${sitemapPath}: replaced ${replacedCount} URLs`);
				}
			}

			if (invalidUrls.size > 0) {
				const { prunedXml, removedCount } = pruneSitemapXml(xml, invalidUrls);
				if (removedCount > 0) {
					xml = prunedXml;
					totalRemoved += removedCount;
					fileChanged = true;
					console.log(`  ${sitemapPath}: removed ${removedCount} URLs`);
				}
			}

			if (fileChanged) {
				await writeFile(sitemapPath, xml, 'utf-8');
			}
		} catch (err) {
			console.warn(`  Skipped ${sitemapPath}:`, err instanceof Error ? err.message : String(err));
		}
	}

	if (totalReplaced > 0) console.log(`Replaced ${totalReplaced} URLs total.`);
	if (totalRemoved > 0) console.log(`Pruned ${totalRemoved} invalid URLs total.`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
