#!/usr/bin/env node
/**
 * One-off audit helper for docs/elections-known-limitations.md
 * Run: node scripts/elections-limitations/audit.mjs
 */
import { runNationalScan } from './audit-core.mjs';

const BASE = process.env.ELECTIONS_API_BASE_URL ?? 'https://election-api.goodparty.org';

async function main() {
  const scan = await runNationalScan({ base: BASE });

  const report = {
    scannedAt: scan.scannedAt,
    base: scan.base,
    lim01Count: scan.lim01Count,
    lim02Count: scan.lim02Count,
    orphanCountyNameCount: scan.orphanCountyNameCount,
    mergeGapCount: scan.mergeGapCount,
    lim01ByState: scan.lim01ByState,
    lim01Sample: scan.lim01.slice(0, 30),
    lim02Sample: scan.lim02.slice(0, 40),
    orphanSample: scan.orphanCountyName.slice(0, 25),
    mergeGapSample: scan.mergeGaps.slice(0, 25),
    hierarchyOnlyCount: scan.hierarchyOnlyCount,
    fallbackOnlyCount: scan.fallbackOnlyCount,
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
