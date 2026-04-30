import type {
	CandidacyItem,
	DistrictNameItem,
	DistrictTypeItem,
	FeaturedCity,
	FindByRaceIdResponse,
	PlaceItem,
	PlaceWithFacts,
	PositionDetail,
	RaceDetail,
	RaceNode,
} from '~/types/elections';
import { canonicalizeCountyEquivalentName } from '~/lib/electionsHelpers';

const BASE_URL =
	process.env['ELECTIONS_API_BASE_URL'] ?? 'https://election-api.goodparty.org';

const CACHE_OPTIONS = { next: { revalidate: 3600 } } as RequestInit;

/** MTFCC for county / county-equivalent places (e.g. District of Columbia). */
export const COUNTY_MTFCC = 'G4020';

/** MTFCC for incorporated places (cities, towns). */
export const CITY_MTFCC = 'G4110';
export const TOWN_MTFCC = 'G4040';

/** True for incorporated places (cities, towns) used as county child localities. */
export function isCityOrTownMtfcc(mtfcc?: string): boolean {
	return mtfcc === CITY_MTFCC || mtfcc === TOWN_MTFCC;
}

/** MTFCC codes for school districts (elementary, secondary, unified). */
export const DISTRICT_MTFCCS = ['G5400', 'G5410', 'G5420'] as const;

export function isDistrictMtfcc(mtfcc?: string): boolean {
	return mtfcc?.startsWith('G54') ?? false;
}

const FETCH_JSON_MAX_RETRIES = 2;

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T | null> {
	for (let attempt = 0; attempt <= FETCH_JSON_MAX_RETRIES; attempt++) {
		try {
			const res = await fetch(url, options);
			if (res.status === 404) return null;
			if (res.ok) return (await res.json()) as T;
			if (res.status < 500) {
				console.error(`[electionsApi] ${res.status} ${url}`);
				return null;
			}
			console.error(`[electionsApi] ${res.status} ${url} (attempt ${attempt + 1})`);
		} catch (err) {
			console.error(`[electionsApi] attempt ${attempt + 1}`, err);
		}
		if (attempt < FETCH_JSON_MAX_RETRIES) {
			await sleep(500 * (attempt + 1));
		}
	}
	return null;
}

export async function getRacesByYear(params: {
	zipcode: string;
	level?: 'LOCAL' | 'CITY' | 'COUNTY' | 'STATE' | 'FEDERAL';
	electionDate?: string;
}): Promise<RaceNode[]> {
	const searchParams = new URLSearchParams({ zipcode: params.zipcode });
	if (params.level) searchParams.set('level', params.level);
	if (params.electionDate) searchParams.set('electionDate', params.electionDate);
	const url = `${BASE_URL}/v1/elections/races-by-year?${searchParams}`;
	const data = await fetchJson<RaceNode[]>(url);
	return data ?? [];
}

export async function getDistrictTypes(params: {
	state: string;
	electionYear: number;
	excludeInvalid?: boolean;
}): Promise<DistrictTypeItem[]> {
	const searchParams = new URLSearchParams({
		state: params.state.toUpperCase(),
		electionYear: params.electionYear.toString(),
		excludeInvalid: (params.excludeInvalid ?? true).toString(),
	});
	const url = `${BASE_URL}/v1/districts/types?${searchParams}`;
	const data = await fetchJson<DistrictTypeItem[]>(url, CACHE_OPTIONS);
	return data ?? [];
}

export async function getDistrictNames(params: {
	L2DistrictType: string;
	state: string;
	electionYear: number;
	excludeInvalid?: boolean;
}): Promise<DistrictNameItem[]> {
	const searchParams = new URLSearchParams({
		L2DistrictType: params.L2DistrictType,
		state: params.state.toUpperCase(),
		electionYear: params.electionYear.toString(),
	});
	if (params.excludeInvalid !== undefined) {
		searchParams.set('excludeInvalid', params.excludeInvalid.toString());
	}
	const url = `${BASE_URL}/v1/districts/names?${searchParams}`;
	const data = await fetchJson<DistrictNameItem[]>(url, CACHE_OPTIONS);
	return data ?? [];
}

export async function getPositionById(id: string): Promise<PositionDetail | null> {
	const url = `${BASE_URL}/v1/positions/${encodeURIComponent(id)}`;
	return fetchJson<PositionDetail>(url, CACHE_OPTIONS);
}

export async function getRaceBySlug(
	raceSlug: string,
	includePlace = true,
): Promise<RaceDetail | null> {
	const searchParams = new URLSearchParams({
		raceSlug,
		includePlace: includePlace.toString(),
	});
	const url = `${BASE_URL}/v1/races?${searchParams}`;
	const data = await fetchJson<RaceDetail[]>(url, CACHE_OPTIONS);
	return Array.isArray(data) && data.length > 0 ? (data[0] ?? null) : null;
}

export async function getCandidacies(params: {
	raceId?: string;
	positionId?: string;
	raceSlug?: string;
}): Promise<CandidacyItem[]> {
	const searchParams = new URLSearchParams();
	if (params.raceId) searchParams.set('raceId', params.raceId);
	if (params.positionId) searchParams.set('positionId', params.positionId);
	if (params.raceSlug) searchParams.set('raceSlug', params.raceSlug);
	if (searchParams.toString() === '') return [];
	const url = `${BASE_URL}/v1/candidacies?${searchParams}`;
	const data = await fetchJson<CandidacyItem[]>(url);
	return Array.isArray(data) ? data : [];
}

export async function getCandidateBySlug(params: {
	slug: string;
	includeStances?: boolean;
	includeRace?: boolean;
}): Promise<CandidacyItem | null> {
	const searchParams = new URLSearchParams({
		slug: params.slug,
		includeStances: (params.includeStances ?? true).toString(),
		includeRace: (params.includeRace ?? true).toString(),
	});
	const url = `${BASE_URL}/v1/candidacies?${searchParams}`;
	const data = await fetchJson<CandidacyItem[]>(url, CACHE_OPTIONS);
	return Array.isArray(data) && data.length > 0 ? (data[0] ?? null) : null;
}

/**
 * Candidacy slug strings for a state (same source as sitemap candidate URLs).
 */
export async function fetchCandidacySlugs(stateCode: string): Promise<string[]> {
	const searchParams = new URLSearchParams({
		state: stateCode.toUpperCase(),
		columns: 'slug',
	});
	const url = `${BASE_URL}/v1/candidacies?${searchParams}`;
	const data = await fetchJson<Array<{ slug?: string }>>(url, CACHE_OPTIONS);
	if (!Array.isArray(data)) return [];
	return data.map((c) => c.slug).filter((s): s is string => typeof s === 'string' && s.length > 0);
}

export async function findCampaignByRace(params: {
	raceId: string;
	firstName: string;
	lastName: string;
}): Promise<FindByRaceIdResponse | null> {
	const searchParams = new URLSearchParams({
		raceId: params.raceId,
		firstName: params.firstName,
		lastName: params.lastName,
	});
	const url = `${BASE_URL}/v1/public-campaigns?${searchParams}`;
	return fetchJson<FindByRaceIdResponse>(url);
}

export async function getMostElections(count = 3): Promise<FeaturedCity[]> {
	const url = `${BASE_URL}/v1/places/most-elections?count=${count}`;
	const data = await fetchJson<FeaturedCity[]>(url, CACHE_OPTIONS);
	return Array.isArray(data) ? data : [];
}

export async function getPlacesByState(params: {
	state: string;
	mtfcc?: string;
}): Promise<PlaceItem[]> {
	const searchParams = new URLSearchParams({
		state: params.state.toUpperCase(),
	});
	if (params.mtfcc) searchParams.set('mtfcc', params.mtfcc);
	const url = `${BASE_URL}/v1/places?${searchParams}`;
	const data = await fetchJson<PlaceItem[]>(url, CACHE_OPTIONS);
	return Array.isArray(data) ? data : [];
}

/** Normalize place name for comparison (strip punctuation, lowercase). */
function normalizeName(name: string): string {
	return name.replace(/[.\s''\-]/g, '').toLowerCase();
}

/** Derives county name from county slug (e.g. "ca/los-angeles-county" -> "Los Angeles"). */
function countyNameFromSlug(countySlug: string): string {
	const part = countySlug.split('/').pop() ?? '';
	const withoutSuffix = part.replace(
		/-(county|parish|city-and-borough|city-and-county|borough|census-area|municipio)$/i,
		'',
	);
	return withoutSuffix.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export async function getCityPlacesByCounty(params: {
	state: string;
	countySlug: string;
}): Promise<PlaceItem[]> {
	const allCities = await getPlacesByState({ state: params.state, mtfcc: CITY_MTFCC });
	const countyName = countyNameFromSlug(params.countySlug);
	const normalizedCountyBaseName = canonicalizeCountyEquivalentName(params.state, countyName).baseName;
	return allCities.filter(
		p =>
			normalizeName(canonicalizeCountyEquivalentName(params.state, p.countyName ?? '').baseName) ===
			normalizeName(normalizedCountyBaseName),
	);
}

function dedupePlacesBySlug(places: PlaceItem[]): PlaceItem[] {
	const seen = new Set<string>();
	const out: PlaceItem[] = [];
	for (const p of places) {
		const slug = p.slug?.toLowerCase();
		if (!slug || seen.has(slug)) continue;
		seen.add(slug);
		out.push({
			...p,
			name: (p.name ?? '').trim(),
		});
	}
	return out;
}

export async function getCountyChildPlaces(params: {
	state: string;
	countySlug: string;
}): Promise<PlaceItem[]> {
	const county = await getPlaceBySlug({
		slug: params.countySlug,
		includeChildren: true,
		includeRaces: false,
		placeColumns: 'slug,name,mtfcc,countyName',
	});
	const hierarchyChildren = (county?.children ?? []).filter(
		p => isCityOrTownMtfcc(p.mtfcc) && !isDistrictMtfcc(p.mtfcc),
	);
	const fallbackCities = await getCityPlacesByCounty(params);
	return dedupePlacesBySlug([...hierarchyChildren, ...fallbackCities]);
}

export async function getPlaceBySlug(params: {
	slug: string;
	includeChildren?: boolean;
	includeRaces?: boolean;
	placeColumns?: string;
	raceColumns?: string;
}): Promise<PlaceWithFacts | null> {
	const searchParams = new URLSearchParams({
		slug: params.slug,
		includeChildren: (params.includeChildren ?? false).toString(),
		includeRaces: (params.includeRaces ?? false).toString(),
	});
	if (params.placeColumns) searchParams.set('placeColumns', params.placeColumns);
	if (params.raceColumns) searchParams.set('raceColumns', params.raceColumns);
	const url = `${BASE_URL}/v1/places?${searchParams}`;
	const data = await fetchJson<PlaceWithFacts[]>(url, CACHE_OPTIONS);
	return Array.isArray(data) && data.length > 0 ? (data[0] ?? null) : null;
}
