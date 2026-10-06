import { describe, expect, test } from 'bun:test';

import {
	getNearbyOffices,
	nearbyOfficesTiers,
	officeLevelLabel,
	selectNearbyOffices,
	withPledgedCounts,
	type NearbyOfficesTier,
} from '~/lib/nearbyOffices';
import type { CandidacyItem, PlaceRace, PlaceWithFacts } from '~/types/elections';
import type { PersonItem } from '~/types/people';
import type { OfficeItem } from '~/ui/ListOfOfficesBlock';

const today = new Date('2026-09-24T12:00:00');

const race = (slug: string, overrides: Partial<PlaceRace> = {}): PlaceRace => ({
	id: slug,
	slug,
	normalizedPositionName: `Position ${slug.split('/').pop()}`,
	positionLevel: 'LOCAL',
	electionDate: '2026-11-03',
	...overrides,
});

describe('nearbyOfficesTiers', () => {
	test('a city page looks in the city, then its county, then its state', () => {
		expect(nearbyOfficesTiers('tx/harris-county/houston')).toEqual([
			{ level: 'city', segments: ['tx', 'harris-county', 'houston'], slugs: ['tx/harris-county/houston', 'tx/houston'] },
			{ level: 'county', segments: ['tx', 'harris-county'], slugs: ['tx/harris-county'] },
			{ level: 'state', segments: ['tx'], slugs: ['tx'] },
		]);
	});

	test('a county page looks in the county, then its state', () => {
		expect(nearbyOfficesTiers('TX/Harris-County').map(t => t.slugs[0])).toEqual(['tx/harris-county', 'tx']);
	});

	test('a two-segment route is a county tier even when the segment is a city name', () => {
		// The county position route redirects city races to the four-level URL, so a
		// page rendered at /elections/tx/houston/position/* is a county or a
		// state-level district, never a city. The API's short city slug is only
		// ever tried as an alternative form inside the city tier.
		const [tier] = nearbyOfficesTiers('tx/houston');

		expect(tier?.level).toBe('county');
		expect(tier?.slugs).toEqual(['tx/houston']);
		expect(nearbyOfficesTiers('tx/harris-county/houston')[0]?.slugs).toContain('tx/houston');
	});

	test('a subplace page starts at its parent city and never tries a four-segment slug', () => {
		const tiers = nearbyOfficesTiers('tx/harris-county/houston/spring-branch');

		expect(tiers.map(t => t.level)).toEqual(['city', 'county', 'state']);
		expect(tiers[0]?.slugs).toEqual(['tx/harris-county/houston', 'tx/houston']);
		expect(tiers.flatMap(t => t.slugs)).not.toContain('tx/spring-branch');
	});

	test('a state page has nowhere to go up to', () => {
		expect(nearbyOfficesTiers('tx')).toEqual([{ level: 'state', segments: ['tx'], slugs: ['tx'] }]);
	});
});

describe('officeLevelLabel', () => {
	test('maps election-api levels onto the four design tags', () => {
		expect(officeLevelLabel('FEDERAL', 'state')).toBe('Federal');
		expect(officeLevelLabel('state', 'state')).toBe('State');
		expect(officeLevelLabel('COUNTY', 'county')).toBe('County');
		expect(officeLevelLabel('CITY', 'city')).toBe('Local');
		expect(officeLevelLabel('LOCAL', 'city')).toBe('Local');
	});

	test('falls back to the tier when the race has no level', () => {
		expect(officeLevelLabel(undefined, 'city')).toBe('Local');
		expect(officeLevelLabel(undefined, 'county')).toBe('County');
		expect(officeLevelLabel(undefined, 'state')).toBe('State');
	});
});

describe('selectNearbyOffices', () => {
	const [tier] = nearbyOfficesTiers('tx/harris-county/houston') as [NearbyOfficesTier];

	test('leaves out the race the page is about', () => {
		const offices = selectNearbyOffices([race('tx/houston/mayor'), race('tx/houston/controller')], {
			tier,
			currentRaceSlug: 'tx/houston/mayor',
			today,
		});

		expect(offices.map(o => o.id)).toEqual(['tx/houston/controller']);
	});

	test('keeps only upcoming elections, soonest first, and uses the re-resolved date for a stale primary', () => {
		const offices = selectNearbyOffices(
			[
				race('tx/houston/a', { electionDate: '2027-05-01' }),
				race('tx/houston/b', { electionDate: '2026-03-03', isPrimary: true }),
				race('tx/houston/past', { electionDate: '2024-11-05' }),
				race('tx/houston/c', { electionDate: '2026-11-03' }),
			],
			{ tier, today, resolvedDates: new Map([['tx/houston/b', '2026-11-03']]) },
		);

		expect(offices.map(o => o.id)).toEqual(['tx/houston/b', 'tx/houston/c', 'tx/houston/a']);
		expect(offices[0]?.nextElectionDate).toBe('2026-11-03');
	});

	test('caps the list at eight', () => {
		const races = Array.from({ length: 12 }, (_, i) => race(`tx/houston/office-${i}`));

		expect(selectNearbyOffices(races, { tier, today })).toHaveLength(8);
	});

	test('applies the tier level filter and tags each row with its own level', () => {
		const offices = selectNearbyOffices(
			[race('tx/houston/council', { positionLevel: 'CITY' }), race('tx/harris-county/judge', { positionLevel: 'COUNTY' })],
			{ tier, today },
		);

		expect(offices).toHaveLength(1);
		expect(offices[0]?.type).toBe('Local');
	});

	test('links each row to its position page under the tier place and carries the race slug', () => {
		const offices = selectNearbyOffices([race('TX/Houston/Controller')], { tier, today });

		expect(offices[0]?.href).toBe('/elections/tx/harris-county/houston/position/controller');
		expect(offices[0]?.raceSlug).toBe('tx/houston/controller');
	});

	test('drops a race listed twice under the same slug', () => {
		const offices = selectNearbyOffices([race('tx/houston/mayor'), race('tx/houston/mayor')], { tier, today });

		expect(offices).toHaveLength(1);
	});
});

describe('getNearbyOffices', () => {
	const place = (slug: string, races: PlaceRace[]): PlaceWithFacts => ({ id: slug, name: slug, slug, state: 'TX', Races: races });

	const depsFor = (places: Record<string, PlaceWithFacts | null>, calls: string[] = []) => ({
		calls,
		deps: {
			getElectionsPagePlace: async ({ slug }: { slug: string }) => {
				calls.push(slug);
				return await Promise.resolve(places[slug] ?? null);
			},
			resolvePlaceRaceElectionDates: async () => await Promise.resolve(new Map<string, string>()),
			getCandidacies: async () => await Promise.resolve([]),
			getPersonsByIds: async () => await Promise.resolve([]),
		},
	});

	test('stays in the same place when it has other upcoming positions', async () => {
		const { deps, calls } = depsFor({
			'tx/harris-county/houston': place('tx/harris-county/houston', [race('tx/houston/mayor'), race('tx/houston/controller')]),
		});

		const offices = await getNearbyOffices({ placeSlug: 'tx/harris-county/houston', currentRaceSlug: 'tx/houston/mayor', today }, deps);

		expect(offices.map(o => o.id)).toEqual(['tx/houston/controller']);
		expect(calls).toEqual(['tx/harris-county/houston']);
	});

	test('moves one level up when the page is the only position in its place', async () => {
		const { deps, calls } = depsFor({
			'tx/harris-county/houston': place('tx/harris-county/houston', [race('tx/houston/mayor')]),
			'tx/harris-county': place('tx/harris-county', [race('tx/harris-county/judge', { positionLevel: 'COUNTY' })]),
		});

		const offices = await getNearbyOffices({ placeSlug: 'tx/harris-county/houston', currentRaceSlug: 'tx/houston/mayor', today }, deps);

		expect(offices.map(o => o.id)).toEqual(['tx/harris-county/judge']);
		expect(offices[0]?.type).toBe('County');
		expect(offices[0]?.href).toBe('/elections/tx/harris-county/position/judge');
		expect(calls).toEqual(['tx/harris-county/houston', 'tx/harris-county']);
	});

	test('tries the short city slug before giving up on the city tier', async () => {
		const { deps, calls } = depsFor({
			'tx/houston': place('tx/houston', [race('tx/houston/mayor'), race('tx/houston/controller')]),
		});

		const offices = await getNearbyOffices({ placeSlug: 'tx/harris-county/houston', currentRaceSlug: 'tx/houston/mayor', today }, deps);

		expect(offices.map(o => o.id)).toEqual(['tx/houston/controller']);
		expect(calls).toEqual(['tx/harris-county/houston', 'tx/houston']);
	});

	test('a place whose other races are all in the past counts as empty', async () => {
		const { deps } = depsFor({
			'tx/harris-county': place('tx/harris-county', [
				race('tx/harris-county/judge', { positionLevel: 'COUNTY' }),
				race('tx/harris-county/clerk', { positionLevel: 'COUNTY', electionDate: '2022-11-08' }),
			]),
			tx: place('tx', [race('tx/governor', { positionLevel: 'STATE' })]),
		});

		const offices = await getNearbyOffices({ placeSlug: 'tx/harris-county', currentRaceSlug: 'tx/harris-county/judge', today }, deps);

		expect(offices.map(o => o.id)).toEqual(['tx/governor']);
	});

	test('returns an empty list when no tier has anything, so the block hides', async () => {
		const { deps } = depsFor({});

		expect(await getNearbyOffices({ placeSlug: 'tx/harris-county/houston', today }, deps)).toEqual([]);
	});
});

describe('withPledgedCounts', () => {
	const PLEDGED_ID = '11111111-1111-4111-8111-111111111111';
	const SECOND_PLEDGED_ID = '22222222-2222-4222-8222-222222222222';
	const DEMOCRAT_ID = '33333333-3333-4333-8333-333333333333';
	const UNPLEDGED_ID = '44444444-4444-4444-8444-444444444444';

	const office = (raceSlug: string): OfficeItem => ({
		id: raceSlug,
		type: 'Local',
		position: raceSlug.split('/').pop() ?? '',
		nextElectionDate: '2026-11-03',
		href: `/elections/tx/harris-county/houston/position/${raceSlug.split('/').pop()}`,
		raceSlug,
	});
	const candidacy = (id: string, personId: string | null, party = 'Independent'): CandidacyItem => ({ id, personId, party });
	const personRow = (id: string, overrides: Partial<PersonItem> = {}): PersonItem =>
		({ id, slug: `person-${id.slice(0, 8)}`, firstName: 'First', lastName: 'Last', isPledged: true, ...overrides }) as PersonItem;

	const depsFor = (candidaciesByRace: Record<string, CandidacyItem[]>, persons: PersonItem[], calls: string[] = []) => ({
		calls,
		deps: {
			getCandidacies: async ({ raceSlug }: { raceSlug: string }) => {
				calls.push(`candidacies:${raceSlug}`);
				return await Promise.resolve(candidaciesByRace[raceSlug] ?? []);
			},
			getPersonsByIds: async (ids: string[]) => {
				calls.push(`persons:${ids.length}`);
				return await Promise.resolve(persons.filter(person => ids.includes(person.id)));
			},
		},
	});

	/** The same rule as every pledge badge: the person's flag, and no major-party evidence, counted once per person. */
	test('counts each race\'s pledged candidates once per person and leaves out everyone else', async () => {
		const { deps, calls } = depsFor(
			{
				'tx/houston/mayor': [
					candidacy('c-1', PLEDGED_ID),
					candidacy('c-2', PLEDGED_ID),
					candidacy('c-3', SECOND_PLEDGED_ID),
					candidacy('c-4', DEMOCRAT_ID, 'Democratic'),
					candidacy('c-5', UNPLEDGED_ID),
					candidacy('c-6', null),
				],
				'tx/houston/controller': [candidacy('c-7', SECOND_PLEDGED_ID)],
			},
			[personRow(PLEDGED_ID), personRow(SECOND_PLEDGED_ID), personRow(DEMOCRAT_ID), personRow(UNPLEDGED_ID, { isPledged: false })],
		);

		const offices = await withPledgedCounts([office('tx/houston/mayor'), office('tx/houston/controller'), office('tx/houston/clerk')], deps);

		expect(offices.map(o => o.pledgedCount)).toEqual([2, 1, undefined]);
		expect(calls).toEqual(['candidacies:tx/houston/mayor', 'candidacies:tx/houston/controller', 'candidacies:tx/houston/clerk', 'persons:6']);
	});

	test('a race with nobody pledged, or whose candidates could not be read, gets no count rather than a zero', async () => {
		const { deps } = depsFor({ 'tx/houston/mayor': [candidacy('c-1', UNPLEDGED_ID)] }, [personRow(UNPLEDGED_ID, { isPledged: false })]);

		const offices = await withPledgedCounts([office('tx/houston/mayor'), office('tx/houston/clerk')], deps);

		expect(offices.every(o => !('pledgedCount' in o))).toBe(true);
	});

	test('asks nothing when no row carries a race slug', async () => {
		const { deps, calls } = depsFor({}, []);

		await withPledgedCounts([{ ...office('tx/houston/mayor'), raceSlug: undefined }], deps);

		expect(calls).toEqual([]);
	});

	test('getNearbyOffices attaches the counts to the rows it returns', async () => {
		const cityPlace: PlaceWithFacts = {
			id: 'p',
			name: 'Houston',
			slug: 'tx/harris-county/houston',
			state: 'TX',
			Races: [race('tx/houston/mayor'), race('tx/houston/controller')],
		};
		const { deps } = depsFor({ 'tx/houston/controller': [candidacy('c-1', PLEDGED_ID)] }, [personRow(PLEDGED_ID)]);

		const offices = await getNearbyOffices(
			{ placeSlug: 'tx/harris-county/houston', currentRaceSlug: 'tx/houston/mayor', today },
			{
				...deps,
				getElectionsPagePlace: async () => await Promise.resolve(cityPlace),
				resolvePlaceRaceElectionDates: async () => await Promise.resolve(new Map<string, string>()),
			},
		);

		expect(offices).toHaveLength(1);
		expect(offices[0]?.pledgedCount).toBe(1);
	});
});
