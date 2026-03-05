import type {
	CandidacyItem,
	DistrictNameItem,
	DistrictTypeItem,
	FindByRaceIdResponse,
	PositionDetail,
	RaceNode,
} from '~/types/elections';

const BASE_URL =
	process.env.ELECTIONS_API_BASE_URL || 'https://election-api.goodparty.org';

const CACHE_OPTIONS = { next: { revalidate: 3600 } } as RequestInit;

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T | null> {
	try {
		const res = await fetch(url, options);
		if (res.status === 404) return null;
		if (!res.ok) {
			console.error(`[electionsApi] ${res.status} ${url}`);
			return null;
		}
		return (await res.json()) as T;
	} catch (err) {
		console.error('[electionsApi]', err);
		return null;
	}
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

export async function getCandidacies(params: {
	raceId?: string;
	positionId?: string;
}): Promise<CandidacyItem[]> {
	const searchParams = new URLSearchParams();
	if (params.raceId) searchParams.set('raceId', params.raceId);
	if (params.positionId) searchParams.set('positionId', params.positionId);
	if (searchParams.toString() === '') return [];
	const url = `${BASE_URL}/v1/candidacies?${searchParams}`;
	const data = await fetchJson<CandidacyItem[]>(url);
	return Array.isArray(data) ? data : [];
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
