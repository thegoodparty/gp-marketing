import { describe, expect, test } from 'bun:test';

import { classifyHowToRunGuide, HOW_TO_RUN_GUIDES, resolveHowToRunGuide } from '~/lib/howToRunGuide';

const race = (normalizedPositionName: string, extra: { name?: string; positionLevel?: string; positionNames?: string[] } = {}) => ({
	normalizedPositionName,
	name: extra.name ?? normalizedPositionName,
	positionLevel: extra.positionLevel,
	positionNames: extra.positionNames,
});

describe('classifyHowToRunGuide', () => {
	describe('one row of the matrix each', () => {
		test.each([
			['City Council Member', 'cityCouncil'],
			['Town Council', 'cityCouncil'],
			['Alderman', 'cityCouncil'],
			['Mayor', 'mayor'],
			['School Board Member', 'schoolBoard'],
			['Board of Education', 'schoolBoard'],
			['City Treasurer', 'cityTreasurer'],
			['Treasurer', 'cityTreasurer'],
			['County Commissioner', 'countyCommissioner'],
			['County Board Member', 'countyCommissioner'],
			['County Trustee', 'countyCommissioner'],
			['County Assessor', 'countyAssessor'],
			['Circuit Court Judge', 'judge'],
			['Justice of the Peace', 'judge'],
			['District Attorney', 'districtAttorney'],
			['U.S. House', 'congress'],
			['U.S. Senate', 'congress'],
			['State Senate', 'stateLegislature'],
			['State House', 'stateLegislature'],
			['Township Trustee', 'township'],
			['Township Supervisor', 'township'],
			['Fire Protection District Board', 'specialDistrict'],
			['Water District Director', 'specialDistrict'],
			['Library Board Trustee', 'specialDistrict'],
			['County Clerk', 'general'],
			['Sheriff', 'general'],
			['Coroner', 'general'],
		] as const)('%s -> %s', (name, expected) => {
			expect(classifyHowToRunGuide({ race: race(name) })).toBe(expected);
		});
	});

	describe('collisions the matrix does not spell out', () => {
		test('a state senate seat is the state legislature, not Congress', () => {
			expect(classifyHowToRunGuide({ race: race('State Senate', { positionLevel: 'STATE' }) })).toBe('stateLegislature');
		});

		test('the federal level wins even when the name says only "Representative"', () => {
			expect(classifyHowToRunGuide({ race: race('Representative', { positionLevel: 'FEDERAL' }) })).toBe('congress');
		});

		test('a county board of education is a school board, not a county board', () => {
			expect(classifyHowToRunGuide({ race: race('County Board of Education') })).toBe('schoolBoard');
		});

		test('a county attorney is the prosecutor row, not the county board row', () => {
			expect(classifyHowToRunGuide({ race: race('County Attorney') })).toBe('districtAttorney');
		});

		test("a state's attorney is the prosecutor row", () => {
			expect(classifyHowToRunGuide({ race: race("State's Attorney") })).toBe('districtAttorney');
		});

		test('the attorney general is not a prosecutor for this purpose', () => {
			expect(classifyHowToRunGuide({ race: race('Attorney General', { positionLevel: 'STATE' }) })).toBe('general');
			expect(classifyHowToRunGuide({ race: race('State Attorney General', { positionLevel: 'STATE' }) })).toBe('general');
			expect(classifyHowToRunGuide({ race: race("State's Attorney General") })).toBe('general');
		});

		test('a clerk of court is not a judge', () => {
			expect(classifyHowToRunGuide({ race: race('Clerk of Court') })).toBe('general');
		});

		test('a township office beats every other rule', () => {
			expect(classifyHowToRunGuide({ race: race('Township Treasurer') })).toBe('township');
			expect(classifyHowToRunGuide({ race: race('Township Assessor') })).toBe('township');
		});

		test('a state assessor is not the county assessor article', () => {
			expect(classifyHowToRunGuide({ race: race('State Assessor', { positionLevel: 'STATE' }) })).toBe('general');
			expect(classifyHowToRunGuide({ race: race('Assessor', { positionLevel: 'STATE' }) })).toBe('general');
		});

		test('a county treasurer is not the city treasurer article', () => {
			expect(classifyHowToRunGuide({ race: race('County Treasurer') })).toBe('general');
		});

		test('a county council is the county governing body', () => {
			expect(classifyHowToRunGuide({ race: race('County Council') })).toBe('countyCommissioner');
		});

		test('a county-level commission with no "county" in its name still reads as the county board', () => {
			expect(classifyHowToRunGuide({ race: race('Commissioner', { positionLevel: 'COUNTY' }) })).toBe('countyCommissioner');
		});

		test('a county water district board is a special district, not the county board', () => {
			expect(classifyHowToRunGuide({ race: race('County Water District Board') })).toBe('specialDistrict');
		});

		test('special-purpose county boards are special districts, not the county governing body (Emily, 2026-09-24)', () => {
			expect(classifyHowToRunGuide({ race: race('County Health Commission') })).toBe('specialDistrict');
			expect(classifyHowToRunGuide({ race: race('Metropolitan Planning Commission', { positionLevel: 'COUNTY' }) })).toBe('specialDistrict');
		});

		test('the county governing body itself never reads as a special district', () => {
			expect(classifyHowToRunGuide({ race: race('County Commission') })).toBe('countyCommissioner');
			expect(classifyHowToRunGuide({ race: race('Board of Supervisors') })).toBe('countyCommissioner');
		});

		test('a school district board is a school board, not a special district', () => {
			expect(classifyHowToRunGuide({ race: race('School District Board Member') })).toBe('schoolBoard');
		});

		test('a superintendent of schools is not a school board seat', () => {
			expect(classifyHowToRunGuide({ race: race('Superintendent of Schools') })).toBe('general');
		});
	});

	describe('inputs', () => {
		test('reads the specific race name when the normalized name is generic', () => {
			expect(classifyHowToRunGuide({ race: race('Council', { name: 'Denver City Council District 3' }) })).toBe('cityCouncil');
		});

		test('reads the position names list', () => {
			expect(classifyHowToRunGuide({ race: race('Board Member', { positionNames: ['Teton County Commission'] }) })).toBe(
				'countyCommissioner',
			);
		});

		test('falls back to the office name when there is no race', () => {
			expect(classifyHowToRunGuide({ officeName: 'Mayor', race: null })).toBe('mayor');
		});

		test('with nothing to read, chooses the general guide', () => {
			expect(classifyHowToRunGuide({})).toBe('general');
			expect(classifyHowToRunGuide({ officeName: '', race: null })).toBe('general');
		});
	});
});

describe('resolveHowToRunGuide', () => {
	test('returns the article path for the matched row', () => {
		expect(resolveHowToRunGuide({ race: race('Mayor') })).toEqual({ key: 'mayor', href: HOW_TO_RUN_GUIDES.mayor });
	});

	test('every article is a site-relative blog path', () => {
		for (const href of Object.values(HOW_TO_RUN_GUIDES)) {
			expect(href).toMatch(/^\/blog\/article\/[a-z-]+$/);
		}
	});
});
