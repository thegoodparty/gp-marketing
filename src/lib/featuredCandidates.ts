import {
	getCandidacies,
	getElectionsPagePlace,
	getOfficeHoldersByGeoId,
	getPersonsByIds,
	getRemovedPersonIds,
} from '~/lib/electionsApi';
import { getStateName, isElectionDateBeforeToday, resolvePlaceRaceElectionDates } from '~/lib/electionsHelpers';
import { type NearbyOfficesTier, nearbyOfficesTiers, raceBelongsToTier } from '~/lib/nearbyOffices';
import { classifyPartyFrom, isMajorParty, orderPartyNames } from '~/lib/party';
import { cardAvatarUrl, pledgedFromSpine } from '~/lib/peopleProfile';
import { formatPersonName } from '~/lib/personName';
import { buildPersonSlug, buildPersonSlugFromBase, slugifyName } from '~/lib/personSlug';
import type { CandidacyItem, PlaceRace, PlaceWithFacts } from '~/types/elections';
import type { PersonItem, PersonOfficeHolder } from '~/types/people';
import type { FeaturedLocationLevel, FeaturedPeople, FeaturedPersonCard } from '~/lib/featuredPeople';

export type { FeaturedLocationLevel, FeaturedPeople, FeaturedPeopleMode, FeaturedPersonCard, FeaturedPersonRole } from '~/lib/featuredPeople';
export { FEATURED_PEOPLE_LIMIT, rankFeaturedPeople, selectFeaturedPeople, summarizeIndependents } from '~/lib/featuredPeople';

/**
 * How many upcoming races on a page's ballot are asked for their candidates. Each
 * race is one `/v1/candidacies?raceSlug=` request, because candidacies cannot be
 * filtered by place. Soonest elections first, so a ballot with more races than
 * this is only partly covered, and the hero then hides its independent count,
 * until election-api offers a place-and-year aggregate
 * (docs/election-redesign-components.md asks for one). Raised from 16 when the
 * ballot grew to include the parent county and state (Emily, 2026-10-05): real
 * city pages carry 20 to 40 races across all years in the offices list.
 */
export const FEATURED_RACE_BUDGET = 48;

const CONCURRENT_RACE_REQUESTS = 6;

type PlaceContext = {
	name: string;
	state: string;
	level: FeaturedLocationLevel;
};

function personHref(personId: string, person: PersonItem | undefined, name: string): string {
	return `/people/${person?.slug ? buildPersonSlugFromBase(person.slug, personId) : buildPersonSlug(name, personId)}`;
}

function nonpartisan(...parties: Array<string | null | undefined>): boolean {
	return !isMajorParty(classifyPartyFrom(...orderPartyNames(parties)));
}

/** "Place, ST" for a city or county page; a state page names the person's own city instead. */
function locationLine(place: PlaceContext, ownCity: string | null | undefined): string | null {
	if (place.level !== 'state') return `${place.name}, ${place.state}`;
	return ownCity ? `${ownCity}, ${place.state}` : null;
}

/**
 * "Houston, TX", or just "Texas" when the place is the state itself: a statewide
 * candidacy's place is the state, and "Indiana, IN" reads as a mistake (Emily, 2026-10-07).
 */
export function placeWithState(placeName: string, state: string): string {
	return isStateName(placeName, state) ? placeName : `${placeName}, ${state}`;
}

function isStateName(placeName: string, state: string): boolean {
	const name = placeName.trim().toLowerCase();
	const code = state.trim().toLowerCase();
	return name === code || name === getStateName(state).toLowerCase();
}

export function buildCandidateCards(
	candidacies: Array<{ candidacy: CandidacyItem; race: PlaceRace; electionDate: string }>,
	personsById: Map<string, PersonItem>,
	place: PlaceContext,
	removedPersonIds: ReadonlySet<string> | null,
): FeaturedPersonCard[] {
	const cards: FeaturedPersonCard[] = [];
	for (const { candidacy, race, electionDate } of candidacies) {
		const personId = candidacy.personId ?? null;
		const person = personId ? personsById.get(personId.toLowerCase()) : undefined;
		const name = formatPersonName([candidacy.firstName, candidacy.lastName].filter(Boolean).join(' '));
		if (!name) continue;
		const href = personId ? personHref(personId, person, name) : candidacy.slug ? `/candidate/${candidacy.slug}` : null;
		if (!href) continue;
		cards.push({
			personId,
			name,
			office: candidacy.positionName ?? race.normalizedPositionName ?? race.name ?? null,
			location: candidacy.placeName && candidacy.state ? placeWithState(candidacy.placeName, candidacy.state) : locationLine(place, null),
			href,
			avatarUrl: cardAvatarUrl(personId, candidacy.image ?? person?.headshotUrl ?? null, removedPersonIds),
			isPledged: pledgedFromSpine(person, candidacy.party),
			isNonpartisan: nonpartisan(candidacy.party),
			role: 'candidate',
			electionDate,
			raceSlug: race.slug.toLowerCase(),
		});
	}
	return cards;
}

export function buildRepresentativeCards(
	officeholders: PersonOfficeHolder[],
	personsById: Map<string, PersonItem>,
	place: PlaceContext,
	removedPersonIds: ReadonlySet<string> | null,
): FeaturedPersonCard[] {
	const cards: FeaturedPersonCard[] = [];
	for (const oh of officeholders) {
		// Only an explicit current term counts, as the profile's role and Incumbent pill decide it; null is unknown.
		if (oh.isCurrent !== true) continue;
		const personId = oh.personId ?? null;
		if (!personId) continue;
		const person = personsById.get(personId.toLowerCase());
		const name =
			formatPersonName(person?.fullName) ?? formatPersonName([person?.firstName, person?.lastName].filter(Boolean).join(' '));
		if (!name) continue;
		cards.push({
			personId,
			name,
			office: oh.officeTitle ?? oh.Position?.name ?? oh.positionName ?? null,
			location: locationLine(place, oh.mailingCity),
			href: `/people/${buildPersonSlugFromBase(person?.slug ?? slugifyName(name), personId)}`,
			avatarUrl: cardAvatarUrl(personId, person?.headshotUrl ?? null, removedPersonIds),
			isPledged: pledgedFromSpine(person, ...(oh.partyNames ?? [])),
			isNonpartisan: nonpartisan(...(oh.partyNames ?? [])),
			role: 'representative',
			electionDate: null,
			raceSlug: null,
		});
	}
	return cards;
}

export type FeaturedPeopleDeps = {
	getElectionsPagePlace(params: { slug: string }): Promise<PlaceWithFacts | null>;
	resolvePlaceRaceElectionDates(races: PlaceRace[], today?: Date): Promise<Map<string, string>>;
	getCandidacies(params: { raceSlug: string }): Promise<CandidacyItem[]>;
	getOfficeHoldersByGeoId(geoId: string): Promise<PersonOfficeHolder[]>;
	getPersonsByIds(ids: string[]): Promise<PersonItem[]>;
	getRemovedPersonIds(): Promise<Set<string> | null>;
};

const defaultDeps: FeaturedPeopleDeps = {
	getElectionsPagePlace,
	resolvePlaceRaceElectionDates,
	getCandidacies,
	getOfficeHoldersByGeoId,
	getPersonsByIds,
	getRemovedPersonIds,
};

/** Mirrors the level filter the location page applies to its own offices list. */
function tierLevelFor(level: FeaturedLocationLevel): 'state' | 'county' | 'city' {
	return level === 'district' ? 'county' : level;
}

type DatedRace = { race: PlaceRace; electionDate: string };

/** The tier's upcoming races, each with the date the offices list would show for it. */
function upcomingTierRaces(
	races: PlaceRace[],
	tierLevel: NearbyOfficesTier['level'],
	options: { resolvedDates?: Map<string, string>; today: Date },
): DatedRace[] {
	return races
		.filter(race => race.slug && raceBelongsToTier(race, tierLevel))
		.map(race => ({ race, electionDate: options.resolvedDates?.get(race.slug) ?? race.electionDate ?? '' }))
		.filter(({ electionDate }) => !isElectionDateBeforeToday(electionDate, options.today));
}

/** Soonest first, one entry per race slug, within the request budget. */
function orderSoonest(entries: DatedRace[], budget: number): DatedRace[] {
	const seen = new Set<string>();
	return entries
		.filter(({ race }) => {
			const key = race.slug.toLowerCase();
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		})
		.sort((a, b) => {
			if (a.electionDate !== b.electionDate) {
				if (!a.electionDate) return 1;
				if (!b.electionDate) return -1;
				return a.electionDate.localeCompare(b.electionDate);
			}
			return a.race.slug.localeCompare(b.race.slug);
		})
		.slice(0, budget);
}

/**
 * Upcoming races in the place at the page's level, soonest first, within the
 * request budget. Past elections are left out because their candidates are no
 * longer "running" here; a race whose primary has passed is re-dated the way the
 * offices list does it.
 */
export function selectFeaturedRaces(
	races: PlaceRace[],
	options: { level: FeaturedLocationLevel; resolvedDates?: Map<string, string>; today?: Date; budget?: number },
): DatedRace[] {
	const { level, resolvedDates, today = new Date(), budget = FEATURED_RACE_BUDGET } = options;
	return orderSoonest(upcomingTierRaces(races, tierLevelFor(level), { resolvedDates, today }), budget);
}

async function mapConcurrently<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
	const results: R[] = [];
	for (let i = 0; i < items.length; i += limit) {
		results.push(...(await Promise.all(items.slice(i, i + limit).map(fn))));
	}
	return results;
}

async function resolveTierPlace(tier: NearbyOfficesTier, deps: FeaturedPeopleDeps): Promise<PlaceWithFacts | null> {
	for (const slug of tier.slugs) {
		const place = await deps.getElectionsPagePlace({ slug });
		if (place) return place;
	}
	return null;
}

/**
 * The candidates running on a location page's ballot and the people who
 * currently hold its offices, as separate lists so the Studio setting can pick
 * either or both at render time. Both lists are empty when the place cannot be
 * found, and the block hides itself.
 *
 * The ballot is the same one the offices list shows (Emily, 2026-10-05): the
 * place's own races plus those of the places above it, because a voter in a city
 * also votes in its county's and its state's races. It never looks down. Each
 * tier is filtered by level the way the list filters it, so a county's municipal
 * races do not leak onto a county page.
 *
 * `placeSlug` is the page's route path (`tx`, `tx/harris-county`,
 * `tx/harris-county/houston`), resolved to election-api places the same way
 * nearby offices does it. Candidates come from the races through
 * `/v1/candidacies?raceSlug=`; representatives from `/v1/officeholders?geoId=`
 * for every tier's place, so a city page also carries the county's and the
 * state's current officials (Emily, 2026-10-06), each named with its own tier's
 * place. The pledge flag and party evidence come from the person rows, exactly
 * as the `/people` profile cards read them.
 */
export async function getFeaturedPeople(
	params: { placeSlug: string; locationLevel: FeaturedLocationLevel; today?: Date },
	deps: FeaturedPeopleDeps = defaultDeps,
): Promise<FeaturedPeople> {
	const empty: FeaturedPeople = { candidates: [], representatives: [], candidatesComplete: false };
	const tiers = nearbyOfficesTiers(params.placeSlug);
	const places = await Promise.all(tiers.map(async tier => resolveTierPlace(tier, deps)));
	const place = places[0];
	if (!place) return empty;

	const today = params.today ?? new Date();
	const placeContext: PlaceContext = { name: place.name, state: place.state, level: params.locationLevel };
	// Officials above the page are named with their own tier's place, so a county
	// official on a city page reads "Harris County, TX", not the city.
	const tierContexts: PlaceContext[] = places.map((tierPlace, index) => {
		const level = tiers[index]?.level;
		return index === 0 || !tierPlace || !level ? placeContext : { name: tierPlace.name, state: tierPlace.state, level };
	});
	const tierRaces = await Promise.all(
		tiers.map(async (tier, index) => {
			const races = places[index]?.Races ?? [];
			const resolvedDates = races.length > 0 ? await deps.resolvePlaceRaceElectionDates(races, today) : new Map<string, string>();
			return upcomingTierRaces(races, tier.level, { resolvedDates, today });
		}),
	);
	// Ordered without the budget first, so the result can say whether the budget
	// cut anything: the hero's independent count hides when it did. Undated races
	// sort last and cannot be placed in any year, so they can neither join a year's
	// count nor make it incomplete; only a dated race left out breaks completeness.
	// Which tier each race came from, so a person rescued from a past cycle below
	// is named with that tier's place like the officeholders feed's own rows.
	const tierOfRace = new Map<PlaceRace, number>();
	tierRaces.forEach((entries, index) => {
		for (const entry of entries) tierOfRace.set(entry.race, index);
	});
	const eligibleRaces = orderSoonest(tierRaces.flat(), Number.POSITIVE_INFINITY);
	const selectedRaces = eligibleRaces.slice(0, FEATURED_RACE_BUDGET);
	const datedRacesCovered = eligibleRaces.filter(({ electionDate }) => electionDate).every(entry => selectedRaces.includes(entry));

	const [candidaciesByRace, officeholdersByTier, removedPersonIds] = await Promise.all([
		mapConcurrently(selectedRaces, CONCURRENT_RACE_REQUESTS, async ({ race, electionDate }) =>
			(await deps.getCandidacies({ raceSlug: race.slug })).map(candidacy => ({ candidacy, race, electionDate })),
		),
		Promise.all(places.map(async tierPlace => (tierPlace?.geoId ? deps.getOfficeHoldersByGeoId(tierPlace.geoId) : []))),
		deps.getRemovedPersonIds(),
	]);
	// A race slug is shared across cycles, so the candidacies feed returns past
	// cycles too. Only people on the upcoming ballot belong among the candidates
	// (Emily, 2026-10-07): a candidacy whose own race date has passed is set
	// aside, and one that carries a date uses it on the card rather than the
	// slug's date.
	const candidacies: typeof candidaciesByRace[number] = [];
	const pastCandidacies: typeof candidaciesByRace[number] = [];
	for (const entry of candidaciesByRace.flat()) {
		const ownDate = entry.candidacy.Race?.electionDate;
		if (!ownDate) candidacies.push(entry);
		else if (isElectionDateBeforeToday(ownDate, today)) pastCandidacies.push(entry);
		else candidacies.push({ ...entry, electionDate: ownDate });
	}

	// election-api answers the first 500 ids only. Sitting officials and the
	// upcoming ballot go first, so a long history of past candidates can never
	// push the people the carousel is actually about past the cap.
	const personIds = [
		...officeholdersByTier.flat().map(oh => oh.personId),
		...candidacies.map(({ candidacy }) => candidacy.personId),
		...pastCandidacies.map(({ candidacy }) => candidacy.personId),
	].filter((id): id is string => Boolean(id));
	const persons = personIds.length > 0 ? await deps.getPersonsByIds(personIds) : [];
	const personsById = new Map(persons.map(person => [person.id.toLowerCase(), person]));

	const representatives = officeholdersByTier.flatMap((officeholders, index) =>
		buildRepresentativeCards(officeholders, personsById, tierContexts[index] ?? placeContext, removedPersonIds),
	);

	// A past-cycle candidate who holds office now is still a current official,
	// and the officeholders feed can miss them (Holland, MI's council reached
	// the block only through their 2025 race). Their person record carries the
	// current term, so they stay, as the officeholder they are, when the feed
	// did not already list them.
	const listed = new Set(representatives.map(card => card.personId?.toLowerCase()));
	for (const { candidacy, race } of pastCandidacies) {
		const personId = candidacy.personId;
		if (!personId || listed.has(personId.toLowerCase())) continue;
		const person = personsById.get(personId.toLowerCase());
		const currentOffice = person?.OfficeHolders?.find(office => office.isCurrent === true);
		if (!currentOffice) continue;
		const context = tierContexts[tierOfRace.get(race) ?? 0] ?? placeContext;
		representatives.push(...buildRepresentativeCards([{ ...currentOffice, personId }], personsById, context, removedPersonIds));
		listed.add(personId.toLowerCase());
	}

	return {
		candidates: buildCandidateCards(candidacies, personsById, placeContext, removedPersonIds),
		representatives,
		candidatesComplete: datedRacesCovered,
	};
}
