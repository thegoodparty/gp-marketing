import { getCandidaciesOrNull, getPersonsByIds, getRemovedPersonIds } from '~/lib/electionsApi';
import { isElectionDateBeforeToday, mapCandidacyToCard } from '~/lib/electionsHelpers';
import { classifyPartyFrom, isMajorParty, orderPartyNames } from '~/lib/party';
import { CARD_PERSON_RELATIONS, cardAvatarUrl, personPartyNames, pledgedFromSpine } from '~/lib/peopleProfile';
import { resolveProductAvatars } from '~/lib/productAvatars';
import type { CandidacyItem } from '~/types/elections';
import type { PersonItem } from '~/types/people';
import type { ElectionsPositionHeroCandidate } from '~/ui/ElectionsPositionHero';

export function mapCandidacyToHeroCandidate(
	candidacy: CandidacyItem,
	index: number,
	person: PersonItem | undefined,
): ElectionsPositionHeroCandidate {
	const card = mapCandidacyToCard(candidacy, index);
	// The party is the person's, read the way their profile reads it, not the one
	// ballot line this row was filed on: under fusion voting that line is often a
	// minor party standing in for a major-party nominee (see `personPartyNames`).
	// The row's line is the fallback when the record names no party.
	const recordParties = personPartyNames(person);
	const parties = recordParties.length > 0 ? recordParties : orderPartyNames([candidacy.party]);
	return {
		key: card._key,
		name: card.name,
		party: parties.length > 0 ? parties.join(', ') : card.partyAffiliation,
		partyClass: classifyPartyFrom(...orderPartyNames([...parties, candidacy.party])),
		isPledged: pledgedFromSpine(person, candidacy.party),
		href: card.href,
		avatar: card.avatar,
		// The candidacy's own race row carries the seat (asked for by getCandidaciesOrNull);
		// the older candidacy-level fields are kept as fallbacks (Emily, 2026-10-06).
		seatName: candidacy.Race?.subAreaName ?? candidacy.subAreaName ?? candidacy.Position?.subAreaName ?? undefined,
		seatValue: candidacy.Race?.subAreaValue ?? candidacy.subAreaValue ?? candidacy.Position?.subAreaValue ?? undefined,
	};
}

/**
 * The hero's ballot rows for a race. Returns `undefined`, not `[]`, when
 * election-api gave no answer, so the card hides rather than publishing
 * "0 candidates" for a race we simply could not read. `getCandidacies` folds
 * that case into an empty list, which is why this reads the nullable variant.
 */
export type CandidateCycleOptions = {
	/** The page race's own election date; candidacies of that cycle always stay. */
	raceElectionDate?: string | null;
	today?: Date;
};

/**
 * The candidacies that belong on the page: `/v1/candidacies?raceSlug=` returns
 * every cycle of a slug, so Garden Grove's council page listed two District 5
 * candidates from 2024 (one of them the sitting member) as filed for 2026, and
 * counted five where the location page counted two (Emily, 2026-10-07). A
 * candidacy stays when it carries no race date, when its race is still ahead,
 * or when its race is the page's own, so a decided page keeps its field.
 */
export function currentCycleCandidacies(candidacies: CandidacyItem[], options: CandidateCycleOptions = {}): CandidacyItem[] {
	const today = options.today ?? new Date();
	const pageDay = options.raceElectionDate?.slice(0, 10);
	return candidacies.filter(candidacy => {
		const ownDate = candidacy.Race?.electionDate;
		if (!ownDate) return true;
		if (pageDay && ownDate.slice(0, 10) === pageDay) return true;
		return !isElectionDateBeforeToday(ownDate, today);
	});
}

export async function loadPositionHeroCandidates(
	raceSlug: string,
	options: CandidateCycleOptions = {},
): Promise<ElectionsPositionHeroCandidate[] | undefined> {
	const candidacies = await getCandidaciesOrNull({ raceSlug });
	if (candidacies === null) return undefined;
	return heroCandidatesFromCandidacies(candidacies, options);
}

export async function heroCandidatesFromCandidacies(
	allCandidacies: CandidacyItem[],
	options: CandidateCycleOptions = {},
): Promise<ElectionsPositionHeroCandidate[]> {
	const candidacies = currentCycleCandidacies(allCandidacies, options);
	const personIds = candidacies.map(c => c.personId).filter((id): id is string => typeof id === 'string' && id.length > 0);
	let persons: PersonItem[] = [];
	if (personIds.length > 0) {
		try {
			persons = await getPersonsByIds(personIds, CARD_PERSON_RELATIONS);
		} catch {
			persons = [];
		}
	}
	const personsById = new Map(persons.map(p => [p.id.toLowerCase(), p]));
	// The person's own profile photo outranks the feed's, as on their profile
	// page, and a takedown outranks both: the removals list and the profile come
	// from two systems, so a photo the list suppressed is never put back, and an
	// unreadable list (null) keeps every photo off, as cardAvatarUrl does.
	const [avatars, removed] = await Promise.all([resolveProductAvatars(personIds), getRemovedPersonIds()]);
	return rankPositionCandidates(
		candidacies.map((c, i) => {
			const card = mapCandidacyToHeroCandidate(c, i, c.personId ? personsById.get(c.personId.toLowerCase()) : undefined);
			const id = c.personId?.toLowerCase() ?? null;
			const chosen = id && removed !== null && !removed.has(id) ? avatars.get(id) : undefined;
			return { ...card, avatar: cardAvatarUrl(id, chosen ?? card.avatar ?? null, removed) ?? undefined };
		}),
	);
}

/**
 * The order every list on a position page shows its candidates in (Emily,
 * 2026-10-06): people who took the pledge first, then the unpledged with no
 * major party, then Republicans and Democrats. Stable inside each group, so
 * the feed's order survives. The hero's "On the ballot" card shows the first
 * four of this list and the content block shows all of it, so the rule lives
 * here, where both read from. It is the featured candidates block's rule.
 */
export function rankPositionCandidates(candidates: ElectionsPositionHeroCandidate[]): ElectionsPositionHeroCandidate[] {
	const tier = (c: ElectionsPositionHeroCandidate): number => (c.isPledged ? 0 : isMajorParty(c.partyClass ?? null) ? 2 : 1);
	return [0, 1, 2].flatMap(t => candidates.filter(c => tier(c) === t));
}
