#!/usr/bin/env node
/**
 * Validates upstream elections place-data fixes vs May 2026 baseline.
 * Run: node scripts/elections-limitations/validate.mjs [--api-only] [--site-url URL] [--skip-scan]
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  BASELINE_MAY_2026,
  CITY_MTFCC,
  COUNTY_MTFCC,
  TOWN_MTFCC,
  countDifferingFacts,
  createFetchJson,
  fetchPlaceBySlug,
  getMergedCountyChildren,
  runNationalScan,
  suspiciousFactsMatch,
} from './audit-core.mjs';

const BASE = process.env.ELECTIONS_API_BASE_URL ?? 'https://election-api.goodparty.org';

const EMPTY_MUNICIPAL_RE =
  /Municipal election pages for cities and towns in .+ are not available yet/i;

const FACT_MARKERS = [
  /data-section=["']Location Facts Block["']/i,
  /\bPopulation\b/i,
  /\bMedian\b/i,
  /\bHousehold income\b/i,
];

function parseArgs() {
  const args = process.argv.slice(2);
  let apiOnly = false;
  let skipScan = false;
  let siteUrl = null;
  let quiet = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--api-only') apiOnly = true;
    else if (arg === '--skip-scan') skipScan = true;
    else if (arg === '--quiet') quiet = true;
    else if (arg === '--site-url' && args[i + 1]) {
      siteUrl = args[++i].replace(/\/$/, '');
      if (!siteUrl.startsWith('http')) siteUrl = `http://${siteUrl}`;
    }
  }

  return { apiOnly, skipScan, siteUrl, quiet };
}

function sitePathFromCountySlug(countySlug) {
  const [state, county] = countySlug.split('/');
  return `/elections/${state}/${county}`;
}

function sitePathFromCitySlug(countySlug, citySlug) {
  const [state, county] = countySlug.split('/');
  const citySegment = citySlug.split('/').pop();
  return `/elections/${state}/${county}/${citySegment}`;
}

async function runAnchorMatrix(fetchJson) {
  const anchors = [];

  const lim01Counties = [
    { id: 'LIM-01', slug: 'wv/braxton-county', label: 'Braxton WV' },
    { id: 'LIM-01', slug: 'wv/kanawha-county', label: 'Kanawha WV' },
    { id: 'LIM-01', slug: 'va/fairfax-county', label: 'Fairfax VA' },
    { id: 'LIM-01', slug: 'la/jefferson-parish', label: 'Jefferson LA' },
    { id: 'LIM-01', slug: 'ak/haines-borough', label: 'Haines AK' },
  ];

  for (const { id, slug, label } of lim01Counties) {
    const state = slug.split('/')[0].toUpperCase();
    let cities = [];
    let towns = [];
    try {
      cities =
        (await fetchJson(
          `/v1/places?state=${state}&mtfcc=${CITY_MTFCC}&placeColumns=slug,name,countyName,mtfcc`,
        )) ?? [];
      towns =
        (await fetchJson(
          `/v1/places?state=${state}&mtfcc=${TOWN_MTFCC}&placeColumns=slug,name,countyName,mtfcc`,
        )) ?? [];
    } catch {
      /* empty */
    }
    const { detail, merged } = await getMergedCountyChildren(
      fetchJson,
      state,
      slug,
      cities,
      towns,
    );
    const hasCityLargest = Boolean(detail?.cityLargest?.trim());
    const pass = merged.length > 0 || !hasCityLargest;
    anchors.push({
      id,
      label,
      slug,
      type: 'lim01_county',
      pass,
      api: {
        cityLargest: detail?.cityLargest ?? null,
        mergedCount: merged.length,
        mergedSlugs: merged.map((c) => c.slug),
      },
      note: pass
        ? merged.length > 0
          ? 'Municipal children present'
          : 'cityLargest cleared'
        : 'No merged children but cityLargest set',
    });
  }

  const gassaway = await fetchPlaceBySlug(fetchJson, 'wv/gassaway');
  anchors.push({
    id: 'LIM-01',
    label: 'Gassaway WV place',
    slug: 'wv/gassaway',
    type: 'place_exists',
    pass: gassaway !== null,
    api: { exists: gassaway !== null, name: gassaway?.name ?? null },
    note: gassaway ? 'Place row exists' : '404 — municipal place still missing',
  });

  const lim02Pairs = [
    { id: 'LIM-02', citySlug: 'nv/fernley', countySlug: 'nv/lyon-county', label: 'Fernley NV' },
    {
      id: 'LIM-02',
      citySlug: 'nv/lyon-county/smith-valley',
      countySlug: 'nv/lyon-county',
      label: 'Smith Valley NV',
    },
    {
      id: 'LIM-02-control',
      citySlug: 'nv/yerington',
      countySlug: 'nv/lyon-county',
      label: 'Yerington NV (control)',
      expectDistinct: true,
    },
  ];

  for (const { id, citySlug, countySlug, label, expectDistinct } of lim02Pairs) {
    const city = await fetchPlaceBySlug(fetchJson, citySlug);
    const county = await fetchPlaceBySlug(fetchJson, countySlug);
    const dup = suspiciousFactsMatch(city, county);
    const { differing, compared } = countDifferingFacts(city, county);
    const pass = expectDistinct ? !dup && differing >= 1 : !dup;
    anchors.push({
      id,
      label,
      slug: citySlug,
      type: 'lim02_facts',
      pass,
      api: {
        cityPopulation: city?.population,
        countyPopulation: county?.population,
        suspiciousMatch: dup,
        differingFacts: differing,
        comparedFacts: compared,
      },
      note: pass
        ? expectDistinct
          ? 'Facts remain distinct (control OK)'
          : 'Localized facts — no suspicious county match'
        : 'Still duplicates county on ≥2 fact fields',
    });
  }

  const regressions = [
    {
      id: 'LIM-04',
      slug: 'nv/lyon-county',
      label: 'Lyon NV regression',
      expectNames: ['fernley', 'yerington', 'smith'],
      minCount: 3,
    },
    {
      id: 'LIM-04',
      slug: 'tx/harris-county',
      label: 'Harris TX regression',
      minCount: 29,
    },
    {
      id: 'LIM-03',
      slug: 'ct/hartford-county',
      label: 'Hartford CT regression',
      minCount: 20,
    },
    {
      id: 'LIM-03',
      slug: 'me/androscoggin-county',
      label: 'Androscoggin ME regression',
      minCount: 2,
    },
  ];

  for (const { id, slug, label, expectNames, minCount } of regressions) {
    const state = slug.split('/')[0].toUpperCase();
    let cities = [];
    let towns = [];
    try {
      cities =
        (await fetchJson(
          `/v1/places?state=${state}&mtfcc=${CITY_MTFCC}&placeColumns=slug,name,countyName,mtfcc`,
        )) ?? [];
      towns =
        (await fetchJson(
          `/v1/places?state=${state}&mtfcc=${TOWN_MTFCC}&placeColumns=slug,name,countyName,mtfcc`,
        )) ?? [];
    } catch {
      /* empty */
    }
    const { merged } = await getMergedCountyChildren(fetchJson, state, slug, cities, towns);
    const mergedNames = merged.map((c) => (c.slug ?? '').toLowerCase()).join(' ');
    let pass = merged.length >= (minCount ?? 1);
    if (expectNames) {
      pass =
        pass && expectNames.every((n) => mergedNames.includes(n.toLowerCase()));
    }
    anchors.push({
      id,
      label,
      slug,
      type: 'regression_merge',
      pass,
      api: { mergedCount: merged.length, mergedSlugs: merged.map((c) => c.slug) },
      note: pass ? 'Merge list OK' : 'Regression — municipal list degraded',
    });
  }

  const expectedNa = [
    { slug: 'md/baltimore-city', label: 'Baltimore City MD' },
    { slug: 'nv/carson-city', label: 'Carson City NV' },
  ];

  for (const { slug, label } of expectedNa) {
    const state = slug.split('/')[0].toUpperCase();
    const detail = await fetchPlaceBySlug(fetchJson, slug, { includeChildren: true });
    const children = (detail?.children ?? []).filter(
      (c) => c.mtfcc === CITY_MTFCC || c.mtfcc === TOWN_MTFCC,
    );
    anchors.push({
      id: 'N/A',
      label,
      slug,
      type: 'expected_no_children',
      pass: true,
      api: { childCount: children.length, cityLargest: detail?.cityLargest ?? null },
      note: 'Independent/consolidated — empty municipal sub-list expected',
    });
  }

  return anchors;
}

async function runUiChecks(siteUrl, anchors) {
  const uiResults = [];
  const countyLim01 = anchors.filter(
    (a) => a.type === 'lim01_county' && ['LIM-01'].includes(a.id),
  );
  const lim02Anchors = anchors.filter((a) => a.type === 'lim02_facts');
  const regressionLyon = anchors.find((a) => a.slug === 'nv/lyon-county');

  for (const anchor of countyLim01) {
    const path = sitePathFromCountySlug(anchor.slug);
    const url = `${siteUrl}${path}`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      const html = res.ok ? await res.text() : '';
      const hasEmptyMsg = EMPTY_MUNICIPAL_RE.test(html);
      const pass = anchor.pass ? !hasEmptyMsg : hasEmptyMsg;
      uiResults.push({
        anchorLabel: anchor.label,
        url,
        status: res.status,
        pass,
        checks: {
          emptyMunicipalMessage: hasEmptyMsg,
          expectedFixed: anchor.pass,
        },
        note: anchor.pass
          ? hasEmptyMsg
            ? 'API fixed but UI still shows empty message (cache?)'
            : 'City list or no empty message'
          : hasEmptyMsg
            ? 'Empty message shown (expected while LIM-01 open)'
            : 'Unexpected — LIM-01 open but no empty message',
      });
    } catch (e) {
      uiResults.push({
        anchorLabel: anchor.label,
        url,
        status: 0,
        pass: false,
        error: e.message,
      });
    }
  }

  const fernleyPath = sitePathFromCitySlug('nv/lyon-county', 'nv/fernley');
  const smithPath = sitePathFromCitySlug('nv/lyon-county', 'nv/lyon-county/smith-valley');
  const yeringtonPath = sitePathFromCitySlug('nv/lyon-county', 'nv/yerington');

  for (const { path, anchorLabel, anchorSlug } of [
    { path: fernleyPath, anchorLabel: 'Fernley NV', anchorSlug: 'nv/fernley' },
    { path: smithPath, anchorLabel: 'Smith Valley NV', anchorSlug: 'nv/lyon-county/smith-valley' },
    { path: yeringtonPath, anchorLabel: 'Yerington NV (control)', anchorSlug: 'nv/yerington' },
  ]) {
    const anchor = lim02Anchors.find((a) => a.slug === anchorSlug);
    const url = `${siteUrl}${path}`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      const html = res.ok ? await res.text() : '';
      const hasFacts = FACT_MARKERS.some((re) => re.test(html));
      const isControl = anchorSlug === 'nv/yerington';
      const pass = isControl ? hasFacts : anchor?.pass ? hasFacts : !hasFacts;
      uiResults.push({
        anchorLabel,
        url,
        status: res.status,
        pass,
        checks: { factsVisible: hasFacts, apiPass: anchor?.pass },
        note: isControl
          ? hasFacts
            ? 'Control — facts visible'
            : 'Regression — Yerington facts missing'
          : anchor?.pass
            ? hasFacts
              ? 'Facts block visible after fix'
              : 'API fixed but facts not in HTML (cache?)'
            : hasFacts
              ? 'Facts shown despite duplicate API data'
              : 'Facts hidden by guardrail (expected)',
      });
    } catch (e) {
      uiResults.push({ anchorLabel, url, status: 0, pass: false, error: e.message });
    }
  }

  if (regressionLyon) {
    const url = `${siteUrl}${sitePathFromCountySlug('nv/lyon-county')}`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      const html = res.ok ? await res.text() : '';
      const hasFernley = /fernley/i.test(html);
      const hasYerington = /yerington/i.test(html);
      uiResults.push({
        anchorLabel: 'Lyon NV city links',
        url,
        status: res.status,
        pass: hasFernley && hasYerington,
        checks: { hasFernley, hasYerington },
        note:
          hasFernley && hasYerington
            ? 'County page lists expected cities'
            : 'Missing expected city links on county page',
      });
    } catch (e) {
      uiResults.push({ anchorLabel: 'Lyon NV city links', url, status: 0, pass: false, error: e.message });
    }
  }

  return uiResults;
}

function deltaLabel(current, baseline) {
  const d = current - baseline;
  if (d === 0) return '0';
  return d > 0 ? `+${d}` : String(d);
}

function buildMarkdownSummary({ scan, anchors, uiResults, baseline }) {
  const priorityAnchors = anchors.filter(
    (a) =>
      a.id === 'LIM-01' ||
      (a.id === 'LIM-02' && a.type === 'lim02_facts') ||
      a.id === 'LIM-02-control',
  );
  const priorityFails = priorityAnchors.filter((a) => !a.pass && a.id !== 'N/A');
  const allFixed =
    scan.lim01Count === 0 &&
    scan.lim02Count === 0 &&
    priorityFails.length === 0;

  const lines = [];
  lines.push('## Executive summary');
  if (allFixed) {
    lines.push(
      'Upstream validation indicates **full resolution**: national LIM-01/LIM-02 counts are zero and all priority anchors pass.',
    );
  } else if (
    scan.lim01Count < baseline.lim01Count * 0.9 ||
    scan.lim02Count < baseline.lim02Count * 0.9 ||
    priorityFails.length < priorityAnchors.length
  ) {
    lines.push(
      'Upstream validation indicates **partial improvement** vs May 2026 baseline. See metrics and remaining limitations below.',
    );
  } else {
    lines.push(
      'Upstream validation indicates **no material change** vs May 2026 baseline on national scan metrics.',
    );
  }
  lines.push('');

  lines.push('## National scan vs baseline');
  lines.push('');
  lines.push('| Metric | May 2026 | Current | Δ |');
  lines.push('|--------|----------|---------|---|');
  lines.push(
    `| LIM-01 counties | ${baseline.lim01Count} | ${scan.lim01Count} | ${deltaLabel(scan.lim01Count, baseline.lim01Count)} |`,
  );
  lines.push(
    `| LIM-02 city–county pairs | ${baseline.lim02Count} | ${scan.lim02Count} | ${deltaLabel(scan.lim02Count, baseline.lim02Count)} |`,
  );
  lines.push(
    `| Orphan countyName cities | ${baseline.orphanCountyNameCount} | ${scan.orphanCountyNameCount} | ${deltaLabel(scan.orphanCountyNameCount, baseline.orphanCountyNameCount)} |`,
  );
  lines.push(
    `| Fallback-only counties | ~${baseline.fallbackOnlyCount} | ${scan.fallbackOnlyCount} | ${deltaLabel(scan.fallbackOnlyCount, baseline.fallbackOnlyCount)} |`,
  );
  lines.push(
    `| Hierarchy-only counties | ${baseline.hierarchyOnlyCount} | ${scan.hierarchyOnlyCount} | ${deltaLabel(scan.hierarchyOnlyCount, baseline.hierarchyOnlyCount)} |`,
  );
  lines.push('');

  lines.push('## Anchor results (API)');
  lines.push('');
  lines.push('| ID | Label | Pass | Note |');
  lines.push('|----|-------|------|------|');
  for (const a of anchors) {
    lines.push(`| ${a.id} | ${a.label} | ${a.pass ? 'Yes' : 'No'} | ${a.note} |`);
  }
  lines.push('');

  if (uiResults?.length) {
    lines.push('## Anchor results (UI)');
    lines.push('');
    lines.push('| Page | Pass | Note |');
    lines.push('|------|------|------|');
    for (const u of uiResults) {
      lines.push(`| ${u.anchorLabel} | ${u.pass ? 'Yes' : 'No'} | ${u.note ?? u.error ?? ''} |`);
    }
    lines.push('');
  }

  const regressions = anchors.filter((a) => a.type === 'regression_merge');
  lines.push('## Regression checks');
  lines.push('');
  for (const r of regressions) {
    lines.push(`- **${r.label}**: ${r.pass ? 'PASS' : 'FAIL'} (${r.api.mergedCount} merged)`);
  }
  lines.push('');

  if (priorityFails.length > 0 || scan.lim01Count > 0) {
    lines.push('## Remaining limitations (priority)');
    lines.push('');
    for (const f of priorityFails) {
      lines.push(`- **${f.id}** ${f.label} (\`${f.slug}\`): ${f.note}`);
    }
    if (scan.lim01Sample?.length) {
      lines.push('');
      lines.push('### LIM-01 sample (first 15)');
      for (const row of scan.lim01Sample.slice(0, 15)) {
        lines.push(`- \`${row.slug}\` — cityLargest: ${row.cityLargest}`);
      }
    }
    lines.push('');
  }

  return { markdown: lines.join('\n'), priorityFails, allFixed };
}

async function main() {
  const { apiOnly, skipScan, siteUrl, quiet } = parseArgs();
  const fetchJson = createFetchJson(BASE);

  if (!quiet) {
    console.error(`Election API: ${BASE}`);
    if (siteUrl) console.error(`Site URL: ${siteUrl}`);
  }

  let scan = null;
  if (!skipScan) {
    if (!quiet) console.error('Running national scan (may take 10–15 min)...');
    scan = await runNationalScan({
      base: BASE,
      onStateProgress: (s) => {
        if (!quiet) process.stderr.write(`  scan ${s}\n`);
      },
    });
    scan.lim01Sample = scan.lim01.slice(0, 30);
    scan.lim02Sample = scan.lim02.slice(0, 40);
    scan.orphanSample = scan.orphanCountyName.slice(0, 25);
  } else {
    scan = {
      scannedAt: new Date().toISOString(),
      base: BASE,
      lim01Count: 0,
      lim02Count: 0,
      orphanCountyNameCount: 0,
      fallbackOnlyCount: 0,
      hierarchyOnlyCount: 0,
      lim01: [],
      lim02: [],
      lim01Sample: [],
      lim01ByState: {},
    };
  }

  if (!quiet) console.error('Running anchor matrix...');
  const anchors = await runAnchorMatrix(fetchJson);

  let uiResults = null;
  if (siteUrl && !apiOnly) {
    if (!quiet) console.error('Running UI spot-checks...');
    uiResults = await runUiChecks(siteUrl, anchors);
  }

  const { markdown, priorityFails } = buildMarkdownSummary({
    scan,
    anchors,
    uiResults,
    baseline: BASELINE_MAY_2026,
  });

  const report = {
    scannedAt: scan.scannedAt,
    apiBase: BASE,
    siteUrl: siteUrl ?? null,
    baseline: BASELINE_MAY_2026,
    national: {
      lim01Count: scan.lim01Count,
      lim02Count: scan.lim02Count,
      orphanCountyNameCount: scan.orphanCountyNameCount,
      fallbackOnlyCount: scan.fallbackOnlyCount,
      hierarchyOnlyCount: scan.hierarchyOnlyCount,
      lim01ByState: scan.lim01ByState,
      lim01Sample: scan.lim01Sample,
      lim02Sample: scan.lim02Sample,
      orphanSample: scan.orphanSample,
    },
    anchors,
    uiResults,
    priorityAnchorFailures: priorityFails.map((a) => ({
      id: a.id,
      label: a.label,
      slug: a.slug,
      note: a.note,
    })),
    markdownSummary: markdown,
  };

  const reportDir = join(process.cwd(), '.reports', 'elections-limitations');
  await mkdir(reportDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outPath = join(reportDir, `elections-validation-${timestamp}.json`);
  await writeFile(outPath, JSON.stringify(report, null, 2), 'utf-8');

  if (!quiet) {
    console.error(`Report written: ${outPath}`);
    console.log('\n--- markdown summary ---\n');
  }
  console.log(markdown);

  const uiFailed = uiResults?.some((u) => !u.pass) ?? false;
  if (priorityFails.length > 0 || uiFailed) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
