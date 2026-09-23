import { getCandidaciesOrNull, getPersonsByIds } from '~/lib/electionsApi';
import { mapCandidacyToCard } from '~/lib/electionsHelpers';
import { classifyParty } from '~/lib/party';
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
	return candidacies.map((c, i) => mapCandidacyToHeroCandidate(c, i, c.personId ? personsById.get(c.personId.toLowerCase()) : undefined));
}
