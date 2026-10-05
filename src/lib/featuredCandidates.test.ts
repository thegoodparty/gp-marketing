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
		candidates: [person(1)],
		representatives: [person(2, { role: 'representative', electionDate: null })],
	};

	test('both merges the two lists', () => {
		expect(selectFeaturedPeople(people, 'both').map(p => p.personId)).toEqual(['person-1', 'person-2']);
	});

	test('candidates and representatives pick one list each', () => {
		expect(selectFeaturedPeople(people, 'candidates').map(p => p.personId)).toEqual(['person-1']);
		expect(selectFeaturedPeople(people, 'representatives').map(p => p.personId)).toEqual(['person-2']);
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
		});
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
		expect(selectFeaturedPeople(people, 'both').map(p => p.name)).toEqual(['Jane Doe', 'Sam Holder', 'Bob Ray']);
	});

	test('returns two empty lists when the place cannot be found', async () => {
		const people = await getFeaturedPeople({ placeSlug: 'tx/nowhere-county/nowhere', locationLevel: 'city' }, deps);

		expect(people).toEqual({ candidates: [], representatives: [] });
	});
});
