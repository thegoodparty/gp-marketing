#!/usr/bin/env npx tsx
/**
 * Removes invalid URLs from existing sitemap XML files using a validation report.
 * Usage: npx tsx scripts/prune-invalid-urls.ts --report <path-to-validation-report.json>
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ValidationReport } from './validate-sitemap-urls';

function parseArgs(): { reportPath: string } {
	const args = process.argv.slice(2);
	let reportPath = '';
	for (let i = 0; i < args.length; i++) {
		if (args[i] === '--report' && args[i + 1]) {
			reportPath = args[++i]!;
			break;
		}
	}
	return { reportPath };
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
	const { reportPath } = parseArgs();
	if (!reportPath) {
		console.error('Usage: npx tsx scripts/prune-invalid-urls.ts --report <path-to-validation-report.json>');
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

	const invalidUrls = new Set(
		report.invalid.map((r) => r.url),
	);

	if (invalidUrls.size === 0) {
		console.log('No invalid URLs to prune.');
		return;
	}

	console.log(`Pruning ${invalidUrls.size} invalid URLs from sitemaps...`);

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

	for (const sitemapPath of xmlFiles) {
		try {
			const xml = await readFile(sitemapPath, 'utf-8');
			if (!xml.includes('<urlset')) continue;
			const { prunedXml, removedCount } = pruneSitemapXml(xml, invalidUrls);
			if (removedCount > 0) {
				await writeFile(sitemapPath, prunedXml, 'utf-8');
				totalRemoved += removedCount;
				console.log(`  ${sitemapPath}: removed ${removedCount} URLs`);
			}
		} catch (err) {
			console.warn(`  Skipped ${sitemapPath}:`, err instanceof Error ? err.message : String(err));
		}
	}

	console.log(`Pruned ${totalRemoved} invalid URLs total.`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
