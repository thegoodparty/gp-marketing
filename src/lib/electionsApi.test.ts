import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import type { PlaceItem } from '~/types/elections';
import { getCountyChildPlaces, isStateIndexDistrictPlace } from './electionsApi';

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

	test('falls back to town records for Maine counties when G4110 city payload is sparse', async () => {
		withFetchMock([
			{
				match: url => url.includes('/v1/places?') && url.includes('slug=me%2Fandroscoggin-county'),
				body: [
					{
						slug: 'me/androscoggin-county',
						name: 'Androscoggin County',
						mtfcc: 'G4020',
						// Mirrors the real ME payload shape where hierarchy can be incomplete.
						children: [],
					},
				],
			},
			{
				match: url =>
					url.includes('/v1/places?') &&
					url.includes('state=ME') &&
					url.includes('mtfcc=G4110'),
				body: [],
			},
			{
				match: url =>
					url.includes('/v1/places?') &&
					url.includes('state=ME') &&
					url.includes('mtfcc=G4040'),
				body: [
					{
						slug: 'me/androscoggin-county/lisbon-town',
						name: 'Lisbon Town',
						mtfcc: 'G4040',
						state: 'ME',
						countyName: 'Androscoggin',
					},
					{
						slug: 'me/androscoggin-county/sabattus-town',
						name: 'Sabattus Town',
						mtfcc: 'G4040',
						state: 'ME',
						countyName: 'Androscoggin',
					},
				],
			},
		]);

		const result = await getCountyChildPlaces({ state: 'ME', countySlug: 'me/androscoggin-county' });
		expect(slugs(result)).toEqual([
			'me/androscoggin-county/lisbon-town',
			'me/androscoggin-county/sabattus-town',
		]);
	});
});

describe('isStateIndexDistrictPlace', () => {
	test('filters out municipality-like G54xx rows while preserving district-shaped rows', () => {
		expect(
			isStateIndexDistrictPlace({
				name: 'Acton',
				slug: 'me/acton',
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
	});
});
