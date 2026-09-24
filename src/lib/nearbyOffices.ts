import { getPlaceBySlug } from '~/lib/electionsApi';
import {
	buildPlaceRacePositionHref,
	isElectionDateBeforeToday,
	PLACE_RACE_COLUMNS,
	resolvePlaceRaceElectionDates,
} from '~/lib/electionsHelpers';
import type { PlaceRace, PlaceWithFacts } from '~/types/elections';
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
 */
export function nearbyOfficesTiers(routePlaceSlug: string): NearbyOfficesTier[] {
	const segments = routePlaceSlug.toLowerCase().split('/').filter(Boolean);
	const tiers: NearbyOfficesTier[] = [];
	for (let length = segments.length; length >= 1; length--) {
		const tierSegments = segments.slice(0, length);
		const slug = tierSegments.join('/');
		if (length >= 3) {
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
	}));
}

export type NearbyOfficesDeps = {
	getPlaceBySlug(params: { slug: string; includeRaces: boolean; placeColumns: string; raceColumns: string }): Promise<PlaceWithFacts | null>;
	resolvePlaceRaceElectionDates(races: PlaceRace[], today?: Date): Promise<Map<string, string>>;
};

const defaultDeps: NearbyOfficesDeps = { getPlaceBySlug, resolvePlaceRaceElectionDates };

/**
 * Nearby offices for a position page: the other upcoming positions in the same
 * place, else the first tier above it that has any. Returns an empty list when
 * no tier does, and the block hides itself.
 */
export async function getNearbyOffices(
	params: { placeSlug: string; currentRaceSlug?: string; today?: Date },
	deps: NearbyOfficesDeps = defaultDeps,
): Promise<OfficeItem[]> {
	for (const tier of nearbyOfficesTiers(params.placeSlug)) {
		let races: PlaceRace[] = [];
		for (const slug of tier.slugs) {
			const place = await deps.getPlaceBySlug({
				slug,
				includeRaces: true,
				placeColumns: 'slug,name',
				raceColumns: PLACE_RACE_COLUMNS,
			});
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
		if (offices.length > 0) return offices;
	}
	return [];
}
