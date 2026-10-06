import { getCandidaciesOrNull, getPersonsByIds } from '~/lib/electionsApi';
import { mapCandidacyToCard } from '~/lib/electionsHelpers';
import { classifyParty, isMajorParty } from '~/lib/party';
import { pledgedFromSpine } from '~/lib/peopleProfile';
import type { CandidacyItem } from '~/types/elections';
import type { PersonItem } from '~/types/people';
import type { ElectionsPositionHeroCandidate } from '~/ui/ElectionsPositionHero';

export function mapCandidacyToHeroCandidate(
	candidacy: CandidacyItem,
	index: number,
	person: PersonItem | undefined,
): ElectionsPositionHeroCandidate {
	const card = mapCandidacyToCard(candidacy, index);
	return {
		key: card._key,
		name: card.name,
		party: card.partyAffiliation,
		partyClass: classifyParty(candidacy.party),
		isPledged: pledgedFromSpine(person, candidacy.party),
		href: card.href,
		avatar: card.avatar,
		seatName: candidacy.subAreaName ?? candidacy.Position?.subAreaName ?? undefined,
		seatValue: candidacy.subAreaValue ?? candidacy.Position?.subAreaValue ?? undefined,
	};
}

/**
 * The hero's ballot rows for a race. Returns `undefined`, not `[]`, when
 * election-api gave no answer, so the card hides rather than publishing
 * "0 candidates" for a race we simply could not read. `getCandidacies` folds
 * that case into an empty list, which is why this reads the nullable variant.
 */
export async function loadPositionHeroCandidates(raceSlug: string): Promise<ElectionsPositionHeroCandidate[] | undefined> {
	const candidacies = await getCandidaciesOrNull({ raceSlug });
	if (candidacies === null) return undefined;
	return heroCandidatesFromCandidacies(candidacies);
}

export async function heroCandidatesFromCandidacies(candidacies: CandidacyItem[]): Promise<ElectionsPositionHeroCandidate[]> {
	const personIds = candidacies.map(c => c.personId).filter((id): id is string => typeof id === 'string' && id.length > 0);
	let persons: PersonItem[] = [];
	if (personIds.length > 0) {
		try {
			persons = await getPersonsByIds(personIds);
		} catch {
			persons = [];
		}
	}
	const personsById = new Map(persons.map(p => [p.id.toLowerCase(), p]));
	return rankPositionCandidates(
		candidacies.map((c, i) => mapCandidacyToHeroCandidate(c, i, c.personId ? personsById.get(c.personId.toLowerCase()) : undefined)),
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
