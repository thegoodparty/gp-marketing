import { describe, expect, test } from 'bun:test';
import { formatOfficeholderTerm, mapOfficeholderToPerson } from '~/lib/positionOfficeholders';
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
