import { describe, expect, test } from 'bun:test';
import {
	buildRaceSlug,
	findCityForDistrictName,
	formatElectionDateFromApi,
	formatFilingPeriodFromRace,
	getCountySuffixLabel,
	getStateName,
	getYearFromDateString,
	resolveLocalityName,
	slugifyPositionName,
	stripCountySuffix,
} from './electionsHelpers';
import type { PlaceItem, PlaceWithFacts } from '~/types/elections';

function placeItem(id: string, name: string, slug: string, state: string): PlaceItem {
	return { id, name, slug, state };
}

function placeWithFacts(id: string, name: string, slug: string, state: string): PlaceWithFacts {
	return { id, name, slug, state };
}

describe('resolveLocalityName', () => {
	test('returns countyPlace.name when countyPlace exists', () => {
		const county = placeItem('1', 'Maricopa County', 'az/maricopa-county', 'AZ');
		expect(resolveLocalityName(county, undefined, 'az/buckeye')).toBe('Maricopa County');
	});

	test('returns racePlace.name when countyPlace is undefined and racePlace exists', () => {
		const race = placeWithFacts('2', 'Buckeye', 'az/buckeye', 'AZ');
		expect(resolveLocalityName(undefined, race, 'az/buckeye')).toBe('Buckeye');
	});

	test('countyPlace takes precedence over racePlace', () => {
		const county = placeItem('1', 'Maricopa County', 'az/maricopa-county', 'AZ');
		const race = placeWithFacts('2', 'Buckeye', 'az/buckeye', 'AZ');
		expect(resolveLocalityName(county, race, 'az/buckeye')).toBe('Maricopa County');
	});

	test('humanizes slug when both countyPlace and racePlace are undefined', () => {
		expect(resolveLocalityName(undefined, undefined, 'az/buckeye')).toBe('Buckeye');
		expect(resolveLocalityName(undefined, undefined, 'buckeye')).toBe('Buckeye');
	});

	test('does NOT append " County" to city slugs', () => {
		expect(resolveLocalityName(undefined, undefined, 'az/buckeye')).not.toContain('County');
		expect(resolveLocalityName(undefined, undefined, 'az/buckeye')).toBe('Buckeye');
	});

	test('handles hyphenated slugs', () => {
		expect(resolveLocalityName(undefined, undefined, 'az/salt-river-pima')).toBe('Salt River Pima');
	});

	test('handles empty slug', () => {
		expect(resolveLocalityName(undefined, undefined, '')).toBe('');
	});

	test('handles racePlace with empty name', () => {
		const race = placeWithFacts('2', '', 'az/buckeye', 'AZ');
		expect(resolveLocalityName(undefined, race, 'az/buckeye')).toBe('Buckeye');
	});
});

describe('buildRaceSlug', () => {
	test('state-level position', () => {
		expect(buildRaceSlug('AZ', 'governor')).toBe('az/governor');
	});

	test('county-level position (state/county/position)', () => {
		expect(buildRaceSlug('AZ', 'justice-of-the-peace-judicial', 'maricopa-county')).toBe(
			'az/maricopa-county/justice-of-the-peace-judicial',
		);
	});

	test('city-level position uses state/city/position (county is NOT in the API slug)', () => {
		expect(buildRaceSlug('AZ', 'city-legislature', 'buckeye')).toBe('az/buckeye/city-legislature');
	});

	test('normalizes state and locality to lowercase (positionSlug unchanged)', () => {
		expect(buildRaceSlug('AZ', 'governor')).toBe('az/governor');
		expect(buildRaceSlug('az', 'governor', 'Buckeye')).toBe('az/buckeye/governor');
	});
});

describe('stripCountySuffix', () => {
	test('strips County', () => {
		expect(stripCountySuffix('Jefferson County')).toBe('Jefferson');
	});

	test('strips Parish', () => {
		expect(stripCountySuffix('Jefferson Parish')).toBe('Jefferson');
	});

	test('strips Borough', () => {
		expect(stripCountySuffix('Fairbanks North Star Borough')).toBe('Fairbanks North Star');
	});

	test('strips Census Area', () => {
		expect(stripCountySuffix('Yukon-Koyukuk Census Area')).toBe('Yukon-Koyukuk');
	});

	test('strips Municipio', () => {
		expect(stripCountySuffix('San Juan Municipio')).toBe('San Juan');
	});

	test('strips City and Borough', () => {
		expect(stripCountySuffix('Juneau City and Borough')).toBe('Juneau');
	});

	test('strips City and County', () => {
		expect(stripCountySuffix('San Francisco City and County')).toBe('San Francisco');
	});

	test('returns name unchanged when no suffix', () => {
		expect(stripCountySuffix('Buckeye')).toBe('Buckeye');
	});

	test('returns name unchanged when empty', () => {
		expect(stripCountySuffix('')).toBe('');
	});
});

describe('getCountySuffixLabel', () => {
	test('returns matched suffix', () => {
		expect(getCountySuffixLabel('Jefferson Parish')).toBe('Parish');
		expect(getCountySuffixLabel('Jefferson County')).toBe('County');
	});

	test('returns "County" when no suffix match', () => {
		expect(getCountySuffixLabel('Buckeye')).toBe('County');
	});

	test('returns "County" for empty string', () => {
		expect(getCountySuffixLabel('')).toBe('County');
	});
});

describe('findCityForDistrictName', () => {
	test('returns null for empty children', () => {
		expect(findCityForDistrictName('Quincy District', [])).toBeNull();
	});

	test('returns null when no match', () => {
		const children = [
			{ name: 'Boston City', slug: 'ma/boston' },
			{ name: 'Cambridge City', slug: 'ma/cambridge' },
		];
		expect(findCityForDistrictName('Springfield District', children)).toBeNull();
	});

	test('returns matching city', () => {
		const children = [
			{ name: 'Boston City', slug: 'ma/boston' },
			{ name: 'Quincy City', slug: 'ma/quincy' },
		];
		expect(findCityForDistrictName('Quincy District', children)).toEqual({ name: 'Quincy City', slug: 'ma/quincy' });
	});

	test('prefers longest base name match', () => {
		const children = [
			{ name: 'Quincy City', slug: 'ma/quincy' },
			{ name: 'Quincy Highlands City', slug: 'ma/quincy-highlands' },
		];
		expect(findCityForDistrictName('Quincy Highlands District', children)).toEqual({
			name: 'Quincy Highlands City',
			slug: 'ma/quincy-highlands',
		});
	});

	test('strips Town, City, Township, Village suffixes for matching', () => {
		const children = [{ name: 'Quincy Township', slug: 'ma/quincy-township' }];
		expect(findCityForDistrictName('quincy district', children)).toEqual({
			name: 'Quincy Township',
			slug: 'ma/quincy-township',
		});
	});
});

describe('formatElectionDateFromApi', () => {
	test('returns TBD for undefined', () => {
		expect(formatElectionDateFromApi(undefined)).toBe('TBD');
	});

	test('formats YYYY-MM-DD date', () => {
		const result = formatElectionDateFromApi('2026-11-05');
		expect(result).toMatch(/November 5, 2026/);
	});

	test('formats ISO datetime', () => {
		const result = formatElectionDateFromApi('2026-11-05T00:00:00.000Z');
		expect(result).toMatch(/November/);
		expect(result).toMatch(/2026/);
	});
});

describe('getYearFromDateString', () => {
	test('extracts year from YYYY-MM-DD', () => {
		expect(getYearFromDateString('2026-11-05')).toBe(2026);
	});

	test('extracts year from date string', () => {
		expect(getYearFromDateString('November 5, 2026')).toBe(2026);
	});

	test('extracts year from string with year pattern', () => {
		expect(getYearFromDateString('Election 2026')).toBe(2026);
	});

	test('returns NaN for invalid string', () => {
		expect(getYearFromDateString('invalid')).toBeNaN();
	});
});

describe('slugifyPositionName', () => {
	test('lowercases and replaces spaces with hyphens', () => {
		expect(slugifyPositionName('City Legislature')).toBe('city-legislature');
	});

	test('strips special characters', () => {
		expect(slugifyPositionName('Mayor (At-Large)')).toBe('mayor-at-large');
	});

	test('collapses multiple hyphens', () => {
		expect(slugifyPositionName('City   Council')).toBe('city-council');
	});

	test('trims leading/trailing hyphens', () => {
		expect(slugifyPositionName('  Governor  ')).toBe('governor');
	});
});

describe('getStateName', () => {
	test('returns label for valid state code', () => {
		expect(getStateName('AZ')).toBe('Arizona');
		expect(getStateName('az')).toBe('Arizona');
	});

	test('returns code unchanged for invalid code', () => {
		expect(getStateName('XX')).toBe('XX');
	});
});

describe('formatFilingPeriodFromRace', () => {
	test('returns TBD when neither start nor end', () => {
		expect(formatFilingPeriodFromRace(undefined, undefined)).toBe('TBD');
	});

	test('formats both dates', () => {
		const result = formatFilingPeriodFromRace('2026-01-01', '2026-02-01');
		expect(result).toMatch(/January 1, 2026/);
		expect(result).toMatch(/February 1, 2026/);
		expect(result).toContain(' - ');
	});

	test('formats start only', () => {
		const result = formatFilingPeriodFromRace('2026-01-01', undefined);
		expect(result).toMatch(/From/);
		expect(result).toMatch(/January 1, 2026/);
	});

	test('formats end only', () => {
		const result = formatFilingPeriodFromRace(undefined, '2026-02-01');
		expect(result).toMatch(/Until/);
		expect(result).toMatch(/February 1, 2026/);
	});
});
