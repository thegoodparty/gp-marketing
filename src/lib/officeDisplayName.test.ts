import { describe, expect, test } from 'bun:test';
import { cleanNormalizedName, officeDisplayName, stripSeat } from './officeDisplayName';

const local = (normalizedPositionName: string, positionNames: string[], positionLevel = 'COUNTY') => ({ normalizedPositionName, positionNames, positionLevel });

describe('officeDisplayName', () => {
	/** Emily's examples, 2026-10-08. */
	test('a local office reads by its BallotReady name without the place or the seat', () => {
		expect(officeDisplayName(local('City Legislature', ['Garden Grove City Council - District 1', 'Garden Grove City Council - District 5'], 'CITY'), { name: 'Garden Grove' })).toBe('City Council');
		expect(officeDisplayName(local('County Legislature-Executive Board', ['Orange County Board of Supervisors - District 2']), { name: 'Orange County' })).toBe('Board of Supervisors');
		expect(officeDisplayName(local('County Legislature-Executive Board', ['Harris County Commission - Precinct 1']), { name: 'Harris County' })).toBe('County Commission');
		expect(officeDisplayName(local('County Executive Head', ['King County Executive']), { name: 'King County' })).toBe('County Executive');
		expect(officeDisplayName(local('County Executive Head', ['Harris County Judge']), { name: 'Harris County' })).toBe('County Judge');
		expect(officeDisplayName(local('County Legislature-Executive Board', ['Jefferson Parish Council', 'Jefferson Parish Council - At Large, Division A']), { name: 'Jefferson Parish' })).toBe('Parish Council');
		expect(officeDisplayName(local('County Legislature-Executive Board', ['Fairfax County Board - Braddock District', 'Fairfax County Board - Dranesville District']), { name: 'Fairfax County' })).toBe('County Board');
	});

	test('a mayor reads as Mayor, not City Mayor', () => {
		expect(officeDisplayName(local('City Executive-Mayor', ['Livingston City Mayor'], 'CITY'), { name: 'Livingston' })).toBe('Mayor');
	});

	test('term suffixes and the one odd consolidated name are cleaned by hand', () => {
		expect(officeDisplayName(local('County Legislature-Executive Board', ['Franklin County Commission', 'Franklin County Commission (Term Commencing 1/2)']), { name: 'Franklin County' })).toBe('County Commission');
		expect(officeDisplayName(local('County Legislature-Executive Board', ['Indianapolis/Marion City/County Council - District 3']), { name: 'Marion County' })).toBe('City-County Council');
	});

	test('a name that does not carry the place is kept whole', () => {
		expect(officeDisplayName(local('County Legislature-Executive Board', ['Louisville Metro Council - District 4']), { name: 'Jefferson County' })).toBe('Louisville Metro Council');
	});

	test('several BallotReady names on one page fall back to the table, as do missing ones', () => {
		expect(
			officeDisplayName(local('Local Higher Education Board-Community College Board', ['MiraCosta Community College Board - Area 5', 'Palomar Community College Board - Area 1']), {
				name: 'San Diego County',
			}),
		).toBe('Community College Board');
		expect(officeDisplayName(local('City Legislature', [], 'CITY'), { name: 'Los Angeles' })).toBe('City Council');
		expect(officeDisplayName({ normalizedPositionName: 'Local School Board' })).toBe('School Board');
	});

	test('state and federal offices keep their normalised names', () => {
		expect(officeDisplayName({ normalizedPositionName: 'State Representative', positionNames: ['California State Assembly - District 15'], positionLevel: 'STATE' }, { name: 'California' })).toBe('State Representative');
		expect(officeDisplayName({ normalizedPositionName: 'Governor', positionLevel: 'STATE' })).toBe('Governor');
	});

	test('a name outside the table gets the generic cleanup', () => {
		expect(cleanNormalizedName('Treasurer (Joint)')).toBe('Treasurer');
		expect(cleanNormalizedName('County Court Judge - Probate-County Court Judge - Surrogate')).toBe('County Court Judge - Probate');
		expect(officeDisplayName({ normalizedPositionName: 'County High Bailiff', positionLevel: 'COUNTY' })).toBe('County High Bailiff');
	});

	test('stripSeat', () => {
		expect(stripSeat('Salt Lake County Council - At Large, Seat A')).toBe('Salt Lake County Council');
		expect(stripSeat('Franklin County Commission (Term Commencing 1/3)')).toBe('Franklin County Commission');
	});
});
