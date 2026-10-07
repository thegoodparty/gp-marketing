import { describe, expect, test } from 'bun:test';
import { formatOfficeholderTerm, loadPositionOfficeholders, mapOfficeholderToPerson, type PositionOfficeholderDeps } from '~/lib/positionOfficeholders';
import type { PersonItem, PersonOfficeHolder } from '~/types/people';

const office: PersonOfficeHolder = {
	id: 'oh-1',
	personId: 'AAAAAAAA-0000-0000-0000-000000000001',
	positionId: 'pos-1',
	geoId: null,
	positionName: 'City Council Member',
	normalizedPositionName: 'City Council Member',
	officeTitle: 'city council member',
	partyNames: ['Independent'],
	startAt: '2023-01-01T00:00:00.000Z',
	endAt: '2027-01-01T00:00:00.000Z',
	termDateSpecificity: 'day',
	isCurrent: true,
	isAppointed: false,
	numberOfSeats: 1,
	state: 'TX',
	subAreaName: 'District',
	subAreaValue: '3',
	websiteUrl: null,
	officePhone: null,
	officeEmail: null,
	mailingCity: null,
	mailingState: null,
};

const person = {
	id: 'aaaaaaaa-0000-0000-0000-000000000001',
	slug: 'grace-hopper',
	fullName: 'grace hopper',
	firstName: 'Grace',
	lastName: 'Hopper',
	headshotUrl: 'https://cdn.example.com/grace.jpg',
	isPledged: true,
} as unknown as PersonItem;

describe('formatOfficeholderTerm', () => {
	test('reads the years off the spine dates', () => {
		expect(formatOfficeholderTerm(office)).toBe('2023 to 2027');
		expect(formatOfficeholderTerm({ startAt: null, endAt: '2027-01-01' })).toBe('Through 2027');
		expect(formatOfficeholderTerm({ startAt: '2023-01-01', endAt: null })).toBeNull();
	});
});

describe('mapOfficeholderToPerson', () => {
	test('builds a row that links to the profile with the term and the seat', () => {
		expect(mapOfficeholderToPerson(office, person, new Set())).toEqual({
			key: 'oh-1',
			name: 'Grace Hopper',
			href: '/people/grace-hopper-aaaaaaaa',
			avatar: 'https://cdn.example.com/grace.jpg',
			party: 'Independent',
			isPledged: true,
			term: '2023 to 2027',
			seatLabel: 'District 3',
			seatValue: '3',
			seatName: 'District',
		});
	});

	test('falls back to the office title when no person is linked, without a link', () => {
		const row = mapOfficeholderToPerson({ ...office, personId: null }, undefined, new Set());
		expect(row?.name).toBe('City Council Member');
		expect(row?.href).toBeUndefined();
		expect(row?.isPledged).toBe(false);
	});

	test('when the takedown list could not be read, every photo is withheld but the links stay', () => {
		const row = mapOfficeholderToPerson(office, person, null);
		expect(row?.name).toBe('Grace Hopper');
		expect(row?.avatar).toBeUndefined();
		expect(row?.href).toBe('/people/grace-hopper-aaaaaaaa');
	});

	test('a person under a takedown keeps the row but loses the photo and the link', () => {
		const row = mapOfficeholderToPerson(office, person, new Set(['aaaaaaaa-0000-0000-0000-000000000001']));
		expect(row?.name).toBe('Grace Hopper');
		expect(row?.href).toBeUndefined();
		expect(row?.avatar).toBeUndefined();
	});
});

/**
 * Los Angeles' city council page listed one council member (Emily, 2026-10-07):
 * the race carries one district's position id and `/v1/officeholders?positionId=`
 * answers for that seat alone. The place's officeholders, filtered to the same
 * office, supply the other seats.
 */
describe('loadPositionOfficeholders', () => {
	const seat = (district: number, overrides: Partial<PersonOfficeHolder> = {}): PersonOfficeHolder => ({
		...office,
		id: `oh-d${district}`,
		personId: `cccccccc-0000-4000-8000-${String(district).padStart(12, '0')}`,
		positionId: `pos-d${district}`,
		normalizedPositionName: 'City Legislature',
		positionName: 'City Council Member',
		subAreaValue: String(district),
		...overrides,
	});
	const mayor = seat(99, { id: 'oh-mayor', positionId: 'pos-mayor', normalizedPositionName: 'Mayor', positionName: 'Mayor', subAreaValue: null, subAreaName: null });
	const formerD3 = seat(3, { id: 'oh-d3-old', personId: 'cccccccc-0000-4000-8000-000000000333', isCurrent: false });
	const council = [15, 9, 1, 3, 7].map(d => seat(d));

	const deps = (overrides: Partial<PositionOfficeholderDeps> = {}): PositionOfficeholderDeps => ({
		async getOfficeHoldersByPositionIdOrNull(positionId) {
			return Promise.resolve(positionId === 'pos-d9' ? [seat(9)] : []);
		},
		async getOfficeHoldersByGeoId(geoId) {
			return Promise.resolve(geoId === 'geo-la' ? [...council, mayor, formerD3] : []);
		},
		async getElectionsPagePlace({ slug }) {
			return Promise.resolve(slug === 'ca/los-angeles-county/los-angeles' ? ({ geoId: 'geo-la' } as never) : null);
		},
		async getPersonsByIds() {
			return Promise.resolve([]);
		},
		async getRemovedPersonIds() {
			return Promise.resolve(new Set<string>());
		},
		async resolveProductAvatars() {
			return Promise.resolve(new Map<string, string>());
		},
		...overrides,
	});

	const la = { positionId: 'pos-d9', placeSlug: 'ca/los-angeles-county/los-angeles', positionName: 'City Legislature' };

	test('lists every current seat of a multi-district office, once each, in district order', async () => {
		const people = await loadPositionOfficeholders(la, deps());
		expect(people?.map(p => p.seatValue)).toEqual(['1', '3', '7', '9', '15']);
		expect(people?.some(p => p.name.toLowerCase().includes('mayor'))).toBe(false);
	});

	test('a place row without a normalised position name is never matched on its display name', async () => {
		const unnamed = seat(5, { normalizedPositionName: null, positionName: 'City Legislature' });
		const people = await loadPositionOfficeholders(la, deps({ getOfficeHoldersByGeoId: async () => Promise.resolve([...council, unnamed]) }));
		expect(people?.map(p => p.seatValue)).toEqual(['1', '3', '7', '9', '15']);
	});

	test('a race row without a district value does not stop the numbered seats from sorting', async () => {
		const people = await loadPositionOfficeholders(
			la,
			deps({ getOfficeHoldersByPositionIdOrNull: async () => Promise.resolve([seat(9, { id: 'oh-at-large', personId: 'cccccccc-0000-4000-8000-000000000900', subAreaValue: null })]) }),
		);
		expect(people?.map(p => p.seatValue)).toEqual(['1', '3', '7', '9', '15', undefined]);
	});

	test('a seat holder with a published profile shows the photo they chose, not the feed\'s', async () => {
		const people = await loadPositionOfficeholders(
			{ positionId: 'pos-d9' },
			deps({
				getPersonsByIds: async ids =>
					Promise.resolve(ids.map(id => ({ id, fullName: 'Nithya Raman', slug: 'nithya-raman', headshotUrl: 'https://assets.civicengine.com/feed.jpg' }) as never)),
				resolveProductAvatars: async () => Promise.resolve(new Map([[seat(9).personId!.toLowerCase(), 'https://assets.goodparty.org/chosen.png']])),
			}),
		);
		expect(people?.map(p => p.avatar)).toEqual(['https://assets.goodparty.org/chosen.png']);
	});

	test('a removed person keeps no photo even when their profile is live', async () => {
		const people = await loadPositionOfficeholders(
			{ positionId: 'pos-d9' },
			deps({
				getRemovedPersonIds: async () => Promise.resolve(new Set([seat(9).personId!.toLowerCase()])),
				resolveProductAvatars: async () => Promise.resolve(new Map([[seat(9).personId!.toLowerCase(), 'https://assets.goodparty.org/chosen.png']])),
			}),
		);
		expect(people?.map(p => p.avatar)).toEqual([undefined]);
	});

	test('two seats with no linked person are two rows, not one', async () => {
		const vacant = (district: number) => seat(district, { personId: null, officeTitle: 'city council member' });
		const people = await loadPositionOfficeholders(
			{ positionId: 'pos-d9' },
			deps({ getOfficeHoldersByPositionIdOrNull: async () => Promise.resolve([vacant(4), vacant(12)].map(row => ({ ...row, positionId: 'pos-d9' }))) }),
		);
		expect(people?.map(p => p.seatValue)).toEqual(['4', '12']);
	});

	test('answers from the position id alone when the page has no place', async () => {
		const people = await loadPositionOfficeholders({ positionId: 'pos-d9' }, deps());
		expect(people?.map(p => p.seatValue)).toEqual(['9']);
	});

	test('a race with no normalised position name answers from the position id alone and never reads the place', async () => {
		let placeReads = 0;
		const people = await loadPositionOfficeholders(
			{ positionId: 'pos-d9', placeSlug: 'ca/los-angeles-county/los-angeles', positionName: undefined },
			deps({
				getOfficeHoldersByGeoId: async () => {
					placeReads += 1;
					return Promise.resolve([...council, mayor]);
				},
			}),
		);
		expect(people?.map(p => p.seatValue)).toEqual(['9']);
		expect(placeReads).toBe(0);
	});

	test('a failed place read keeps the race\'s own seat rather than hiding the list', async () => {
		const people = await loadPositionOfficeholders(la, deps({ getOfficeHoldersByGeoId: async () => Promise.reject(new Error('boom')) }));
		expect(people?.map(p => p.seatValue)).toEqual(['9']);
	});

	test('hides the list when election-api gives no answer for the position and the place has no seats', async () => {
		const people = await loadPositionOfficeholders(
			{ positionId: 'pos-x', placeSlug: 'tx/nowhere', positionName: 'Nothing' },
			deps({ getOfficeHoldersByPositionIdOrNull: async () => Promise.resolve(null) }),
		);
		expect(people).toBeUndefined();
	});
});
