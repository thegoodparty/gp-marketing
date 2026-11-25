#!/usr/bin/env bun
/**
 * Regenerates src/lib/people-retired-ddhq.data.ts from the data team's export of
 * retired DDHQ-only profiles (Drive: ddhq_retired_indexed_earning.csv, ClickUp
 * DATA-2674). Run it again whenever the data team re-runs the export.
 *
 * Usage:
 *   bun run scripts/generate-people-retired-ddhq.ts path/to/ddhq_retired_indexed_earning.csv
 */

import { readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { assertWithinMiddlewareBudget, buildRetiredDdhqMap, renderRetiredDdhqDataModule } from './lib/people-retired-ddhq-generate';

const OUTPUT = join(import.meta.dir, '..', 'src', 'lib', 'people-retired-ddhq.data.ts');

const csvPath = process.argv[2];
if (!csvPath) {
	console.error('Usage: bun run scripts/generate-people-retired-ddhq.ts <path to ddhq_retired_indexed_earning.csv>');
	process.exit(1);
}

const map = buildRetiredDdhqMap(await readFile(csvPath, 'utf8'));
const generatedAt = new Date().toISOString().slice(0, 10);
const moduleText = renderRetiredDdhqDataModule(map, { file: basename(csvPath), generatedAt });
assertWithinMiddlewareBudget(moduleText);
await writeFile(OUTPUT, moduleText);

console.log(
	`Wrote ${OUTPUT}: ${map.rows} rows read, ${Object.keys(map.redirects).length} redirects, ${map.gone.length} gone.`,
);
