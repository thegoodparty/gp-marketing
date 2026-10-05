import { getCandidacies, getOfficeHoldersByGeoId, getPersonsByIds, getPlaceBySlug, getRemovedPersonIds } from '~/lib/electionsApi';
import { isElectionDateBeforeToday, PLACE_RACE_COLUMNS, resolvePlaceRaceElectionDates } from '~/lib/electionsHelpers';
import { nearbyOfficesTiers, raceBelongsToTier } from '~/lib/nearbyOffices';
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
 * How many of a place's upcoming races are asked for their candidates. Each race
 * is one `/v1/candidacies?raceSlug=` request, because candidacies cannot be
 * filtered by place. Soonest elections first, so a state legislature with more
 * seats than this on one ballot is only partly covered until election-api offers
 * a place-and-year aggregate (docs/election-redesign-components.md asks for one).
 */
export const FEATURED_RACE_BUDGET = 16;

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
			location: candidacy.placeName && candidacy.state ? `${candidacy.placeName}, ${candidacy.state}` : locationLine(place, null),
			href,
			avatarUrl: cardAvatarUrl(personId, candidacy.image ?? person?.headshotUrl ?? null, removedPersonIds),
			isPledged: pledgedFromSpine(person, candidacy.party),
			isNonpartisan: nonpartisan(candidacy.party),
			role: 'candidate',
			electionDate,
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
		});
	}
	return cards;
}

export type FeaturedPeopleDeps = {
	getPlaceBySlug(params: { slug: string; includeRaces: boolean; placeColumns: string; raceColumns: string }): Promise<PlaceWithFacts | null>;
	resolvePlaceRaceElectionDates(races: PlaceRace[], today?: Date): Promise<Map<string, string>>;
	getCandidacies(params: { raceSlug: string }): Promise<CandidacyItem[]>;
	getOfficeHoldersByGeoId(geoId: string): Promise<PersonOfficeHolder[]>;
	getPersonsByIds(ids: string[]): Promise<PersonItem[]>;
	getRemovedPersonIds(): Promise<Set<string> | null>;
};

const defaultDeps: FeaturedPeopleDeps = {
	getPlaceBySlug,
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

/**
 * Upcoming races in the place, soonest first, within the request budget. Past
 * elections are left out because their candidates are no longer "running" here;
 * a race whose primary has passed is re-dated the way the offices list does it.
 */
export function selectFeaturedRaces(
	races: PlaceRace[],
	options: { level: FeaturedLocationLevel; resolvedDates?: Map<string, string>; today?: Date; budget?: number },
): Array<{ race: PlaceRace; electionDate: string }> {
	const { level, resolvedDates, today = new Date(), budget = FEATURED_RACE_BUDGET } = options;
	const tierLevel = tierLevelFor(level);
	const seen = new Set<string>();
	return races
		.filter(race => race.slug && raceBelongsToTier(race, tierLevel))
		.map(race => ({ race, electionDate: resolvedDates?.get(race.slug) ?? race.electionDate ?? '' }))
		.filter(({ race, electionDate }) => {
			if (isElectionDateBeforeToday(electionDate, today)) return false;
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

async function mapConcurrently<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
	const results: R[] = [];
	for (let i = 0; i < items.length; i += limit) {
		results.push(...(await Promise.all(items.slice(i, i + limit).map(fn))));
	}
	return results;
}

/**
 * The candidates running in a location page's own races and the people who
 * currently hold its offices, as separate lists so the Studio setting can pick
 * either or both at render time. Both lists are empty when the place cannot be
 * found, and the block hides itself.
 *
 * `placeSlug` is the page's route path (`tx`, `tx/harris-county`,
 * `tx/harris-county/houston`), resolved to an election-api place the same way
 * nearby offices does it. Candidates come from the place's races through
 * `/v1/candidacies?raceSlug=`; representatives from `/v1/officeholders?geoId=`
 * with the place's own geo id. The pledge flag and party evidence come from the
 * person rows, exactly as the `/people` profile cards read them.
 */
export async function getFeaturedPeople(
	params: { placeSlug: string; locationLevel: FeaturedLocationLevel; today?: Date },
	deps: FeaturedPeopleDeps = defaultDeps,
): Promise<FeaturedPeople> {
	const empty: FeaturedPeople = { candidates: [], representatives: [], candidatesComplete: false };
	const tier = nearbyOfficesTiers(params.placeSlug)[0];
	if (!tier) return empty;

	let place: PlaceWithFacts | null = null;
	for (const slug of tier.slugs) {
		place = await deps.getPlaceBySlug({ slug, includeRaces: true, placeColumns: 'slug,name,state,geoId', raceColumns: PLACE_RACE_COLUMNS });
		if (place) break;
	}
	if (!place) return empty;

	const placeContext: PlaceContext = { name: place.name, state: place.state, level: params.locationLevel };
	const races = place.Races ?? [];
	const resolvedDates = races.length > 0 ? await deps.resolvePlaceRaceElectionDates(races, params.today) : new Map<string, string>();
	// Asked without the budget first, so the result can say whether the budget cut
	// anything: the hero's independent count hides when it did.
	const eligibleRaces = selectFeaturedRaces(races, {
		level: params.locationLevel,
		resolvedDates,
		today: params.today,
		budget: Number.POSITIVE_INFINITY,
	});
	const selectedRaces = eligibleRaces.slice(0, FEATURED_RACE_BUDGET);

	const [candidaciesByRace, officeholders, removedPersonIds] = await Promise.all([
		mapConcurrently(selectedRaces, CONCURRENT_RACE_REQUESTS, async ({ race, electionDate }) =>
			(await deps.getCandidacies({ raceSlug: race.slug })).map(candidacy => ({ candidacy, race, electionDate })),
		),
		place.geoId ? deps.getOfficeHoldersByGeoId(place.geoId) : Promise.resolve([]),
		deps.getRemovedPersonIds(),
	]);
	const candidacies = candidaciesByRace.flat();

	const personIds = [
		...candidacies.map(({ candidacy }) => candidacy.personId),
		...officeholders.map(oh => oh.personId),
	].filter((id): id is string => Boolean(id));
	const persons = personIds.length > 0 ? await deps.getPersonsByIds(personIds) : [];
	const personsById = new Map(persons.map(person => [person.id.toLowerCase(), person]));

	return {
		candidates: buildCandidateCards(candidacies, personsById, placeContext, removedPersonIds),
		representatives: buildRepresentativeCards(officeholders, personsById, placeContext, removedPersonIds),
		candidatesComplete: selectedRaces.length === eligibleRaces.length,
	};
}
