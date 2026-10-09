/**
 * One office per profile page, and one source of party evidence per card.
 *
 * Both are loader decisions, so these run the real `loadPersonProfile` against a
 * fetch stub, the way the state matrix does. The shapes are Andrew Cuomo's page
 * on 2026-10-09: a former governor whose last run (New York City Mayor, 2025)
 * had taken over the breadcrumb, the "About" card and "Other Candidates" under a
 * hero that said "Former New York Governor"; and, on that mayoral list, Zohran
 * Mamdani marked as pledged off his "Working Families Party" ballot line while
 * his own profile read the Democratic line on his office and called him
 * ineligible.
 */
import { afterEach, describe, expect, test } from 'bun:test';
import type { CandidacyItem } from '~/types/elections';
import type { PersonCandidacySummary, PersonItem, PersonOfficeHolder } from '~/types/people';
import { buildPeopleFetchMock, fixtureForState, PERSON_ID } from '~/testing/peopleProfileFixtures';
import { loadPersonProfile } from './peopleProfile';

const originalFetch = globalThis.fetch;
afterEach(() => {
	globalThis.fetch = originalFetch;
});

const MAMDANI = '568df699-cb5f-4372-0ba8-39c1e58f9357';
const WALDEN = '9bde2363-8f5c-5382-ea7b-9d9a2b7eb4aa';
const UPCOMING = `${new Date().getUTCFullYear() + 1}-11-03`;
const MAYOR_SLUG = 'ny/new-york/city-executive-mayor';

function governorTerm(): PersonOfficeHolder {
	return {
		id: 'off-gov',
		positionId: 'pos-gov',
		geoId: 'geo-ny',
		positionName: 'New York Governor',
		normalizedPositionName: 'Governor',
		officeTitle: 'New York Governor',
		partyNames: ['Democratic'],
		startAt: '2019-01-01',
		endAt: '2021-08-24',
		termDateSpecificity: null,
		isCurrent: false,
		isAppointed: null,
		numberOfSeats: null,
		state: 'NY',
		subAreaName: null,
		subAreaValue: null,
		websiteUrl: null,
		officePhone: null,
		officeEmail: null,
		mailingCity: null,
		mailingState: null,
		positionSlug: 'ny/governor',
		positionLevel: 'STATE',
	};
}

function mayoralRun(electionDate: string): PersonCandidacySummary {
	return {
		id: 'cand-mayor',
		slug: MAYOR_SLUG,
		positionName: 'New York City Mayor',
		party: 'Fight and Deliver',
		state: 'NY',
		Race: { electionDate, slug: MAYOR_SLUG, positionLevel: 'CITY' },
	};
}

function mayoralRival(over: Partial<CandidacyItem>): CandidacyItem {
	return {
		id: `cand-${over.personId ?? 'x'}`,
		raceId: 'race-mayor',
		positionId: 'pos-mayor',
		positionName: 'New York City Mayor',
		state: 'NY',
		Race: { brHashId: 'br-mayor', slug: MAYOR_SLUG, positionId: 'pos-mayor', positionLevel: 'CITY', electionDate: UPCOMING },
		...over,
	};
}

type Routes = {
	person: PersonItem;
	candidaciesByPosition: Record<string, CandidacyItem[]>;
	persons(url: URL): PersonItem[];
};

/** Routes the interlink endpoints the matrix's stub leaves empty, and logs every election-api URL. */
function stubFetch(routes: Routes): string[] {
	const base = buildPeopleFetchMock({ ...fixtureForState('H'), person: routes.person });
	const urls: string[] = [];
	const json = (data: unknown) => ({ ok: true, status: 200, json: async () => data }) as unknown as Response;
	globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
		const raw = String(input);
		urls.push(raw);
		const url = new URL(raw);
		if (url.pathname.endsWith('/v1/candidacies')) {
			const slug = url.searchParams.get('slug');
			if (slug) {
				const own = (routes.person.Candidacies ?? []).find((c) => c.slug === slug);
				return json(own ? [mayoralRival({ id: own.id, personId: routes.person.id, party: own.party ?? undefined })] : []);
			}
			return json(routes.candidaciesByPosition[url.searchParams.get('positionId') ?? ''] ?? []);
		}
		if (url.pathname.endsWith('/v1/persons') && url.searchParams.has('ids')) return json(routes.persons(url));
		return base(input, init);
	}) as unknown as typeof fetch;
	return urls;
}

describe('a former officeholder keeps one office across the page', () => {
	test('the office the hero names is the one the breadcrumb, the About card and Other Candidates describe', async () => {
		const person: PersonItem = {
			...fixtureForState('H').person,
			fullName: 'Andrew M. Cuomo',
			firstName: 'Andrew',
			lastName: 'Cuomo',
			state: 'NY',
			OfficeHolders: [governorTerm()],
			Candidacies: [mayoralRun('2025-11-04')],
		};
		const urls = stubFetch({
			person,
			candidaciesByPosition: {
				'pos-gov': [mayoralRival({ personId: WALDEN, firstName: 'Kathy', lastName: 'Hochul', party: 'Democratic', positionId: 'pos-gov' })],
				'pos-mayor': [mayoralRival({ personId: MAMDANI, firstName: 'Zohran', lastName: 'Mamdani', party: 'Working Families Party' })],
			},
			persons: () => [],
		});

		const view = await loadPersonProfile(PERSON_ID);
		expect(view).not.toBeNull();
		if (!view) return;

		expect(view.persona).toBe('past');
		expect(view.roleTitle).toBe('Former New York Governor');
		expect(view.positionName).toBe('New York Governor');
		expect(view.breadcrumb.map((c) => c.label)).toEqual(['Elections', 'New York', 'New York Governor', 'Andrew M. Cuomo']);
		expect(view.positionHref).toBe('/elections/ny/position/governor');
		expect(view.breadcrumb.at(-2)?.href).toBe('/elections/ny/position/governor');
		// The About card: the governor's term, no "Next election" borrowed from the mayoral race.
		expect(view.termLabel).toBe('2019 – 2021');
		expect(view.electionDate).toBeNull();
		expect(view.positionId).toBe('pos-gov');
		expect(view.otherCandidates.map((c) => c.name)).toEqual(['Kathy Hochul']);
		// The mayoral race was never asked about: not its detail, not its field.
		expect(urls.some((u) => u.includes('/v1/candidacies?slug='))).toBe(false);
		expect(urls.some((u) => u.includes('positionId=pos-mayor'))).toBe(false);
		// The past run still appears in Recent Experience, as experience.
		expect(view.recentExperience.map((e) => e.title)).toEqual(['Candidate for New York City Mayor', 'New York Governor']);
	});

	test('the same person with the race still ahead is a candidate for it, everywhere', async () => {
		const person: PersonItem = {
			...fixtureForState('H').person,
			fullName: 'Andrew M. Cuomo',
			state: 'NY',
			OfficeHolders: [governorTerm()],
			Candidacies: [mayoralRun(UPCOMING)],
		};
		stubFetch({
			person,
			candidaciesByPosition: {
				'pos-mayor': [mayoralRival({ personId: MAMDANI, firstName: 'Zohran', lastName: 'Mamdani', party: 'Working Families Party' })],
			},
			persons: () => [],
		});

		const view = await loadPersonProfile(PERSON_ID);
		expect(view?.persona).toBe('candidate');
		expect(view?.roleTitle).toBe('Candidate for New York City Mayor');
		expect(view?.positionName).toBe('New York City Mayor');
		expect(view?.breadcrumb.at(-2)?.label).toBe('New York City Mayor');
		expect(view?.electionDate).toBe(UPCOMING);
		expect(view?.otherCandidates.map((c) => c.name)).toEqual(['Zohran Mamdani']);
	});
});

describe('a related-person card reads the whole record its profile reads', () => {
	test('a fusion candidate on a minor line is not marked pledged when his office carries a major line', async () => {
		const person: PersonItem = {
			...fixtureForState('H').person,
			fullName: 'Jim Walden',
			state: 'NY',
			OfficeHolders: [],
			Candidacies: [{ ...mayoralRun(UPCOMING), party: 'Integrity' }],
		};
		const urls = stubFetch({
			person,
			candidaciesByPosition: {
				'pos-mayor': [
					mayoralRival({ personId: MAMDANI, firstName: 'Zohran', lastName: 'Mamdani', party: 'Working Families Party' }),
					mayoralRival({ personId: WALDEN, firstName: 'Curtis', lastName: 'Sliwa', party: 'Independence' }),
				],
			},
			// What `/v1/persons?ids=` sends: scalars always, relations only when asked for.
			persons: (url) => {
				const withOffices = url.searchParams.get('includeOfficeHolders') === 'true';
				const withRuns = url.searchParams.get('includeCandidacies') === 'true';
				return [
					{
						...fixtureForState('H').person,
						id: MAMDANI,
						fullName: 'Zohran Mamdani',
						isPledged: true,
						OfficeHolders: withOffices ? [{ ...governorTerm(), isCurrent: true, partyNames: ['Working Families Party', 'Democratic'] }] : [],
						Candidacies: withRuns ? [{ id: 'c-m', positionName: 'New York City Mayor', party: 'Democratic' }] : [],
					},
					{
						...fixtureForState('H').person,
						id: WALDEN,
						fullName: 'Curtis Sliwa',
						isPledged: true,
						OfficeHolders: [],
						Candidacies: withRuns ? [{ id: 'c-s', positionName: 'New York City Mayor', party: 'Independence' }] : [],
					},
				];
			},
		});

		const view = await loadPersonProfile(PERSON_ID);
		expect(view).not.toBeNull();
		if (!view) return;

		const personsUrl = urls.find((u) => u.includes('/v1/persons?'));
		expect(personsUrl).toContain('includeOfficeHolders=true');
		expect(personsUrl).toContain('includeCandidacies=true');

		const byName = new Map(view.otherCandidates.map((c) => [c.name, c]));
		expect(byName.get('Zohran Mamdani')?.isPledged).toBe(false);
		expect(byName.get('Curtis Sliwa')?.isPledged).toBe(true);
	});
});
