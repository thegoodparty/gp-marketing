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
import type {
	PersonItem,
	PersonOfficeHolder,
	PublicPersonProfile,
	VoterDensity,
} from '~/types/people';
import {
	buildElectionPositionHrefFromRaceSlug,
	buildRaceCandidatesHref,
	buildSubplaceRaceSlug,
	canonicalizeCountyEquivalentName,
	normalizeCandidateLookupName,
	stripCountySuffix,
} from '~/lib/electionsHelpers';
import { ElectionApiError, fetchElectionApiJsonCached } from '~/lib/electionApiFetch';

const ELECTIONS_API_BASE_URL =
	process.env['ELECTIONS_API_BASE_URL'] ?? 'https://election-api.goodparty.org';

const GP_API_BASE_URL =
	process.env['GP_API_BASE_URL'] ??
	process.env['NEXT_PUBLIC_API_BASE'] ??
	ELECTIONS_API_BASE_URL.replace('election-api', 'gp-api');

const CACHE_OPTIONS = { next: { revalidate: 3600 } } satisfies RequestInit;

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

const COUNTY_EQUIVALENT_SLUG_SUFFIX_RE =
	/(?:-county|-parish|-borough|-census-area|-city-and-borough|-city-and-county)$/i;

/** Matches common school / district naming (incl. VT UHSD and supervisory-union phrases). */
const DISTRICT_KEYWORD_RE =
	/\b(district|schools?|isd|usd|csd|sd|rsu|sau|uhsd)\b|\bsupervisory(?:\s+|-)union\b/i;

export function looksLikeCountySlugSegment(segment: string): boolean {
	return COUNTY_EQUIVALENT_SLUG_SUFFIX_RE.test(segment);
}

export function looksLikeDistrictSlug(segment: string): boolean {
	return DISTRICT_KEYWORD_RE.test(segment);
}

/**
 * Defensive classification for the state-level elections index "districts" list.
 * Some API payloads (notably Maine) attach G54xx to municipality-like slugs; we only
 * keep rows that look district-shaped by slug depth, county-equivalent tail, or
 * district keywords in name/slug.
 */
export function isStateIndexDistrictPlace(place: Pick<PlaceItem, 'name' | 'slug' | 'mtfcc'>): boolean {
	if (!isDistrictMtfcc(place.mtfcc)) return false;
	const slug = (place.slug ?? '').toLowerCase();
	const name = (place.name ?? '').toLowerCase();
	const segments = slug.split('/').filter(Boolean);
	const tail = segments[segments.length - 1] ?? '';

	if (segments.length >= 3) return true;
	if (COUNTY_EQUIVALENT_SLUG_SUFFIX_RE.test(tail)) return true;
	return DISTRICT_KEYWORD_RE.test(name) || DISTRICT_KEYWORD_RE.test(tail);
}

const FETCH_JSON_MAX_RETRIES = 2;

async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T | null> {
	// election-api: auth + URL-keyed unstable_cache (Authorization must not be in the
	// Next fetch cache key or the shared 1h cache stops hitting across isolates).
	if (url.startsWith(ELECTIONS_API_BASE_URL)) {
		// Forward on-demand revalidation tags (e.g. person:<id>) so cache busts
		// via /api/revalidate-person actually invalidate these cached responses.
		const tags = (options as { next?: { tags?: readonly string[] } } | undefined)?.next?.tags;
		for (let attempt = 0; attempt <= FETCH_JSON_MAX_RETRIES; attempt++) {
			try {
				const result = await fetchElectionApiJsonCached(url, tags);
				if (result.status === 404) return null;
				return result.json as T;
			} catch (err) {
				// A 4xx is a deterministic answer — retrying just re-asks the same bad
				// question three times and delays the null by 1.5s. Only 5xx and
				// transport errors are worth another attempt.
				if (err instanceof ElectionApiError && err.status < 500) {
					console.error(`[electionsApi] ${err.status} ${url}`);
					return null;
				}
				console.error(`[electionsApi] attempt ${attempt + 1}`, err);
			}
			if (attempt < FETCH_JSON_MAX_RETRIES) {
				await sleep(500 * (attempt + 1));
			}
		}
		return null;
	}

	// gp-api and other hosts: no M2M token (election-api-scoped).
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
	const url = `${ELECTIONS_API_BASE_URL}/v1/elections/races-by-year?${searchParams}`;
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
	const url = `${ELECTIONS_API_BASE_URL}/v1/districts/types?${searchParams}`;
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
	const url = `${ELECTIONS_API_BASE_URL}/v1/districts/names?${searchParams}`;
	const data = await fetchJson<DistrictNameItem[]>(url, CACHE_OPTIONS);
	return data ?? [];
}

export async function getPositionById(id: string): Promise<PositionDetail | null> {
	const url = `${ELECTIONS_API_BASE_URL}/v1/positions/${encodeURIComponent(id)}`;
	return fetchJson<PositionDetail>(url, CACHE_OPTIONS);
}

export async function getRaceBySlug(
	raceSlug: string,
	includePlace = true,
	filters?: { isPrimary?: boolean },
): Promise<RaceDetail | null> {
	const searchParams = new URLSearchParams({
		raceSlug,
		includePlace: includePlace.toString(),
	});
	if (filters?.isPrimary !== undefined) {
		searchParams.set('isPrimary', filters.isPrimary.toString());
	}
	const url = `${ELECTIONS_API_BASE_URL}/v1/races?${searchParams}`;
	const data = await fetchJson<RaceDetail[]>(url, CACHE_OPTIONS);
	return Array.isArray(data) && data.length > 0 ? (data[0] ?? null) : null;
}

/** Resolves joint city office races; API slugs omit the county segment. */
export async function getSubplaceRaceBySlug(params: {
	state: string;
	county: string;
	city: string;
	subplace: string;
	positionSlug: string;
}): Promise<RaceDetail | null> {
	const { state, county, city, subplace, positionSlug } = params;
	let race = await getRaceBySlug(
		buildSubplaceRaceSlug(state, city, subplace, positionSlug, county),
	);
	if (!race) {
		race = await getRaceBySlug(buildSubplaceRaceSlug(state, city, subplace, positionSlug));
	}
	return race;
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
	const url = `${ELECTIONS_API_BASE_URL}/v1/candidacies?${searchParams}`;
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
	const url = `${ELECTIONS_API_BASE_URL}/v1/candidacies?${searchParams}`;
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
	const url = `${ELECTIONS_API_BASE_URL}/v1/candidacies?${searchParams}`;
	const data = await fetchJson<Array<{ slug?: string }>>(url, CACHE_OPTIONS);
	if (!Array.isArray(data)) return [];
	return data.map((c) => c.slug).filter((s): s is string => typeof s === 'string' && s.length > 0);
}

export async function findCampaignByRace(params: {
	raceId: string;
	firstName: string;
	lastName: string;
}): Promise<FindByRaceIdResponse | null> {
	const firstName = normalizeCandidateLookupName(params.firstName);
	const lastName = normalizeCandidateLookupName(params.lastName);
	if (!firstName || !lastName) {
		return null;
	}

	const searchParams = new URLSearchParams({
		raceId: params.raceId,
		firstName,
		lastName,
	});
	const url = `${GP_API_BASE_URL.replace(/\/$/, '')}/v1/public-campaigns?${searchParams}`;
	return fetchJson<FindByRaceIdResponse>(url);
}

/**
 * Cache tag for everything that composes one person's public page. gp-api busts
 * this tag (via /api/revalidate-person) on publish/unpublish/delete/edit so the
 * page is regenerated regardless of its name-based slug.
 */
export function personCacheTag(personId: string): string {
	return `person:${personId.toLowerCase()}`;
}

function personCacheOptions(personId: string): RequestInit {
	return { next: { revalidate: 3600, tags: [personCacheTag(personId)] } };
}

/**
 * Cache tag for the set of people whose pages must never be advertised. Busted
 * by /api/revalidate-person alongside the per-person tag, so a fresh takedown
 * reaches the *other* profiles that carry the removed person's photo on a card,
 * not just their own page.
 */
export const PEOPLE_REMOVALS_CACHE_TAG = 'people-removals';

/**
 * Person ids gp-api has flagged as removed (a privacy takedown, or an owner who
 * deleted their profile — gp-api collapses both because the consequence is the
 * same: never advertise this page).
 *
 * Returns null, not an empty set, when the feed cannot be read. Callers treat
 * null as "assume everyone is removed" and drop every card photo: a gp-api blip
 * should cost us some thumbnails, never republish a photo somebody asked us to
 * take down.
 */
export async function getRemovedPersonIds(): Promise<Set<string> | null> {
	const url = `${GP_API_BASE_URL.replace(/\/$/, '')}/v1/public-person-profiles/unlisted`;
	try {
		const res = await fetch(url, {
			next: { revalidate: 300, tags: [PEOPLE_REMOVALS_CACHE_TAG] },
		});
		if (!res.ok) {
			console.error(`[electionsApi] ${res.status} ${url}`);
			return null;
		}
		const rows = (await res.json()) as Array<{ personId?: string }>;
		if (!Array.isArray(rows)) return null;
		const ids = new Set<string>();
		for (const row of rows) {
			if (row.personId) ids.add(row.personId.toLowerCase());
		}
		return ids;
	} catch (err) {
		console.error('[electionsApi] removed-person feed unreachable', err);
		return null;
	}
}

/**
 * The read-only civics spine for one person (election-api). Includes their
 * office terms and candidacies. Returns null when no Person row exists yet
 * (e.g. a brand-new user the data team hasn't reconciled).
 */
export async function getPersonByPersonId(personId: string): Promise<PersonItem | null> {
	const url = `${ELECTIONS_API_BASE_URL}/v1/persons/${encodeURIComponent(personId)}`;
	return fetchJson<PersonItem>(url, personCacheOptions(personId));
}

/**
 * Resolves a `/people/<base>-<id8>` URL to a person. election-api parses the
 * trailing 8-hex id suffix and resolves via an indexed id-range scan (the base
 * slug is non-unique). Returns null on miss (404) so the page can 404. The
 * profile then loads by the resolved personId (so per-person cache-busting by
 * `person:<uuid>` tag still applies).
 */
export async function getPersonBySlug(slug: string): Promise<PersonItem | null> {
	const url = `${ELECTIONS_API_BASE_URL}/v1/persons/by-slug/${encodeURIComponent(slug)}`;
	return fetchJson<PersonItem>(url, CACHE_OPTIONS);
}

/** Office terms held by a person (election-api). */
export async function getOfficeHoldersByPerson(personId: string): Promise<PersonOfficeHolder[]> {
	const searchParams = new URLSearchParams({ personId, includePosition: 'true' });
	const url = `${ELECTIONS_API_BASE_URL}/v1/officeholders?${searchParams}`;
	const data = await fetchJson<PersonOfficeHolder[]>(url, personCacheOptions(personId));
	return Array.isArray(data) ? data : [];
}

/**
 * Office holders sharing a BallotReady geo id — the "Nearby Officials" feed.
 * Person PII is never joined here (election-api omits it), so callers resolve
 * names/slugs separately via getPersonsByIds.
 */
export async function getOfficeHoldersByGeoId(geoId: string): Promise<PersonOfficeHolder[]> {
	const searchParams = new URLSearchParams({ geoId, includePosition: 'true' });
	const url = `${ELECTIONS_API_BASE_URL}/v1/officeholders?${searchParams}`;
	const data = await fetchJson<PersonOfficeHolder[]>(url, CACHE_OPTIONS);
	return Array.isArray(data) ? data : [];
}

/** Batch-resolves canonical Person rows by id (election-api caps `ids` at 500). */
export async function getPersonsByIds(ids: string[]): Promise<PersonItem[]> {
	const unique = Array.from(new Set(ids.filter(Boolean))).slice(0, 500);
	if (unique.length === 0) return [];
	const searchParams = new URLSearchParams({ ids: unique.join(',') });
	const url = `${ELECTIONS_API_BASE_URL}/v1/persons?${searchParams}`;
	const data = await fetchJson<PersonItem[]>(url, CACHE_OPTIONS);
	return Array.isArray(data) ? data : [];
}

/**
 * Precomputed voter-density surface for the person's district (gp-api). This is
 * a progressive enhancement — SSR/SEO content never depends on it, and any
 * non-live result (404 when the person maps to no district, or a transient
 * failure) resolves to null so the profile simply renders no map. The endpoint
 * lives on the heatmap track and may not exist in every environment yet; the
 * null-on-miss contract keeps the profile fully functional regardless.
 */
export async function getVoterDensityForDistrict(
	personId: string,
): Promise<VoterDensity | null> {
	const searchParams = new URLSearchParams({ personId });
	const url = `${GP_API_BASE_URL.replace(/\/$/, '')}/v1/public-person-profiles/voter-density?${searchParams}`;
	return fetchJson<VoterDensity>(url, personCacheOptions(personId));
}

/**
 * Result of resolving a person's product overlay (gp-api). The distinction
 * matters for the render gate:
 *  - `live`        → an owner has claimed + published a profile; enrich the page.
 *  - `absent`      → nobody has claimed this person; the page still renders as an
 *                    unclaimed, programmatic-SEO profile from the election-api
 *                    spine, with claim CTAs.
 *  - `unpublished` → someone owns a profile here but it is not live. Renders the
 *                    same spine page as `absent`, minus every claim CTA — they
 *                    already claimed it, so asking them to claim it is wrong, and
 *                    asking voters to nudge them to finish it is worse.
 *  - `gone`        → the owner deleted their profile; suppress the page entirely.
 */
export type PublicPersonProfileResult =
	| { status: 'live'; profile: PublicPersonProfile }
	| { status: 'absent' }
	| { status: 'unpublished' }
	| { status: 'gone' }
	| { status: 'removed' };

/**
 * The product-owned overlay for a person's public profile (gp-api). gp-api
 * returns 200 (live, removed, or unpublished), 404 (never created), or 410
 * (deleted). We map those to the render-gate outcomes above; any transient/5xx
 * failure falls back to `absent` so the spine page still renders instead of
 * 404-ing.
 */
export async function getPublicPersonProfileStatus(
	personId: string,
): Promise<PublicPersonProfileResult> {
	const searchParams = new URLSearchParams({ personId });
	const url = `${GP_API_BASE_URL.replace(/\/$/, '')}/v1/public-person-profiles?${searchParams}`;
	for (let attempt = 0; attempt <= FETCH_JSON_MAX_RETRIES; attempt++) {
		try {
			const res = await fetch(url, personCacheOptions(personId));
			if (res.ok) {
				const profile = (await res.json()) as PublicPersonProfile;
				// Privacy takedown: gp-api answers 200 with { removed: true } and no
				// authored content. Render the minimal "removal requested" states.
				if (profile.removed === true) return { status: 'removed' };
				// Checked after `removed` because a takedown outranks the owner's own
				// publish state, and gp-api only ever sends one of the two markers.
				if (profile.unpublished === true) return { status: 'unpublished' };
				return { status: 'live', profile };
			}
			if (res.status === 410) return { status: 'gone' };
			if (res.status === 404) return { status: 'absent' };
			if (res.status < 500) {
				console.error(`[electionsApi] ${res.status} ${url}`);
				return { status: 'absent' };
			}
			console.error(`[electionsApi] ${res.status} ${url} (attempt ${attempt + 1})`);
		} catch (err) {
			console.error(`[electionsApi] overlay attempt ${attempt + 1}`, err);
		}
		if (attempt < FETCH_JSON_MAX_RETRIES) {
			await sleep(500 * (attempt + 1));
		}
	}
	return { status: 'absent' };
}

export async function getMostElections(count = 3): Promise<FeaturedCity[]> {
	const url = `${ELECTIONS_API_BASE_URL}/v1/places/most-elections?count=${count}`;
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
	const url = `${ELECTIONS_API_BASE_URL}/v1/places?${searchParams}`;
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
		/-(county|parish|city-and-borough|city-and-county|borough|census-area)$/i,
		'',
	);
	return withoutSuffix.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export async function getCityPlacesByCounty(params: {
	state: string;
	countySlug: string;
}): Promise<PlaceItem[]> {
	const [allCities, allTowns] = await Promise.all([
		getPlacesByState({ state: params.state, mtfcc: CITY_MTFCC }),
		getPlacesByState({ state: params.state, mtfcc: TOWN_MTFCC }),
	]);
	const countyName = countyNameFromSlug(params.countySlug);
	const normalizedCountyBaseName = canonicalizeCountyEquivalentName(params.state, countyName).baseName;
	return [...allCities, ...allTowns].filter(
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
	const url = `${ELECTIONS_API_BASE_URL}/v1/places?${searchParams}`;
	const data = await fetchJson<PlaceWithFacts[]>(url, CACHE_OPTIONS);
	return Array.isArray(data) && data.length > 0 ? (data[0] ?? null) : null;
}

/** Resolves a county place slug from a state code and county name on a city/town place. */
export async function resolveCountySlugForPlace(
	state: string,
	countyName: string,
): Promise<string | undefined> {
	const counties = await getPlacesByState({ state, mtfcc: COUNTY_MTFCC });
	const target = normalizeName(canonicalizeCountyEquivalentName(state, countyName).baseName);
	for (const county of counties) {
		if (!county.slug || !county.name) continue;
		const countyBase = normalizeName(stripCountySuffix(county.name));
		if (countyBase === target) return county.slug;
	}
	return undefined;
}

export type RaceElectionHrefs = {
	positionHref?: string;
	candidatesHref?: string;
};

/**
 * Resolves canonical elections position and candidates listing paths for a race slug.
 * Expands city/town 3-part slugs to 4-level URLs when county can be resolved.
 */
export async function resolveRaceElectionHrefs(
	raceSlug: string | undefined,
	positionLevel?: string,
): Promise<RaceElectionHrefs> {
	if (!raceSlug) return {};

	const raceEntry = { slug: raceSlug, positionLevel };
	const parts = raceSlug.split('/').filter(Boolean);
	const prefixParts = parts.slice(0, -1);
	const level = (positionLevel ?? '').toUpperCase();
	const mightNeedCountyExpansion =
		prefixParts.length === 2 && (level === '' || level === 'CITY' || level === 'LOCAL');

	if (!mightNeedCountyExpansion) {
		const positionHref = buildElectionPositionHrefFromRaceSlug(raceEntry);
		return {
			positionHref,
			candidatesHref: buildRaceCandidatesHref(raceEntry),
		};
	}

	const fullRace = await getRaceBySlug(raceSlug);
	const effectiveLevel = (positionLevel || fullRace?.positionLevel || '').toUpperCase();
	if (effectiveLevel !== 'CITY' && effectiveLevel !== 'LOCAL') {
		const positionHref = buildElectionPositionHrefFromRaceSlug({
			slug: raceSlug,
			positionLevel: effectiveLevel,
		});
		return {
			positionHref,
			candidatesHref: positionHref ? `${positionHref}/candidates` : undefined,
		};
	}

	if (!isCityOrTownMtfcc(fullRace?.Place?.mtfcc)) {
		const positionHref = buildElectionPositionHrefFromRaceSlug({
			slug: raceSlug,
			positionLevel: effectiveLevel,
		});
		return {
			positionHref,
			candidatesHref: positionHref ? `${positionHref}/candidates` : undefined,
		};
	}

	const countyName = fullRace?.Place?.countyName;
	const state = fullRace?.state ?? prefixParts[0]?.toUpperCase();
	if (!countyName || !state) {
		const positionHref = buildElectionPositionHrefFromRaceSlug({
			slug: raceSlug,
			positionLevel: effectiveLevel,
		});
		return {
			positionHref,
			candidatesHref: positionHref ? `${positionHref}/candidates` : undefined,
		};
	}

	const countySlug = await resolveCountySlugForPlace(state, countyName);
	if (!countySlug) {
		const positionHref = buildElectionPositionHrefFromRaceSlug({
			slug: raceSlug,
			positionLevel: effectiveLevel,
		});
		return {
			positionHref,
			candidatesHref: positionHref ? `${positionHref}/candidates` : undefined,
		};
	}

	const citySlugToCountySlug = new Map([[prefixParts.join('/'), countySlug]]);
	const expandedRace = { slug: raceSlug, positionLevel: effectiveLevel };
	return {
		positionHref: buildElectionPositionHrefFromRaceSlug(expandedRace, { citySlugToCountySlug }),
		candidatesHref: buildRaceCandidatesHref(expandedRace, { citySlugToCountySlug }),
	};
}
