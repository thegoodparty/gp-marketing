import { describe, expect, test } from 'bun:test';

import {
	getNearbyOffices,
	nearbyOfficesTiers,
	officeLevelLabel,
	selectNearbyOffices,
	type NearbyOfficesTier,
} from '~/lib/nearbyOffices';
import type { PlaceRace, PlaceWithFacts } from '~/types/elections';

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

	test('links each row to its position page under the tier place', () => {
		const offices = selectNearbyOffices([race('tx/houston/controller')], { tier, today });

		expect(offices[0]?.href).toBe('/elections/tx/harris-county/houston/position/controller');
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
			getPlaceBySlug: async ({ slug }: { slug: string }) => {
				calls.push(slug);
				return await Promise.resolve(places[slug] ?? null);
			},
			resolvePlaceRaceElectionDates: async () => await Promise.resolve(new Map<string, string>()),
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
