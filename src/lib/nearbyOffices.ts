import { getCandidacies, getElectionsPagePlace, getPersonsByIds } from '~/lib/electionsApi';
import {
	buildPlaceRacePositionHref,
	isElectionDateBeforeToday,
	resolvePlaceRaceElectionDates,
} from '~/lib/electionsHelpers';
import { pledgedFromSpine } from '~/lib/peopleProfile';
import type { CandidacyItem, PlaceRace, PlaceWithFacts } from '~/types/elections';
import type { PersonItem } from '~/types/people';
import type { OfficeItem } from '~/ui/ListOfOfficesBlock';
import { NEARBY_OFFICES_LIMIT } from '~/ui/NearbyOffices';

export type NearbyOfficesTier = {
	level: 'state' | 'county' | 'city';
	/** Route segments of the place, lowercased: ['tx', 'harris-county', 'houston']. */
	segments: string[];
	/** Place slugs to try, most specific first. */
	slugs: string[];
};

/**
 * The places to look in, nearest first. A position page's place is the first
 * tier; each tier after it drops one route segment, so a city falls back to
 * its county and a county to its state (Emily, 2026-09-24). The county comes
 * from the route rather than from the place name because some cities are named
 * after a county they are not in.
 *
 * `routePlaceSlug` is the page's route path, not an election-api place slug:
 * `tx` (state route), `tx/harris-county` (county route) or
 * `tx/harris-county/houston` (city route). Segment count therefore says which
 * level the page is. A two-segment route is always a county (or a state-level
 * district, which the county page also treats as county): the county position
 * route redirects city races to the four-level URL before rendering. The API's
 * short `state/city` slug appears only in `slugs`, as one form to try.
 *
 * A four-segment route (`state/county/city/subplace`, the joint-office and
 * sub-place races) starts at its parent city: a subplace is not a tier of its
 * own, and only the three place levels have a position route to link to.
 */
export function nearbyOfficesTiers(routePlaceSlug: string): NearbyOfficesTier[] {
	const segments = routePlaceSlug.toLowerCase().split('/').filter(Boolean);
	const tiers: NearbyOfficesTier[] = [];
	for (let length = Math.min(segments.length, 3); length >= 1; length--) {
		const tierSegments = segments.slice(0, length);
		const slug = tierSegments.join('/');
		if (length === 3) {
			// City places are slugged either state/county/city or state/city; the city
			// location page tries both, so this does too.
			tiers.push({ level: 'city', segments: tierSegments, slugs: [slug, `${tierSegments[0]}/${tierSegments.at(-1)}`] });
		} else {
			tiers.push({ level: length === 2 ? 'county' : 'state', segments: tierSegments, slugs: [slug] });
		}
	}
	return tiers;
}

/** Mirrors the level filter each location page applies to its own offices list. */
export function raceBelongsToTier(race: PlaceRace, level: NearbyOfficesTier['level']): boolean {
	const raceLevel = race.positionLevel?.toUpperCase();
	if (level === 'state') return raceLevel === 'STATE';
	if (level === 'county') return raceLevel === 'COUNTY' || raceLevel === 'LOCAL';
	return raceLevel === 'CITY' || raceLevel === 'LOCAL';
}

const LEVEL_LABELS: Record<string, string> = {
	FEDERAL: 'Federal',
	STATE: 'State',
	COUNTY: 'County',
	CITY: 'Local',
	LOCAL: 'Local',
};

const TIER_LABELS: Record<NearbyOfficesTier['level'], string> = { state: 'State', county: 'County', city: 'Local' };

export function officeLevelLabel(positionLevel: string | undefined, fallback: NearbyOfficesTier['level']): string {
	return LEVEL_LABELS[positionLevel?.toUpperCase() ?? ''] ?? TIER_LABELS[fallback];
}

export type SelectNearbyOfficesOptions = {
	tier: NearbyOfficesTier;
	/** The race the page is about, left out of its own nearby list. */
	currentRaceSlug?: string;
	/** Election dates re-resolved for primaries that have passed, keyed by race slug. */
	resolvedDates?: Map<string, string>;
	today?: Date;
	limit?: number;
};

/**
 * Upcoming races in the tier, soonest first, capped. Past elections are left
 * out because a "nearby office" whose election already happened is a dead end
 * for a voter, and a tier with only past races counts as empty so the search
 * moves one level up.
 */
export function selectNearbyOffices(races: PlaceRace[], options: SelectNearbyOfficesOptions): OfficeItem[] {
	const { tier, currentRaceSlug, resolvedDates, today = new Date(), limit = NEARBY_OFFICES_LIMIT } = options;
	const current = currentRaceSlug?.toLowerCase();
	const seen = new Set<string>();

	const upcoming = races
		.filter(race => race.slug && race.slug.toLowerCase() !== current && raceBelongsToTier(race, tier.level))
		.map(race => ({ race, electionDate: resolvedDates?.get(race.slug) ?? race.electionDate ?? '' }))
		.filter(({ race, electionDate }) => {
			if (isElectionDateBeforeToday(electionDate, today)) return false;
			const key = race.slug.toLowerCase();
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		})
		.sort((a, b) => {
			if (!a.electionDate) return 1;
			if (!b.electionDate) return -1;
			return a.electionDate.localeCompare(b.electionDate);
		});

	return upcoming.slice(0, limit).map(({ race, electionDate }) => ({
		// Race lists from election-api carry no reliable id, so the slug is the key.
		id: race.slug,
		type: officeLevelLabel(race.positionLevel, tier.level),
		position: race.normalizedPositionName ?? race.name ?? 'Position',
		nextElectionDate: electionDate,
		href: buildPlaceRacePositionHref(tier.segments, race.slug),
		raceSlug: race.slug.toLowerCase(),
	}));
}

const CONCURRENT_RACE_REQUESTS = 6;

export type NearbyOfficesDeps = {
	getElectionsPagePlace(params: { slug: string }): Promise<PlaceWithFacts | null>;
	resolvePlaceRaceElectionDates(races: PlaceRace[], today?: Date): Promise<Map<string, string>>;
	getCandidacies(params: { raceSlug: string }): Promise<CandidacyItem[]>;
	getPersonsByIds(ids: string[]): Promise<PersonItem[]>;
};

const defaultDeps: NearbyOfficesDeps = { getElectionsPagePlace, resolvePlaceRaceElectionDates, getCandidacies, getPersonsByIds };

/**
 * Each row's "# of independents running" (Emily, 2026-10-06): the candidates in
 * its race who have taken the GoodParty.org Pledge, by the same `pledgedFromSpine`
 * rule the offices list, the candidate cards and the profiles apply, counted once
 * per person. The figure therefore never disagrees with the offices list on a
 * location page or with a person's own profile.
 *
 * Candidacies cannot be filtered by place, so this is one `/v1/candidacies`
 * request per row (at most eight) and one person lookup, which is the same shape
 * the location pages already use. A race whose request fails has no count, and
 * the row shows nothing rather than a zero: an unknown and a genuine zero look the
 * same, and the pledge flag is still being written across production.
 */
export async function withPledgedCounts(
	offices: OfficeItem[],
	deps: Pick<NearbyOfficesDeps, 'getCandidacies' | 'getPersonsByIds'> = defaultDeps,
): Promise<OfficeItem[]> {
	const slugs = offices.map(office => office.raceSlug).filter((slug): slug is string => Boolean(slug));
	if (slugs.length === 0) return offices;

	const candidaciesByRace = new Map<string, CandidacyItem[]>();
	for (let i = 0; i < slugs.length; i += CONCURRENT_RACE_REQUESTS) {
		await Promise.all(
			slugs.slice(i, i + CONCURRENT_RACE_REQUESTS).map(async raceSlug => {
				candidaciesByRace.set(raceSlug, await deps.getCandidacies({ raceSlug }));
			}),
		);
	}

	const personIds = [...candidaciesByRace.values()].flat().map(candidacy => candidacy.personId).filter((id): id is string => Boolean(id));
	const persons = personIds.length > 0 ? await deps.getPersonsByIds(personIds) : [];
	const personsById = new Map(persons.map(person => [person.id.toLowerCase(), person]));

	return offices.map(office => {
		const pledged = new Set<string>();
		for (const candidacy of candidaciesByRace.get(office.raceSlug ?? '') ?? []) {
			if (!candidacy.personId) continue;
			const person = personsById.get(candidacy.personId.toLowerCase());
			if (pledgedFromSpine(person, candidacy.party)) pledged.add(candidacy.personId.toLowerCase());
		}
		return pledged.size > 0 ? { ...office, pledgedCount: pledged.size } : office;
	});
}

/**
 * Nearby offices for a position page: the other upcoming positions in the same
 * place, else the first tier above it that has any, each with its pledged
 * candidate count. Returns an empty list when no tier has anything, and the
 * block hides itself.
 */
export async function getNearbyOffices(
	params: { placeSlug: string; currentRaceSlug?: string; today?: Date },
	deps: NearbyOfficesDeps = defaultDeps,
): Promise<OfficeItem[]> {
	for (const tier of nearbyOfficesTiers(params.placeSlug)) {
		let races: PlaceRace[] = [];
		for (const slug of tier.slugs) {
			const place = await deps.getElectionsPagePlace({ slug });
			if (place) {
				races = place.Races ?? [];
				break;
			}
		}
		if (races.length === 0) continue;

		const resolvedDates = await deps.resolvePlaceRaceElectionDates(races, params.today);
		const offices = selectNearbyOffices(races, {
			tier,
			currentRaceSlug: params.currentRaceSlug,
			resolvedDates,
			today: params.today,
		});
		if (offices.length > 0) return independentsFirst(await withPledgedCounts(offices, deps));
	}
	return [];
}

/**
 * Offices with independents on the ballot lead the list (Emily, 2026-10-06), the
 * rest follow, and each half keeps the soonest-first order `selectNearbyOffices`
 * built. The same rule the offices list block applies.
 */
export function independentsFirst(offices: OfficeItem[]): OfficeItem[] {
	const has = (office: OfficeItem) => (office.pledgedCount ?? 0) > 0;
	return [...offices.filter(has), ...offices.filter(office => !has(office))];
}
