import { describe, expect, test } from 'bun:test';

import {
	type FeaturedRotationDeps,
	buildRotationPool,
	getWeeklyFeaturedPeople,
	parsePersonRef,
	pickWeeklyPeople,
	seededRandom,
	weekKey,
} from './featuredRotation';
import type { PersonItem } from '~/types/people';

const TODAY = new Date('2026-10-09T12:00:00Z');

const person = (id: string, overrides: Partial<PersonItem> = {}): PersonItem => ({
	id,
	slug: `person-${id.slice(0, 4)}`,
	firstName: 'Person',
	middleName: null,
	lastName: id.slice(0, 4),
	nickname: null,
	suffix: null,
	fullName: `Person ${id.slice(0, 4)}`,
	bioText: null,
	headshotUrl: `https://img.example/${id}.jpg`,
	websiteUrl: null,
	linkedinUrl: null,
	facebookUrl: null,
	twitterUrl: null,
	instagramUrl: null,
	state: 'TX',
	isPledged: true,
	Candidacies: [{ id: `c-${id}`, party: 'Independent', state: 'TX', positionName: 'City Council', Race: { electionDate: '2026-11-03', slug: 'tx/harris-county/houston/city-council' } }],
	...overrides,
});

const uuid = (n: number) => `${String(n).padStart(8, '0')}-0000-4000-8000-000000000000`;

describe('parsePersonRef', () => {
	test('reads a profile link, a slug, a bare id tail and a full id', () => {
		expect(parsePersonRef('https://goodparty.org/people/jane-doe-1a2b3c4d?gp_src=x')).toEqual({ suffix: '1a2b3c4d' });
		expect(parsePersonRef('jane-doe-1A2B3C4D')).toEqual({ suffix: '1a2b3c4d' });
		expect(parsePersonRef('1a2b3c4d')).toEqual({ suffix: '1a2b3c4d' });
		expect(parsePersonRef(uuid(7))).toEqual({ id: uuid(7), suffix: '00000007' });
		expect(parsePersonRef('')).toBeNull();
		expect(parsePersonRef('https://goodparty.org/people/')).toBeNull();
	});
});

describe('weekKey', () => {
	test('is the ISO week, so it changes on Monday and only then', () => {
		expect(weekKey(new Date('2026-10-05T00:00:00Z'))).toBe('2026-W41');
		expect(weekKey(new Date('2026-10-11T23:59:59Z'))).toBe('2026-W41');
		expect(weekKey(new Date('2026-10-12T00:00:00Z'))).toBe('2026-W42');
		expect(weekKey(new Date('2027-01-01T00:00:00Z'))).toBe('2026-W53');
	});
});

describe('pickWeeklyPeople', () => {
	const entries = Array.from({ length: 20 }, (_, i) => ({ personId: uuid(i + 1), weight: i < 10 ? 1 : 3 }));

	test('is the same for the same week and different for another, capped at eight', () => {
		const a = pickWeeklyPeople(entries, { seed: '2026-W41' });
		const b = pickWeeklyPeople(entries, { seed: '2026-W41' });
		const c = pickWeeklyPeople(entries, { seed: '2026-W42' });
		expect(a).toEqual(b);
		expect(a).toHaveLength(8);
		expect(new Set(a).size).toBe(8);
		expect(c).not.toEqual(a);
	});

	test('favours heavier entries over many weeks without ever excluding the light ones', () => {
		let heavy = 0;
		let light = 0;
		for (let week = 1; week <= 52; week++) {
			for (const id of pickWeeklyPeople(entries, { seed: `2026-W${week}` })) {
				if (Number(id.slice(0, 8)) > 10) heavy++;
				else light++;
			}
		}
		expect(heavy).toBeGreaterThan(light * 1.5);
		expect(light).toBeGreaterThan(0);
	});

	test('pins come first in the editor order and excludes never appear', () => {
		const picked = pickWeeklyPeople(entries, {
			seed: '2026-W41',
			pins: [{ suffix: '00000003' }, { id: uuid(9), suffix: '00000009' }],
			excludes: [{ suffix: '00000003' }, { suffix: '00000015' }],
		});
		expect(picked[0]).toBe(uuid(9));
		expect(picked).not.toContain(uuid(3));
		expect(picked).not.toContain(uuid(15));
		expect(picked).toHaveLength(8);
	});

	test('a pin for someone outside the pool is ignored', () => {
		expect(pickWeeklyPeople(entries, { seed: 's', pins: [{ suffix: 'deadbeef' }] })).toHaveLength(8);
	});

	test('the generator is deterministic per seed', () => {
		const a = seededRandom('x');
		const b = seededRandom('x');
		expect([a(), a(), a()]).toEqual([b(), b(), b()]);
	});
});

describe('buildRotationPool', () => {
	const context = { today: TODAY, avatars: new Map<string, string>(), removedPersonIds: new Set<string>() };

	test('keeps pledged people who are running in an upcoming election or hold office, with a photo', () => {
		const pool = buildRotationPool(
			[
				person(uuid(1)),
				person(uuid(2), { Candidacies: [], OfficeHolders: [{ id: 'o', isCurrent: true, partyNames: ['Nonpartisan'], officeTitle: 'Mayor' } as never] }),
				person(uuid(3), { Candidacies: [{ id: 'c', party: 'Independent', Race: { electionDate: '2025-11-04' } }] }),
				person(uuid(4), { isPledged: false }),
				person(uuid(5), { headshotUrl: null }),
				person(uuid(6), { Candidacies: [{ id: 'c', party: 'Republican', Race: { electionDate: '2026-11-03' } }] }),
			],
			context,
		);
		expect(pool.map(entry => entry.person.id)).toEqual([uuid(1), uuid(2)]);
	});

	test('a product photo and a near election each raise the weight; a takedown removes the person', () => {
		const pool = buildRotationPool(
			[
				person(uuid(1)),
				person(uuid(2), { Candidacies: [{ id: 'c', party: 'Independent', Race: { electionDate: '2027-06-01' } }] }),
				person(uuid(3)),
			],
			{ today: TODAY, avatars: new Map([[uuid(1), 'https://product.example/1.jpg']]), removedPersonIds: new Set([uuid(3)]) },
		);
		expect(pool.map(entry => [entry.person.id, entry.weight, entry.avatarUrl])).toEqual([
			[uuid(1), 3, 'https://product.example/1.jpg'],
			[uuid(2), 1, `https://img.example/${uuid(2)}.jpg`],
		]);
	});

	test('an unreadable takedown list keeps every photo off, so nobody is drawn', () => {
		expect(buildRotationPool([person(uuid(1))], { ...context, removedPersonIds: null })).toEqual([]);
	});
});

describe('getWeeklyFeaturedPeople', () => {
	const deps = (overrides: Partial<FeaturedRotationDeps> = {}): FeaturedRotationDeps => ({
		getPublishedPersonProfileIds: async () => new Set([uuid(1), uuid(2), uuid(3)]),
		getPersonsByIds: async ids =>
			ids.map(id =>
				id === uuid(2)
					? person(id, { Candidacies: [], OfficeHolders: [{ id: 'o', isCurrent: true, partyNames: ['Nonpartisan'], officeTitle: 'Mayor', mailingCity: 'Austin', mailingState: 'TX' } as never] })
					: person(id),
			),
		getRemovedPersonIds: async () => new Set<string>(),
		resolveProductAvatars: async () => new Map<string, string>(),
		getCandidacies: async () => [{ id: 'row', personId: uuid(1), placeName: 'Houston', state: 'TX' }],
		...overrides,
	});

	test('builds candidate and official cards for the published pool', async () => {
		const people = await getWeeklyFeaturedPeople({ today: TODAY }, deps());
		const all = [...people.candidates, ...people.representatives];
		expect(all).toHaveLength(3);
		const candidate = people.candidates.find(card => card.personId === uuid(1));
		expect(candidate).toMatchObject({ office: 'City Council', location: 'Houston, TX', electionDate: '2026-11-03', isPledged: true, role: 'candidate' });
		expect(candidate?.href).toBe(`/people/person-0000-00000001`);
		expect(people.representatives[0]).toMatchObject({ personId: uuid(2), office: 'Mayor', location: 'Austin, TX', role: 'representative' });
		const other = people.candidates.find(card => card.personId === uuid(3));
		expect(other?.location).toBe('Texas');
	});

	test('a pin given as a full id joins the pool even without a published profile', async () => {
		const people = await getWeeklyFeaturedPeople({ today: TODAY, pins: [uuid(9)] }, deps());
		expect([...people.candidates, ...people.representatives].map(card => card.personId)).toContain(uuid(9));
	});

	test('an exclude given as a profile link keeps the person out', async () => {
		const people = await getWeeklyFeaturedPeople({ today: TODAY, excludes: ['https://goodparty.org/people/person-0000-00000001'] }, deps());
		expect([...people.candidates, ...people.representatives].map(card => card.personId)).not.toContain(uuid(1));
	});

	test('an empty or unreadable published list gives nobody', async () => {
		expect(await getWeeklyFeaturedPeople({ today: TODAY }, deps({ getPublishedPersonProfileIds: async () => null }))).toEqual({
			candidates: [],
			representatives: [],
			candidatesComplete: false,
		});
	});
});
