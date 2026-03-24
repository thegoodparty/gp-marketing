import { describe, expect, test } from 'bun:test';
import {
	buildFAQSchema,
	buildJobPostingSchema,
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
import type { PlaceItem, PlaceWithFacts, RaceDetail } from '~/types/elections';

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

function minimalRace(overrides: Partial<RaceDetail> = {}): RaceDetail {
	return {
		id: 1,
		slug: 'az/governor',
		name: 'Governor',
		state: 'AZ',
		...overrides,
	};
}

const jobPostingBaseParams = {
	officeName: 'Governor',
	stateName: 'Arizona',
	pageUrl: 'https://goodparty.org/elections/az/position/governor',
};

describe('buildJobPostingSchema', () => {
	test('returns null when filingDateStart and electionDate are both missing', () => {
		expect(buildJobPostingSchema({ race: minimalRace(), ...jobPostingBaseParams })).toBeNull();
	});

	test('includes datePosted from filingDateStart', () => {
		const schema = buildJobPostingSchema({
			race: minimalRace({ filingDateStart: '2026-01-15T00:00:00Z' }),
			...jobPostingBaseParams,
		});
		expect(schema).not.toBeNull();
		expect((schema as Record<string, unknown>).datePosted).toBe('2026-01-15');
	});

	test('includes datePosted from electionDate when filing start missing', () => {
		const schema = buildJobPostingSchema({
			race: minimalRace({ electionDate: '2026-11-03' }),
			...jobPostingBaseParams,
		});
		expect(schema).not.toBeNull();
		expect((schema as Record<string, unknown>).datePosted).toBe('2026-11-03');
	});

	test('filingDateStart takes precedence over electionDate', () => {
		const schema = buildJobPostingSchema({
			race: minimalRace({
				filingDateStart: '2026-01-01',
				electionDate: '2026-11-03',
			}),
			...jobPostingBaseParams,
		});
		expect((schema as Record<string, unknown>).datePosted).toBe('2026-01-01');
	});

	test('sets validThrough from filingDateEnd', () => {
		const schema = buildJobPostingSchema({
			race: minimalRace({
				filingDateStart: '2026-01-01',
				filingDateEnd: '2026-02-01T12:00:00Z',
			}),
			...jobPostingBaseParams,
		});
		expect((schema as Record<string, unknown>).validThrough).toBe('2026-02-01');
	});

	test('parses single dollar salary', () => {
		const schema = buildJobPostingSchema({
			race: minimalRace({ filingDateStart: '2026-01-01', salary: '$50,000' }),
			...jobPostingBaseParams,
		});
		const baseSalary = (schema as Record<string, unknown>).baseSalary as Record<string, unknown>;
		expect(baseSalary['@type']).toBe('MonetaryAmount');
		const value = baseSalary.value as Record<string, unknown>;
		expect(value.value).toBe(50000);
	});

	test('parses salary range', () => {
		const schema = buildJobPostingSchema({
			race: minimalRace({ filingDateStart: '2026-01-01', salary: '$50,000 - $75,000' }),
			...jobPostingBaseParams,
		});
		const value = ((schema as Record<string, unknown>).baseSalary as Record<string, unknown>).value as Record<string, unknown>;
		expect(value.minValue).toBe(50000);
		expect(value.maxValue).toBe(75000);
	});

	test('uses HOUR unit when hourly cues present', () => {
		const schema = buildJobPostingSchema({
			race: minimalRace({ filingDateStart: '2026-01-01', salary: '$25/hr' }),
			...jobPostingBaseParams,
		});
		const value = ((schema as Record<string, unknown>).baseSalary as Record<string, unknown>).value as Record<string, unknown>;
		expect(value.unitText).toBe('HOUR');
		expect(value.value).toBe(25);
	});

	test('parses bare integer salary (no $ prefix)', () => {
		const schema = buildJobPostingSchema({
			race: minimalRace({ filingDateStart: '2026-01-01', salary: '147175' }),
			...jobPostingBaseParams,
		});
		const value = ((schema as Record<string, unknown>).baseSalary as Record<string, unknown>).value as Record<string, unknown>;
		expect(value.value).toBe(147175);
		expect(value.unitText).toBe('YEAR');
	});

	test('picks annual amount from mixed annual+per-diem string', () => {
		const schema = buildJobPostingSchema({
			race: minimalRace({ filingDateStart: '2026-01-01', salary: '$7,200/year + $221/day' }),
			...jobPostingBaseParams,
		});
		const value = ((schema as Record<string, unknown>).baseSalary as Record<string, unknown>).value as Record<string, unknown>;
		expect(value.value).toBe(7200);
		expect(value.unitText).toBe('YEAR');
	});

	test('extracts salary embedded in prose', () => {
		const schema = buildJobPostingSchema({
			race: minimalRace({ filingDateStart: '2026-01-01', salary: 'The base salary was $141,000/year in 2011 (NRS 223.050).' }),
			...jobPostingBaseParams,
		});
		const value = ((schema as Record<string, unknown>).baseSalary as Record<string, unknown>).value as Record<string, unknown>;
		expect(value.value).toBe(141000);
		expect(value.unitText).toBe('YEAR');
	});

	test('maps Full-Time employment to FULL_TIME', () => {
		const schema = buildJobPostingSchema({
			race: minimalRace({ filingDateStart: '2026-01-01', employmentType: 'Full-Time' }),
			...jobPostingBaseParams,
		});
		expect((schema as Record<string, unknown>).employmentType).toBe('FULL_TIME');
	});

	test('maps unknown employment to OTHER', () => {
		const schema = buildJobPostingSchema({
			race: minimalRace({ filingDateStart: '2026-01-01', employmentType: 'Rotating shift' }),
			...jobPostingBaseParams,
		});
		expect((schema as Record<string, unknown>).employmentType).toBe('OTHER');
	});

	test('omits baseSalary when salary unparseable', () => {
		const schema = buildJobPostingSchema({
			race: minimalRace({ filingDateStart: '2026-01-01', salary: 'TBD' }),
			...jobPostingBaseParams,
		});
		expect((schema as Record<string, unknown>).baseSalary).toBeUndefined();
	});

	test('wraps fallback description in paragraph HTML', () => {
		const schema = buildJobPostingSchema({
			race: minimalRace({ filingDateStart: '2026-01-01' }),
			officeName: 'Mayor',
			stateName: 'Arizona',
			countyName: 'Maricopa County',
			pageUrl: 'https://example.com/elections',
		}) as Record<string, unknown>;
		const desc = String(schema.description);
		expect(desc.startsWith('<p>')).toBe(true);
		expect(desc.endsWith('</p>')).toBe(true);
		expect(desc).toContain('elected public office');
	});

	test('escapes angle brackets in plain positionDescription', () => {
		const schema = buildJobPostingSchema({
			race: minimalRace({
				filingDateStart: '2026-01-01',
				positionDescription: 'Use <script>x</script> carefully',
			}),
			...jobPostingBaseParams,
		}) as Record<string, unknown>;
		expect(String(schema.description)).toContain('&lt;script&gt;');
	});

	test('passes through API HTML when closing tag present', () => {
		const raw = '<p>Hello</p>';
		const schema = buildJobPostingSchema({
			race: minimalRace({
				filingDateStart: '2026-01-01',
				positionDescription: raw,
			}),
			...jobPostingBaseParams,
		}) as Record<string, unknown>;
		expect(schema.description).toBe(raw);
	});
});

describe('buildFAQSchema', () => {
	test('uses FAQPage as root @type', () => {
		const schema = buildFAQSchema([{ title: 'Q?', copy: 'A.' }]) as Record<string, unknown>;
		expect(schema['@type']).toBe('FAQPage');
	});
});
