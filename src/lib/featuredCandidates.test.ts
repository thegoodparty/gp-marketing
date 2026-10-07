import { describe, expect, test } from 'bun:test';

import {
	buildCandidateCards,
	buildRepresentativeCards,
	type FeaturedPeopleDeps,
	type FeaturedPersonCard,
	getFeaturedPeople,
	rankFeaturedPeople,
	selectFeaturedPeople,
	selectFeaturedRaces,
	summarizeIndependents,
} from './featuredCandidates.ts';
import type { CandidacyItem, PlaceRace, PlaceWithFacts } from '~/types/elections';
import type { PersonItem, PersonOfficeHolder } from '~/types/people';

const person = (i: number, overrides: Partial<FeaturedPersonCard> = {}): FeaturedPersonCard => ({
	personId: `person-${i}`,
	name: `Person ${String(i).padStart(2, '0')}`,
	office: 'City Council',
	location: 'Houston, TX',
	href: `/people/person-${i}`,
	avatarUrl: null,
	isPledged: false,
	isNonpartisan: true,
	role: 'candidate',
	electionDate: '2026-11-03',
	...overrides,
});

describe('rankFeaturedPeople', () => {
	test('pledged people lead, then unpledged nonpartisan people, then major-party people', () => {
		const ranked = rankFeaturedPeople([
			person(1, { isPledged: false, isNonpartisan: false }),
			person(2, { isPledged: false, isNonpartisan: true }),
			person(3, { isPledged: true, isNonpartisan: true }),
		]);

		expect(ranked.map(p => p.personId)).toEqual(['person-3', 'person-2', 'person-1']);
	});

	test('within a group candidates come first by soonest election, then representatives by name', () => {
		const ranked = rankFeaturedPeople([
			person(1, { role: 'representative', electionDate: null, name: 'Zed Rep' }),
			person(2, { electionDate: '2027-05-01' }),
			person(3, { role: 'representative', electionDate: null, name: 'Amy Rep' }),
			person(4, { electionDate: '2026-11-03' }),
		]);

		expect(ranked.map(p => p.personId)).toEqual(['person-4', 'person-2', 'person-3', 'person-1']);
	});

	test('a person listed as both a candidate and a representative appears once', () => {
		const ranked = rankFeaturedPeople([person(1), person(1, { role: 'representative', electionDate: null })]);

		expect(ranked).toHaveLength(1);
		expect(ranked[0]?.role).toBe('candidate');
	});

	test('never returns more than the cap', () => {
		const ranked = rankFeaturedPeople(Array.from({ length: 12 }, (_, i) => person(i)));

		expect(ranked).toHaveLength(8);
	});
});

describe('selectFeaturedPeople', () => {
	const people = {
		candidates: [person(1, { isPledged: true })],
		representatives: [person(2, { isPledged: true, role: 'representative', electionDate: null })],
	};

	test('both merges the two lists', () => {
		expect(selectFeaturedPeople(people, 'both').map(p => p.personId)).toEqual(['person-1', 'person-2']);
	});

	test('candidates and representatives pick one list each', () => {
		expect(selectFeaturedPeople(people, 'candidates').map(p => p.personId)).toEqual(['person-1']);
		expect(selectFeaturedPeople(people, 'representatives').map(p => p.personId)).toEqual(['person-2']);
	});

	/** The heading says everyone shown took the Pledge, so unpledged people no longer fill the spare slots (Emily, 2026-10-06). */
	test('leaves unpledged people out even when nothing else would fill the carousel', () => {
		const mixed = {
			candidates: [person(1, { isPledged: false, isNonpartisan: true }), person(2, { isPledged: true })],
			representatives: [person(3, { isPledged: false, isNonpartisan: false, role: 'representative', electionDate: null })],
		};

		expect(selectFeaturedPeople(mixed, 'both').map(p => p.personId)).toEqual(['person-2']);
		expect(selectFeaturedPeople({ candidates: [person(1, { isPledged: false })], representatives: [] }, 'both')).toEqual([]);
	});
});

const race = (slug: string, overrides: Partial<PlaceRace> = {}): PlaceRace => ({
	slug,
	normalizedPositionName: slug.split('/').pop(),
	positionLevel: 'CITY',
	electionDate: '2026-11-03',
	...overrides,
});

describe('selectFeaturedRaces', () => {
	const today = new Date(2026, 8, 29);

	test('keeps upcoming races at the page level, soonest first, and drops past ones', () => {
		const selected = selectFeaturedRaces(
			[
				race('tx/houston/mayor', { electionDate: '2027-11-02' }),
				race('tx/houston/controller', { electionDate: '2026-11-03' }),
				race('tx/houston/old-seat', { electionDate: '2026-03-03' }),
				race('tx/harris-county/judge', { positionLevel: 'COUNTY' }),
			],
			{ level: 'city', today },
		);

		expect(selected.map(({ race }) => race.slug)).toEqual(['tx/houston/controller', 'tx/houston/mayor']);
	});

	test('prefers a re-resolved date for a race whose primary has passed', () => {
		const selected = selectFeaturedRaces([race('tx/houston/mayor', { electionDate: '2026-03-03', isPrimary: true })], {
			level: 'city',
			today,
			resolvedDates: new Map([['tx/houston/mayor', '2026-11-03']]),
		});

		expect(selected).toHaveLength(1);
		expect(selected[0]?.electionDate).toBe('2026-11-03');
	});

	test('stays within the request budget', () => {
		const selected = selectFeaturedRaces(
			Array.from({ length: 30 }, (_, i) => race(`tx/houston/seat-${String(i).padStart(2, '0')}`)),
			{ level: 'city', today, budget: 5 },
		);

		expect(selected).toHaveLength(5);
	});
});

const PLEDGED_ID = '11111111-1111-4111-8111-111111111111';
const UNPLEDGED_ID = '22222222-2222-4222-8222-222222222222';
const DEMOCRAT_ID = '33333333-3333-4333-8333-333333333333';

const personRow = (id: string, overrides: Partial<PersonItem> = {}): PersonItem =>
	({
		id,
		slug: `person-${id.slice(0, 8)}`,
		firstName: 'First',
		lastName: 'Last',
		fullName: 'First Last',
		headshotUrl: `https://img.example/${id.slice(0, 8)}.jpg`,
		isPledged: false,
		...overrides,
	}) as PersonItem;

const candidacy = (overrides: Partial<CandidacyItem> = {}): CandidacyItem => ({
	id: 'c-1',
	slug: 'jane-doe-mayor',
	firstName: 'Jane',
	lastName: 'Doe',
	party: 'Independent',
	positionName: 'Mayor',
	placeName: 'Houston',
	state: 'TX',
	...overrides,
});

const place = { name: 'Houston', state: 'TX', level: 'city' as const };

describe('buildCandidateCards', () => {
	const entry = (c: CandidacyItem) => ({ candidacy: c, race: race('tx/houston/mayor'), electionDate: '2026-11-03' });

	test('links a candidate with a person id to /people using the person slug and reads the pledge from the person row', () => {
		const persons = new Map([[PLEDGED_ID, personRow(PLEDGED_ID, { slug: 'jane-doe', isPledged: true })]]);
		const [card] = buildCandidateCards([entry(candidacy({ personId: PLEDGED_ID }))], persons, place, new Set());

		expect(card).toMatchObject({
			name: 'Jane Doe',
			office: 'Mayor',
			location: 'Houston, TX',
			href: '/people/jane-doe-11111111',
			isPledged: true,
			isNonpartisan: true,
			role: 'candidate',
			electionDate: '2026-11-03',
			raceSlug: 'tx/houston/mayor',
		});
	});

	test('a statewide candidacy names the state once, not "Indiana, IN"', () => {
		const statewide = { name: 'Indiana', state: 'IN', level: 'state' as const };
		const [card] = buildCandidateCards([entry(candidacy({ placeName: 'Indiana', state: 'IN' }))], new Map(), statewide, new Set());
		const [local] = buildCandidateCards([entry(candidacy({ placeName: 'Marion', state: 'IN' }))], new Map(), statewide, new Set());

		expect(card?.location).toBe('Indiana');
		expect(local?.location).toBe('Marion, IN');
	});

	test('a pledge flag does not count for a major-party candidate', () => {
		const persons = new Map([[DEMOCRAT_ID, personRow(DEMOCRAT_ID, { isPledged: true })]]);
		const [card] = buildCandidateCards([entry(candidacy({ personId: DEMOCRAT_ID, party: 'Democratic' }))], persons, place, new Set());

		expect(card?.isPledged).toBe(false);
		expect(card?.isNonpartisan).toBe(false);
	});

	test('a candidate with no person row falls back to the /candidate page and is not pledged', () => {
		const [card] = buildCandidateCards([entry(candidacy())], new Map(), place, new Set());

		expect(card?.href).toBe('/candidate/jane-doe-mayor');
		expect(card?.isPledged).toBe(false);
	});

	test('drops the photo of a removed person and every photo when the removals feed is unreadable', () => {
		const persons = new Map([[UNPLEDGED_ID, personRow(UNPLEDGED_ID)]]);
		const removed = buildCandidateCards([entry(candidacy({ personId: UNPLEDGED_ID, image: 'x.jpg' }))], persons, place, new Set([UNPLEDGED_ID]));
		const unknown = buildCandidateCards([entry(candidacy({ personId: UNPLEDGED_ID, image: 'x.jpg' }))], persons, place, null);
		const kept = buildCandidateCards([entry(candidacy({ personId: UNPLEDGED_ID, image: 'x.jpg' }))], persons, place, new Set());

		expect(removed[0]?.avatarUrl).toBeNull();
		expect(unknown[0]?.avatarUrl).toBeNull();
		expect(kept[0]?.avatarUrl).toBe('x.jpg');
	});
});

const officeholder = (overrides: Partial<PersonOfficeHolder> = {}): PersonOfficeHolder =>
	({
		id: 'oh-1',
		personId: UNPLEDGED_ID,
		officeTitle: 'Council Member',
		positionName: 'City Council',
		partyNames: [],
		isCurrent: true,
		mailingCity: 'Austin',
		...overrides,
	}) as PersonOfficeHolder;

describe('buildRepresentativeCards', () => {
	test('names the person from the person row, links to /people, and uses the page place for the location', () => {
		const persons = new Map([[UNPLEDGED_ID, personRow(UNPLEDGED_ID, { fullName: 'Sam Holder', slug: 'sam-holder' })]]);
		const [card] = buildRepresentativeCards([officeholder()], persons, place, new Set());

		expect(card).toMatchObject({
			name: 'Sam Holder',
			office: 'Council Member',
			location: 'Houston, TX',
			href: '/people/sam-holder-22222222',
			role: 'representative',
			electionDate: null,
		});
	});

	test('a state page names the officeholder’s own city instead of the state', () => {
		const persons = new Map([[UNPLEDGED_ID, personRow(UNPLEDGED_ID, { fullName: 'Sam Holder' })]]);
		const [card] = buildRepresentativeCards([officeholder()], persons, { name: 'Texas', state: 'TX', level: 'state' }, new Set());

		expect(card?.location).toBe('Austin, TX');
	});

	test('skips past terms, terms whose current flag is unknown, and rows without a person', () => {
		const persons = new Map([[UNPLEDGED_ID, personRow(UNPLEDGED_ID)]]);
		const cards = buildRepresentativeCards(
			[officeholder({ isCurrent: false }), officeholder({ isCurrent: null }), officeholder({ personId: null })],
			persons,
			place,
			new Set(),
		);

		expect(cards).toHaveLength(0);
	});
});

describe('getFeaturedPeople', () => {
	const calls: string[] = [];
	const cityPlace: PlaceWithFacts & { geoId?: string } = {
		id: 'p-1',
		name: 'Houston',
		slug: 'tx/harris-county/houston',
		state: 'TX',
		geoId: 'geo-houston',
		Races: [race('tx/houston/mayor'), race('tx/houston/controller', { electionDate: '2027-11-02' }), race('tx/harris-county/judge', { positionLevel: 'COUNTY' })],
	};
	const deps: FeaturedPeopleDeps = {
		async getElectionsPagePlace({ slug }) {
			calls.push(`place:${slug}`);
			return Promise.resolve(slug === 'tx/harris-county/houston' ? cityPlace : null);
		},
		async resolvePlaceRaceElectionDates() {
			return Promise.resolve(new Map());
		},
		async getCandidacies({ raceSlug }) {
			calls.push(`candidacies:${raceSlug}`);
			return Promise.resolve(
				raceSlug === 'tx/houston/mayor'
					? [candidacy({ personId: PLEDGED_ID }), candidacy({ id: 'c-2', slug: 'bob-ray-mayor', firstName: 'Bob', lastName: 'Ray', party: 'Republican' })]
					: [],
			);
		},
		async getOfficeHoldersByGeoId(geoId) {
			calls.push(`officeholders:${geoId}`);
			return Promise.resolve([officeholder()]);
		},
		async getPersonsByIds(ids) {
			calls.push(`persons:${[...ids].sort().join(',')}`);
			return Promise.resolve([personRow(PLEDGED_ID, { slug: 'jane-doe', isPledged: true }), personRow(UNPLEDGED_ID, { fullName: 'Sam Holder', slug: 'sam-holder' })]);
		},
		async getRemovedPersonIds() {
			return Promise.resolve(new Set<string>());
		},
		async resolveProductAvatars() {
			return Promise.resolve(new Map<string, string>());
		},
	};

	test('resolves the place from the route, asks each upcoming race for its candidates and the geo id for its officeholders', async () => {
		calls.length = 0;
		const people = await getFeaturedPeople({ placeSlug: 'tx/harris-county/houston', locationLevel: 'city', today: new Date(2026, 8, 29) }, deps);

		expect(calls).toContain('place:tx/harris-county/houston');
		expect(calls).toContain('candidacies:tx/houston/mayor');
		expect(calls).toContain('candidacies:tx/houston/controller');
		expect(calls).not.toContain('candidacies:tx/harris-county/judge');
		expect(calls).toContain('officeholders:geo-houston');
		expect(calls).toContain(`persons:${[PLEDGED_ID, UNPLEDGED_ID].sort().join(',')}`);

		expect(people.candidates.map(c => c.name)).toEqual(['Jane Doe', 'Bob Ray']);
		expect(people.representatives.map(r => r.name)).toEqual(['Sam Holder']);
		expect(selectFeaturedPeople(people, 'both').map(p => p.name)).toEqual(['Jane Doe']);
	});

	test('drops a candidacy from a past cycle of the same race, and dates the card from its own race', async () => {
		const pastAndPresent: FeaturedPeopleDeps = {
			...deps,
			async getCandidacies({ raceSlug }) {
				if (raceSlug !== 'tx/houston/mayor') return Promise.resolve([]);
				return Promise.resolve([
					candidacy({ id: 'c-old', slug: 'old-timer-mayor', firstName: 'Old', lastName: 'Timer', Race: { brHashId: 'r-2022', electionDate: '2022-11-08' } }),
					candidacy({ personId: PLEDGED_ID, Race: { brHashId: 'r-2026', electionDate: '2026-11-03' } }),
					candidacy({ id: 'c-undated', slug: 'no-date-mayor', firstName: 'No', lastName: 'Date' }),
				]);
			},
		};
		const people = await getFeaturedPeople({ placeSlug: 'tx/harris-county/houston', locationLevel: 'city', today: new Date(2026, 8, 29) }, pastAndPresent);

		expect(people.candidates.map(c => c.name)).toEqual(['Jane Doe', 'No Date']);
		expect(people.candidates[0]?.electionDate).toBe('2026-11-03');
	});

	test('a past-cycle candidate who holds office now stays, as an officeholder, when the feed missed them', async () => {
		const OFFICIAL_ID = 'cccccccc-0000-4000-8000-000000000003';
		const LOSER_ID = 'dddddddd-0000-4000-8000-000000000004';
		let personOptions: { includeOfficeHolders?: boolean } | undefined;
		const withPastWinner: FeaturedPeopleDeps = {
			...deps,
			async getCandidacies({ raceSlug }) {
				if (raceSlug !== 'tx/houston/mayor') return Promise.resolve([]);
				return Promise.resolve([
					candidacy({ id: 'c-won', personId: OFFICIAL_ID, firstName: 'Scott', lastName: 'Corbin', Race: { brHashId: 'r-2025', electionDate: '2025-11-04' } }),
					candidacy({ id: 'c-lost', personId: LOSER_ID, firstName: 'Lost', lastName: 'Out', Race: { brHashId: 'r-2025', electionDate: '2025-11-04' } }),
				]);
			},
			async getOfficeHoldersByGeoId() {
				return Promise.resolve([]);
			},
			async getPersonsByIds(_ids, options) {
				personOptions = options;
				return Promise.resolve([
					personRow(OFFICIAL_ID, {
						fullName: 'Scott Corbin',
						slug: 'scott-corbin',
						OfficeHolders: [officeholder({ id: 'oh-corbin', personId: OFFICIAL_ID, officeTitle: 'Houston City Council - Ward 5', mailingCity: 'Houston' })],
					}),
					personRow(LOSER_ID, { fullName: 'Lost Out', slug: 'lost-out', OfficeHolders: [officeholder({ id: 'oh-old', personId: LOSER_ID, isCurrent: false })] }),
				]);
			},
		};
		const people = await getFeaturedPeople({ placeSlug: 'tx/harris-county/houston', locationLevel: 'city', today: new Date(2026, 8, 29) }, withPastWinner);

		expect(people.candidates).toEqual([]);
		expect(people.representatives.map(r => [r.name, r.office, r.role])).toEqual([['Scott Corbin', 'Houston City Council - Ward 5', 'representative']]);
		expect(personOptions).toEqual({ includeOfficeHolders: true });
	});

	test('asks for sitting officials and the upcoming ballot before past candidates, so the lookup cap never drops them', async () => {
		const pastIds = Array.from({ length: 600 }, (_, i) => `eeeeeeee-0000-4000-8000-${String(i).padStart(12, '0')}`);
		let asked: string[] = [];
		const crowded: FeaturedPeopleDeps = {
			...deps,
			async getCandidacies({ raceSlug }) {
				if (raceSlug !== 'tx/houston/mayor') return Promise.resolve([]);
				return Promise.resolve([
					candidacy({ personId: PLEDGED_ID }),
					...pastIds.map((id, i) => candidacy({ id: `c-past-${i}`, personId: id, Race: { brHashId: 'r-2025', electionDate: '2025-11-04' } })),
				]);
			},
			async getPersonsByIds(ids) {
				asked = [...ids];
				return deps.getPersonsByIds(ids);
			},
		};
		await getFeaturedPeople({ placeSlug: 'tx/harris-county/houston', locationLevel: 'city', today: new Date(2026, 8, 29) }, crowded);

		expect(asked.slice(0, 2).sort()).toEqual([PLEDGED_ID, UNPLEDGED_ID].sort());
		expect(asked.slice(2)).toEqual(pastIds);
	});

	test('a candidate with a published profile is shown with the photo they chose', async () => {
		const people = await getFeaturedPeople(
			{ placeSlug: 'tx/harris-county/houston', locationLevel: 'city', today: new Date(2026, 8, 29) },
			{ ...deps, resolveProductAvatars: async () => Promise.resolve(new Map([[PLEDGED_ID.toLowerCase(), 'https://assets.goodparty.org/chosen.png']])) },
		);
		expect(people.candidates.find(c => c.personId === PLEDGED_ID)?.avatarUrl).toBe('https://assets.goodparty.org/chosen.png');
	});

	test('a removed person keeps no photo even when their profile is live', async () => {
		const people = await getFeaturedPeople(
			{ placeSlug: 'tx/harris-county/houston', locationLevel: 'city', today: new Date(2026, 8, 29) },
			{
				...deps,
				getRemovedPersonIds: async () => Promise.resolve(new Set([PLEDGED_ID.toLowerCase()])),
				resolveProductAvatars: async () => Promise.resolve(new Map([[PLEDGED_ID.toLowerCase(), 'https://assets.goodparty.org/chosen.png']])),
			},
		);
		expect(people.candidates.find(c => c.personId === PLEDGED_ID)?.avatarUrl).toBeNull();
	});

	test('returns two empty lists, and no trusted count, when the place cannot be found', async () => {
		const people = await getFeaturedPeople({ placeSlug: 'tx/nowhere-county/nowhere', locationLevel: 'city' }, deps);

		expect(people).toEqual({ candidates: [], representatives: [], candidatesComplete: false });
	});

	/**
	 * The hero's independent count is only published when every upcoming race was
	 * asked. Two races fit the budget; forty-nine do not.
	 */
	test('says whether the race budget covered every upcoming race', async () => {
		const covered = await getFeaturedPeople({ placeSlug: 'tx/harris-county/houston', locationLevel: 'city', today: new Date(2026, 8, 29) }, deps);
		expect(covered.candidatesComplete).toBe(true);

		const manyRaces: PlaceWithFacts & { geoId?: string } = {
			...cityPlace,
			Races: Array.from({ length: 49 }, (_, i) => race(`tx/houston/seat-${i}`)),
		};
		const overBudget = await getFeaturedPeople(
			{ placeSlug: 'tx/harris-county/houston', locationLevel: 'city', today: new Date(2026, 8, 29) },
			{ ...deps, getElectionsPagePlace: async () => manyRaces },
		);
		expect(overBudget.candidatesComplete).toBe(false);
	});

	/**
	 * A race with no date cannot be placed in any year, so it cannot make a year's
	 * count incomplete: forty-eight dated races plus five undated ones still count
	 * as covered, even though the undated ones fall past the budget.
	 */
	test('undated races past the budget do not make the count incomplete', async () => {
		const withUndated: PlaceWithFacts & { geoId?: string } = {
			...cityPlace,
			Races: [
				...Array.from({ length: 48 }, (_, i) => race(`tx/houston/seat-${i}`)),
				...Array.from({ length: 5 }, (_, i) => race(`tx/houston/undated-${i}`, { electionDate: undefined })),
			],
		};
		const people = await getFeaturedPeople(
			{ placeSlug: 'tx/harris-county/houston', locationLevel: 'city', today: new Date(2026, 8, 29) },
			{ ...deps, getElectionsPagePlace: async () => withUndated },
		);
		expect(people.candidatesComplete).toBe(true);
	});
});

describe('getFeaturedPeople across the ballot', () => {
	/**
	 * The ballot is the offices list's: a city page's own races plus its county's and
	 * its state's, each tier filtered by level the way the list filters it, so the
	 * county's own municipal races stay off the city page's count.
	 */
	test('asks the parent county and state for their races too, filtered to their level', async () => {
		const calls: string[] = [];
		const places: Record<string, PlaceWithFacts> = {
			'tx/harris-county/houston': {
				id: 'p-1',
				name: 'Houston',
				slug: 'tx/harris-county/houston',
				state: 'TX',
				Races: [race('tx/houston/mayor')],
			},
			'tx/harris-county': {
				id: 'p-2',
				name: 'Harris County',
				slug: 'tx/harris-county',
				state: 'TX',
				Races: [race('tx/harris-county/judge', { positionLevel: 'COUNTY' }), race('tx/pasadena/mayor', { positionLevel: 'CITY' })],
			},
			tx: { id: 'p-3', name: 'Texas', slug: 'tx', state: 'TX', Races: [race('tx/governor', { positionLevel: 'STATE' })] },
		};
		const deps: FeaturedPeopleDeps = {
			async getElectionsPagePlace({ slug }) {
				return Promise.resolve(places[slug] ?? null);
			},
			async resolvePlaceRaceElectionDates() {
				return Promise.resolve(new Map());
			},
			async getCandidacies({ raceSlug }) {
				calls.push(raceSlug);
				return Promise.resolve([candidacy({ id: raceSlug, slug: `${raceSlug}-c`, personId: PLEDGED_ID, positionName: raceSlug })]);
			},
			async getOfficeHoldersByGeoId() {
				return Promise.resolve([]);
			},
			async getPersonsByIds() {
				return Promise.resolve([personRow(PLEDGED_ID, { isPledged: true })]);
			},
			async getRemovedPersonIds() {
				return Promise.resolve(new Set<string>());
			},
			async resolveProductAvatars() {
				return Promise.resolve(new Map<string, string>());
			},
		};

		const people = await getFeaturedPeople(
			{ placeSlug: 'tx/harris-county/houston', locationLevel: 'city', today: new Date(2026, 8, 29) },
			deps,
		);

		const ballot = ['tx/governor', 'tx/harris-county/judge', 'tx/houston/mayor'];
		const sorted = (values: string[]) => [...values].sort((a, b) => a.localeCompare(b));
		expect(sorted(calls)).toEqual(ballot);
		expect(sorted(people.candidates.map(c => c.office ?? ''))).toEqual(ballot);
		expect(people.candidatesComplete).toBe(true);
	});

	test('a past-cycle county candidate who holds office now is named with the county, not the city', async () => {
		const JUDGE_ID = 'eeeeeeee-0000-4000-8000-000000000005';
		const places: Record<string, PlaceWithFacts> = {
			'tx/harris-county/houston': { id: 'p-1', name: 'Houston', slug: 'tx/harris-county/houston', state: 'TX', Races: [race('tx/houston/mayor')] },
			'tx/harris-county': { id: 'p-2', name: 'Harris County', slug: 'tx/harris-county', state: 'TX', Races: [race('tx/harris-county/judge', { positionLevel: 'COUNTY' })] },
		};
		const deps: FeaturedPeopleDeps = {
			async getElectionsPagePlace({ slug }) {
				return Promise.resolve(places[slug] ?? null);
			},
			async resolvePlaceRaceElectionDates() {
				return Promise.resolve(new Map());
			},
			async getCandidacies({ raceSlug }) {
				if (raceSlug !== 'tx/harris-county/judge') return Promise.resolve([]);
				return Promise.resolve([candidacy({ id: 'c-judge', personId: JUDGE_ID, firstName: 'Lina', lastName: 'Hidalgo', Race: { brHashId: 'r-2022', electionDate: '2022-11-08' } })]);
			},
			async getOfficeHoldersByGeoId() {
				return Promise.resolve([]);
			},
			async getPersonsByIds() {
				return Promise.resolve([
					personRow(JUDGE_ID, {
						fullName: 'Lina Hidalgo',
						slug: 'lina-hidalgo',
						OfficeHolders: [officeholder({ id: 'oh-judge', personId: JUDGE_ID, officeTitle: 'County Judge', mailingCity: null })],
					}),
				]);
			},
			async getRemovedPersonIds() {
				return Promise.resolve(new Set<string>());
			},
			async resolveProductAvatars() {
				return Promise.resolve(new Map<string, string>());
			},
		};

		const people = await getFeaturedPeople({ placeSlug: 'tx/harris-county/houston', locationLevel: 'city', today: new Date(2026, 8, 29) }, deps);

		expect(people.candidates).toEqual([]);
		expect(people.representatives.map(r => [r.name, r.location])).toEqual([['Lina Hidalgo', 'Harris County, TX']]);
	});

	/**
	 * Officials follow the ballot up as well (Emily, 2026-10-06): a city page carries
	 * its county's and its state's current officeholders, each named with its own
	 * tier's place rather than the city's.
	 */
	test('asks every tier for its officeholders and names each with its own place', async () => {
		const COUNTY_ID = '44444444-4444-4444-8444-444444444444';
		const STATE_ID = '55555555-5555-4555-8555-555555555555';
		const places: Record<string, PlaceWithFacts & { geoId?: string }> = {
			'tx/harris-county/houston': { id: 'p-1', name: 'Houston', slug: 'tx/harris-county/houston', state: 'TX', geoId: 'geo-houston', Races: [] },
			'tx/harris-county': { id: 'p-2', name: 'Harris County', slug: 'tx/harris-county', state: 'TX', geoId: 'geo-harris', Races: [] },
			tx: { id: 'p-3', name: 'Texas', slug: 'tx', state: 'TX', geoId: 'geo-tx', Races: [] },
		};
		const byGeo: Record<string, PersonOfficeHolder[]> = {
			'geo-houston': [officeholder({ id: 'oh-city', personId: UNPLEDGED_ID })],
			'geo-harris': [officeholder({ id: 'oh-county', personId: COUNTY_ID, officeTitle: 'County Judge' })],
			'geo-tx': [officeholder({ id: 'oh-state', personId: STATE_ID, officeTitle: 'Governor', mailingCity: 'Austin' })],
		};
		const asked: string[] = [];
		const deps: FeaturedPeopleDeps = {
			async getElectionsPagePlace({ slug }) {
				return Promise.resolve(places[slug] ?? null);
			},
			async resolvePlaceRaceElectionDates() {
				return Promise.resolve(new Map());
			},
			async getCandidacies() {
				return Promise.resolve([]);
			},
			async getOfficeHoldersByGeoId(geoId) {
				asked.push(geoId);
				return Promise.resolve(byGeo[geoId] ?? []);
			},
			async getPersonsByIds() {
				return Promise.resolve([
					personRow(UNPLEDGED_ID, { fullName: 'Sam Holder' }),
					personRow(COUNTY_ID, { fullName: 'Cora County', isPledged: true }),
					personRow(STATE_ID, { fullName: 'Stan State', isPledged: true }),
				]);
			},
			async getRemovedPersonIds() {
				return Promise.resolve(new Set<string>());
			},
			async resolveProductAvatars() {
				return Promise.resolve(new Map<string, string>());
			},
		};

		const people = await getFeaturedPeople(
			{ placeSlug: 'tx/harris-county/houston', locationLevel: 'city', today: new Date(2026, 8, 29) },
			deps,
		);

		expect([...asked].sort((a, b) => a.localeCompare(b))).toEqual(['geo-harris', 'geo-houston', 'geo-tx']);
		expect(people.representatives.map(r => [r.name, r.office, r.location])).toEqual([
			['Sam Holder', 'Council Member', 'Houston, TX'],
			['Cora County', 'County Judge', 'Harris County, TX'],
			['Stan State', 'Governor', 'Austin, TX'],
		]);
	});
});

describe('summarizeIndependents', () => {
	const pledged = (i: number, overrides: Partial<FeaturedPersonCard> = {}) => person(i, { isPledged: true, ...overrides });

	const complete = (candidates: FeaturedPersonCard[], representatives: FeaturedPersonCard[] = []) => ({
		candidates,
		representatives,
		candidatesComplete: true,
	});

	test('counts distinct pledged candidates when the list is complete, zero included', () => {
		expect(summarizeIndependents(complete([pledged(1), pledged(1), pledged(2), person(3)]))).toEqual({ candidateCount: 2, hasAny: true });
		expect(summarizeIndependents(complete([person(1)], [person(2, { role: 'representative' })]))).toEqual({ candidateCount: 0, hasAny: false });
	});

	test('withholds the count when the list is partial, but one pledged person found is still proof', () => {
		const partial = { candidates: [pledged(1)], representatives: [], candidatesComplete: false };
		expect(summarizeIndependents(partial)).toEqual({ candidateCount: null, hasAny: true });
		expect(summarizeIndependents(complete([], [pledged(2, { role: 'representative' })]))).toEqual({ candidateCount: 0, hasAny: true });
	});

	test('a year scopes the count to that year\'s elections but not the button', () => {
		const people = {
			candidates: [pledged(1, { electionDate: '2026-11-03' }), pledged(2, { electionDate: '2028-11-07' }), pledged(3, { electionDate: null })],
			representatives: [],
			candidatesComplete: true,
		};
		expect(summarizeIndependents(people, 2026)).toEqual({ candidateCount: 1, hasAny: true });
		expect(summarizeIndependents(people, 2030)).toEqual({ candidateCount: 0, hasAny: true });
		expect(summarizeIndependents(people)).toEqual({ candidateCount: 3, hasAny: true });
	});

	test('a pledged officeholder does not count as a candidate', () => {
		expect(summarizeIndependents(complete([], [pledged(1, { role: 'representative' })])).candidateCount).toBe(0);
	});

	test('no data hides both', () => {
		expect(summarizeIndependents(undefined)).toEqual({ candidateCount: null, hasAny: false });
	});
});
