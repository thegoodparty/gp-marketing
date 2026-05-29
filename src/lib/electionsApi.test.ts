import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import type { PlaceItem } from '~/types/elections';
import {
	getCountyChildPlaces,
	isStateIndexDistrictPlace,
	resolveCountySlugForPlace,
	resolveRaceElectionHrefs,
} from './electionsApi';

type FetchMockResponse = {
	match: (url: string) => boolean;
	body: unknown;
	status?: number;
};

const originalFetch = globalThis.fetch;

function withFetchMock(responses: FetchMockResponse[]) {
	globalThis.fetch = (async (input: RequestInfo | URL) => {
		const url = String(input);
		const match = responses.find(r => r.match(url));
		if (!match) {
			return new Response(JSON.stringify([]), { status: 200 });
		}
		return new Response(JSON.stringify(match.body), {
			status: match.status ?? 200,
			headers: { 'content-type': 'application/json' },
		});
	}) as typeof fetch;
}

function slugs(items: PlaceItem[]): string[] {
	return items.map(i => i.slug);
}

beforeEach(() => {
	globalThis.fetch = originalFetch;
});

afterEach(() => {
	globalThis.fetch = originalFetch;
});

describe('getCountyChildPlaces', () => {
	test('returns hierarchy children for NV Mineral County (G4040 town-style child)', async () => {
		withFetchMock([
			{
				match: url => url.includes('/v1/places?') && url.includes('slug=nv%2Fmineral-county'),
				body: [
					{
						slug: 'nv/mineral-county',
						name: 'Mineral County',
						mtfcc: 'G4020',
						children: [
							{
								slug: 'nv/mineral-county/hawthorne',
								name: 'Hawthorne ',
								mtfcc: 'G4040',
								state: 'NV',
								countyName: 'Mineral',
							},
							{
								slug: 'nv/mineral-county-school-district',
								name: 'Mineral County School District',
								mtfcc: 'G5420',
								state: 'NV',
								countyName: 'Mineral',
							},
						],
					},
				],
			},
		]);

		const result = await getCountyChildPlaces({ state: 'NV', countySlug: 'nv/mineral-county' });
		expect(slugs(result)).toEqual(['nv/mineral-county/hawthorne']);
		expect(result[0]?.name).toBe('Hawthorne');
	});

	test('merges hierarchy and fallback cities for NV Lyon County and dedupes duplicate slugs', async () => {
		withFetchMock([
			{
				match: url => url.includes('/v1/places?') && url.includes('slug=nv%2Flyon-county'),
				body: [
					{
						slug: 'nv/lyon-county',
						name: 'Lyon County',
						mtfcc: 'G4020',
						children: [
							{
								slug: 'nv/lyon-county/smith-valley',
								name: 'Smith Valley ',
								mtfcc: 'G4040',
								state: 'NV',
								countyName: 'Lyon',
							},
							{
								slug: 'nv/fernley',
								name: 'Fernley',
								mtfcc: 'G4110',
								state: 'NV',
								countyName: 'Lyon',
							},
						],
					},
				],
			},
			{
				match: url =>
					url.includes('/v1/places?') &&
					url.includes('state=NV') &&
					url.includes('mtfcc=G4110'),
				body: [
					{
						slug: 'nv/fernley',
						name: 'Fernley',
						mtfcc: 'G4110',
						state: 'NV',
						countyName: 'Lyon',
					},
					{
						slug: 'nv/yerington',
						name: 'Yerington',
						mtfcc: 'G4110',
						state: 'NV',
						countyName: 'Lyon',
					},
				],
			},
		]);

		const result = await getCountyChildPlaces({ state: 'NV', countySlug: 'nv/lyon-county' });
		expect(slugs(result)).toEqual([
			'nv/lyon-county/smith-valley',
			'nv/fernley',
			'nv/yerington',
		]);
	});

	test('returns hierarchy town children for CT Hartford County even with regional countyName values', async () => {
		withFetchMock([
			{
				match: url => url.includes('/v1/places?') && url.includes('slug=ct%2Fhartford-county'),
				body: [
					{
						slug: 'ct/hartford-county',
						name: 'Hartford County',
						mtfcc: 'G4020',
						children: [
							{
								slug: 'ct/hartford-county/avon-town',
								name: 'Avon Town',
								mtfcc: 'G4040',
								state: 'CT',
								countyName: 'Capitol',
							},
							{
								slug: 'ct/hartford',
								name: 'Hartford',
								mtfcc: 'G4110',
								state: 'CT',
								countyName: 'Capitol',
							},
						],
					},
				],
			},
		]);

		const result = await getCountyChildPlaces({ state: 'CT', countySlug: 'ct/hartford-county' });
		expect(slugs(result)).toEqual(['ct/hartford-county/avon-town', 'ct/hartford']);
	});

	test('falls back to countyName city matching when hierarchy children are empty', async () => {
		withFetchMock([
			{
				match: url => url.includes('/v1/places?') && url.includes('slug=wv%2Fbraxton-county'),
				body: [
					{
						slug: 'wv/braxton-county',
						name: 'Braxton County',
						mtfcc: 'G4020',
						children: [],
					},
				],
			},
			{
				match: url =>
					url.includes('/v1/places?') &&
					url.includes('state=WV') &&
					url.includes('mtfcc=G4110'),
				body: [
					{
						slug: 'wv/sutton',
						name: 'Sutton',
						mtfcc: 'G4110',
						state: 'WV',
						countyName: 'Braxton',
					},
					{
						slug: 'wv/gassaway',
						name: 'Gassaway',
						mtfcc: 'G4110',
						state: 'WV',
						countyName: 'Braxton',
					},
				],
			},
		]);

		const result = await getCountyChildPlaces({ state: 'WV', countySlug: 'wv/braxton-county' });
		expect(slugs(result)).toEqual(['wv/sutton', 'wv/gassaway']);
	});

	test('merges G4040 towns for Maine Androscoggin when hierarchy children are sparse (production-shaped)', async () => {
		withFetchMock([
			{
				match: url => url.includes('/v1/places?') && url.includes('slug=me%2Fandroscoggin-county'),
				body: [
					{
						slug: 'me/androscoggin-county',
						name: 'Androscoggin County',
						mtfcc: 'G4020',
						children: [
							{
								slug: 'me/androscoggin-county/sabattus-town',
								name: 'Sabattus Town',
								mtfcc: 'G4040',
								state: 'ME',
								countyName: 'Androscoggin',
							},
							{
								slug: 'me/androscoggin-county/lisbon-town',
								name: 'Lisbon Town',
								mtfcc: 'G4040',
								state: 'ME',
								countyName: 'Androscoggin',
							},
						],
					},
				],
			},
			{
				match: url =>
					url.includes('/v1/places?') &&
					url.includes('state=ME') &&
					url.includes('mtfcc=G4110'),
				body: [
					{
						slug: 'me/lewiston',
						name: 'Lewiston',
						mtfcc: 'G4110',
						state: 'ME',
						countyName: 'Androscoggin',
					},
				],
			},
			{
				match: url =>
					url.includes('/v1/places?') &&
					url.includes('state=ME') &&
					url.includes('mtfcc=G4040'),
				body: [
					{
						slug: 'me/androscoggin-county/auburn-town',
						name: 'Auburn',
						mtfcc: 'G4040',
						state: 'ME',
						countyName: 'Androscoggin',
					},
					{
						slug: 'me/penobscot-county/some-town',
						name: 'Other County Town',
						mtfcc: 'G4040',
						state: 'ME',
						countyName: 'Penobscot',
					},
				],
			},
		]);

		const result = await getCountyChildPlaces({ state: 'ME', countySlug: 'me/androscoggin-county' });
		expect(slugs(result).sort()).toEqual(
			['me/androscoggin-county/auburn-town', 'me/androscoggin-county/lisbon-town', 'me/androscoggin-county/sabattus-town', 'me/lewiston'].sort(),
		);
	});
});

describe('resolveCountySlugForPlace', () => {
	test('matches county name to county place slug', async () => {
		withFetchMock([
			{
				match: url =>
					url.includes('/v1/places?') && url.includes('state=MI') && url.includes('mtfcc=G4020'),
				body: [
					{ slug: 'mi/wayne-county', name: 'Wayne County', mtfcc: 'G4020', state: 'MI' },
					{ slug: 'mi/oakland-county', name: 'Oakland County', mtfcc: 'G4020', state: 'MI' },
				],
			},
		]);

		await expect(resolveCountySlugForPlace('MI', 'Wayne')).resolves.toBe('mi/wayne-county');
	});
});

describe('resolveRaceElectionHrefs', () => {
	test('returns generic path for LOCAL school district without county expansion', async () => {
		withFetchMock([
			{
				match: url => url.includes('/v1/races?') && url.includes('ok%2Ftecumseh-public-schools'),
				body: [
					{
						slug: 'ok/tecumseh-public-schools/local-school-board',
						state: 'OK',
						positionLevel: 'LOCAL',
						Place: {
							slug: 'ok/tecumseh-public-schools',
							mtfcc: 'G5420',
							countyName: 'Pottawatomie',
						},
					},
				],
			},
		]);

		await expect(
			resolveRaceElectionHrefs(
				'ok/tecumseh-public-schools/local-school-board',
				'LOCAL',
			),
		).resolves.toEqual({
			positionHref: '/elections/ok/tecumseh-public-schools/position/local-school-board',
			candidatesHref:
				'/elections/ok/tecumseh-public-schools/position/local-school-board/candidates',
		});
	});

	test('expands CITY race to canonical 4-level candidates URL', async () => {
		withFetchMock([
			{
				match: url => url.includes('/v1/races?') && url.includes('mi%2Fnorthville'),
				body: [
					{
						slug: 'mi/northville/city-legislature',
						state: 'MI',
						positionLevel: 'CITY',
						Place: {
							slug: 'mi/northville',
							mtfcc: 'G4110',
							countyName: 'Wayne',
						},
					},
				],
			},
			{
				match: url =>
					url.includes('/v1/places?') && url.includes('state=MI') && url.includes('mtfcc=G4020'),
				body: [{ slug: 'mi/wayne-county', name: 'Wayne County', mtfcc: 'G4020', state: 'MI' }],
			},
		]);

		await expect(
			resolveRaceElectionHrefs('mi/northville/city-legislature', 'CITY'),
		).resolves.toEqual({
			positionHref: '/elections/mi/wayne-county/northville/position/city-legislature',
			candidatesHref: '/elections/mi/wayne-county/northville/position/city-legislature/candidates',
		});
	});

	test('returns empty object when race slug is missing', async () => {
		await expect(resolveRaceElectionHrefs(undefined)).resolves.toEqual({});
	});

	test('builds state-level paths without race fetch', async () => {
		await expect(resolveRaceElectionHrefs('az/governor', 'STATE')).resolves.toEqual({
			positionHref: '/elections/az/position/governor',
			candidatesHref: '/elections/az/position/governor/candidates',
		});
	});
});

describe('isStateIndexDistrictPlace', () => {
	test('filters municipality-like G54xx rows while preserving district-shaped rows', () => {
		expect(
			isStateIndexDistrictPlace({
				name: 'Acton',
				slug: 'me/acton',
				mtfcc: 'G5420',
			}),
		).toBe(false);

		expect(
			isStateIndexDistrictPlace({
				name: 'Union',
				slug: 'me/union',
				mtfcc: 'G5420',
			}),
		).toBe(false);

		expect(
			isStateIndexDistrictPlace({
				name: 'Andover Public Schools',
				slug: 'me/andover-public-schools',
				mtfcc: 'G5420',
			}),
		).toBe(true);

		expect(
			isStateIndexDistrictPlace({
				name: 'RSU 16',
				slug: 'me/rsu-16',
				mtfcc: 'G5420',
			}),
		).toBe(true);

		expect(
			isStateIndexDistrictPlace({
				name: 'Bellows Falls UHSD 27',
				slug: 'vt/bellows-falls-uhsd-27',
				mtfcc: 'G5410',
			}),
		).toBe(true);

		expect(
			isStateIndexDistrictPlace({
				name: 'Washington Central Supervisory Union',
				slug: 'vt/washington-central-supervisory-union',
				mtfcc: 'G5420',
			}),
		).toBe(true);
	});
});
