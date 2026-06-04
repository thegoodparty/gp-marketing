/**
 * Shared elections limitations audit logic (mirrors getCountyChildPlaces + hasSuspiciousFactsMatch).
 * Used by scripts/elections-limitations/audit.mjs and validate.mjs.
 */

export const CITY_MTFCC = 'G4110';
export const TOWN_MTFCC = 'G4040';
export const COUNTY_MTFCC = 'G4020';
export const FACT_FIELDS = [
  'population',
  'density',
  'incomeHouseholdMedian',
  'unemploymentRate',
  'homeValue',
];

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY',
  'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH',
  'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

/** May 2026 baseline from docs/elections-known-limitations.md */
export const BASELINE_MAY_2026 = {
  lim01Count: 251,
  lim02Count: 20201,
  orphanCountyNameCount: 203,
  fallbackOnlyCount: 1600,
  hierarchyOnlyCount: 9,
};

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createFetchJson(base) {
  return async function fetchJson(path) {
    const url = `${base}${path}`;
    const res = await fetch(url);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return res.json();
  };
}

export function normalizeName(name) {
  return (name ?? '').replace(/[.\s''\-]/g, '').toLowerCase();
}

export function countyBaseFromSlug(countySlug) {
  const part = countySlug.split('/').pop() ?? '';
  const withoutSuffix = part.replace(
    /-(county|parish|city-and-borough|city-and-county|borough|census-area)$/i,
    '',
  );
  return withoutSuffix.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function canonicalBaseName(state, rawName) {
  const normalized = (rawName ?? '').trim().replace(/\s+/g, ' ');
  const tailRe =
    /\s+(County|Parish|Borough|Census Area|City and Borough|City and County|Municipality)\s*$/i;
  const base = normalized.replace(tailRe, '').trim() || normalized;
  return normalizeName(base);
}

export function isCityOrTown(mtfcc) {
  return mtfcc === CITY_MTFCC || mtfcc === TOWN_MTFCC;
}

export function suspiciousFactsMatch(city, county) {
  if (!city || !county) return false;
  let compared = 0;
  for (const field of FACT_FIELDS) {
    const cv = city[field];
    const kv = county[field];
    if (typeof cv !== 'number' || typeof kv !== 'number') continue;
    compared += 1;
    if (cv !== kv) return false;
  }
  return compared >= 2;
}

/** Count numeric fact fields that differ between city and county. */
export function countDifferingFacts(city, county) {
  let differing = 0;
  let compared = 0;
  for (const field of FACT_FIELDS) {
    const cv = city?.[field];
    const kv = county?.[field];
    if (typeof cv !== 'number' || typeof kv !== 'number') continue;
    compared += 1;
    if (cv !== kv) differing += 1;
  }
  return { differing, compared };
}

export async function mapPool(items, concurrency, fn) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

/**
 * National scan: LIM-01, LIM-02, orphan countyName, merge gaps.
 * @param {{ base: string, onStateProgress?: (state: string) => void }} options
 */
export async function runNationalScan({ base, onStateProgress }) {
  const fetchJson = createFetchJson(base);
  const lim01 = [];
  const lim02 = [];
  const orphanCountyName = [];
  const mergeGaps = [];
  const stateStats = {};

  for (const state of US_STATES) {
    onStateProgress?.(state);
    stateStats[state] = { counties: 0, lim01: 0, lim02: 0 };
    let counties = [];
    let cities = [];
    let towns = [];

    try {
      counties =
        (await fetchJson(
          `/v1/places?state=${state}&mtfcc=${COUNTY_MTFCC}&placeColumns=slug,name,population`,
        )) ?? [];
    } catch (e) {
      console.error(`counties ${state}:`, e.message);
      await sleep(200);
      continue;
    }

    try {
      cities =
        (await fetchJson(
          `/v1/places?state=${state}&mtfcc=${CITY_MTFCC}&placeColumns=slug,name,countyName,population,density,incomeHouseholdMedian,unemploymentRate,homeValue,mtfcc`,
        )) ?? [];
    } catch {
      cities = [];
    }

    try {
      towns =
        (await fetchJson(
          `/v1/places?state=${state}&mtfcc=${TOWN_MTFCC}&placeColumns=slug,name,countyName,population,density,incomeHouseholdMedian,unemploymentRate,homeValue,mtfcc`,
        )) ?? [];
    } catch {
      towns = [];
    }

    const countyByBase = new Map();
    for (const c of counties) {
      if (!c.slug) continue;
      countyByBase.set(canonicalBaseName(state, countyBaseFromSlug(c.slug)), c);
    }

    for (const place of [...cities, ...towns]) {
      if (!place.slug || !place.countyName) continue;
      const childBase = canonicalBaseName(state, place.countyName);
      if (!countyByBase.has(childBase)) {
        orphanCountyName.push({
          state,
          slug: place.slug,
          countyName: place.countyName,
        });
      }
    }

    stateStats[state].counties = counties.length;

    const countyDetails = await mapPool(
      counties.filter((c) => c.slug),
      6,
      async (county) => {
        try {
          const rows =
            (await fetchJson(
              `/v1/places?slug=${encodeURIComponent(county.slug)}&includeChildren=true&placeColumns=slug,name,mtfcc,cityLargest,population,density,incomeHouseholdMedian,unemploymentRate,homeValue`,
            )) ?? [];
          return rows[0] ?? null;
        } catch {
          return null;
        }
      },
    );

    for (const detail of countyDetails) {
      if (!detail?.slug) continue;
      const hierarchyChildren = (detail.children ?? []).filter((c) => isCityOrTown(c.mtfcc));
      const countyBase = canonicalBaseName(state, countyBaseFromSlug(detail.slug));
      const fallback = [...cities, ...towns].filter(
        (p) => canonicalBaseName(state, p.countyName ?? '') === countyBase,
      );
      const mergedSlugs = new Set([
        ...hierarchyChildren.map((c) => c.slug?.toLowerCase()).filter(Boolean),
        ...fallback.map((c) => c.slug?.toLowerCase()).filter(Boolean),
      ]);

      const hasCityLargest = Boolean(detail.cityLargest?.trim());
      if (mergedSlugs.size === 0 && hasCityLargest) {
        lim01.push({
          state,
          slug: detail.slug,
          cityLargest: detail.cityLargest,
          name: detail.name,
        });
        stateStats[state].lim01 += 1;
      }

      if (hierarchyChildren.length > 0 && fallback.length === 0) {
        mergeGaps.push({
          type: 'hierarchy_only',
          state,
          countySlug: detail.slug,
          hierarchy: hierarchyChildren.map((c) => c.slug),
        });
      } else if (hierarchyChildren.length === 0 && fallback.length > 0) {
        mergeGaps.push({
          type: 'fallback_only',
          state,
          countySlug: detail.slug,
          fallback: fallback.map((c) => c.slug),
        });
      }

      let stateLim02 = 0;
      for (const childSlug of mergedSlugs) {
        const child =
          [...hierarchyChildren, ...fallback].find((c) => c.slug?.toLowerCase() === childSlug) ??
          null;
        if (!child) continue;
        if (suspiciousFactsMatch(child, detail)) {
          lim02.push({
            state,
            citySlug: child.slug,
            countySlug: detail.slug,
            mtfcc: child.mtfcc,
          });
          stateLim02 += 1;
        }
      }
      stateStats[state].lim02 += stateLim02;
    }
  }

  return {
    scannedAt: new Date().toISOString(),
    base,
    lim01,
    lim02,
    orphanCountyName,
    mergeGaps,
    stateStats,
    lim01Count: lim01.length,
    lim02Count: lim02.length,
    orphanCountyNameCount: orphanCountyName.length,
    mergeGapCount: mergeGaps.length,
    lim01ByState: Object.fromEntries(
      Object.entries(stateStats)
        .filter(([, s]) => s.lim01 > 0)
        .map(([st, s]) => [st, s.lim01]),
    ),
    hierarchyOnlyCount: mergeGaps.filter((g) => g.type === 'hierarchy_only').length,
    fallbackOnlyCount: mergeGaps.filter((g) => g.type === 'fallback_only').length,
  };
}

/** Fetch a single place by slug (first row). */
export async function fetchPlaceBySlug(fetchJson, slug, extraParams = {}) {
  const params = new URLSearchParams({
    slug,
    placeColumns:
      'slug,name,mtfcc,cityLargest,population,density,incomeHouseholdMedian,unemploymentRate,homeValue,countyName',
    ...extraParams,
  });
  if (extraParams.includeChildren) {
    params.set('includeChildren', 'true');
  }
  const rows = (await fetchJson(`/v1/places?${params.toString()}`)) ?? [];
  return rows[0] ?? null;
}

/** Merged municipal children for a county (hierarchy + fallback). */
export async function getMergedCountyChildren(fetchJson, state, countySlug, stateCities, stateTowns) {
  const detail = await fetchPlaceBySlug(fetchJson, countySlug, { includeChildren: true });
  if (!detail) return { detail: null, merged: [], hierarchyChildren: [], fallback: [] };

  const hierarchyChildren = (detail.children ?? []).filter((c) => isCityOrTown(c.mtfcc));
  const countyBase = canonicalBaseName(state, countyBaseFromSlug(countySlug));
  const fallback = [...(stateCities ?? []), ...(stateTowns ?? [])].filter(
    (p) => canonicalBaseName(state, p.countyName ?? '') === countyBase,
  );
  const seen = new Set();
  const merged = [];
  for (const c of [...hierarchyChildren, ...fallback]) {
    const key = c.slug?.toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(c);
  }
  return { detail, merged, hierarchyChildren, fallback };
}
