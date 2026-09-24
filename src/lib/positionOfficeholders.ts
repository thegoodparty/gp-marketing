import { getOfficeHoldersByPositionIdOrNull, getPersonsByIds, getRemovedPersonIds } from '~/lib/electionsApi';
import { pledgedFromSpine } from '~/lib/peopleProfile';
import { formatPersonName } from '~/lib/personName';
import { buildPersonSlugFromBase, slugifyName } from '~/lib/personSlug';
import type { PersonItem, PersonOfficeHolder } from '~/types/people';
import type { ElectionsPositionPerson } from '~/ui/ElectionsPositionContentBlock';

function formatYear(value: string | null | undefined): string | null {
	if (!value) return null;
	const match = /^(\d{4})/.exec(value);
	return match?.[1] ?? null;
}

/** "2023 to 2027", "Through 2027", or null when the spine carries no real dates. */
export function formatOfficeholderTerm(office: Pick<PersonOfficeHolder, 'startAt' | 'endAt'>): string | null {
	const start = formatYear(office.startAt);
	const end = formatYear(office.endAt);
	if (start && end) return `${start} to ${end}`;
	if (end) return `Through ${end}`;
	return null;
}

/**
 * One "Who's currently in office" row. Rows with no linked person still render
 * (the office title stands in for the name) but cannot link anywhere; a person
 * under a privacy takedown keeps their row but loses the photo and the link,
 * the same rule the profile pages' related-person cards apply.
 */
export function mapOfficeholderToPerson(
	office: PersonOfficeHolder,
	person: PersonItem | undefined,
	removedPersonIds: ReadonlySet<string> | null,
): ElectionsPositionPerson | null {
	const personId = office.personId?.toLowerCase() ?? null;
	const fromPerson = formatPersonName(person?.fullName) ?? [person?.firstName, person?.lastName].filter(Boolean).join(' ');
	const name = fromPerson || formatPersonName(office.officeTitle) || '';
	if (!name) return null;
	const removed = personId !== null && removedPersonIds?.has(personId) === true;
	const seatLabel = [office.subAreaName, office.subAreaValue].filter(Boolean).join(' ') || undefined;
	return {
		key: office.id,
		name,
		href: personId && !removed ? `/people/${buildPersonSlugFromBase(person?.slug ?? slugifyName(name), personId)}` : undefined,
		avatar: removed ? undefined : (person?.headshotUrl ?? undefined),
		party: office.partyNames?.[0] ?? undefined,
		isPledged: pledgedFromSpine(person, ...(office.partyNames ?? [])),
		term: formatOfficeholderTerm(office) ?? undefined,
		seatLabel,
		seatValue: office.subAreaValue ?? undefined,
	};
}

/**
 * The current holders of a position, for the position page's "Who's currently
 * in office" list. `undefined` means election-api gave no answer (or the race
 * carries no position id) and the section hides; an empty list is a real
 * "nobody on record" and hides too, because there is nothing to list.
 */
export async function loadPositionOfficeholders(positionId: string | null | undefined): Promise<ElectionsPositionPerson[] | undefined> {
	if (!positionId) return undefined;
	const rows = await getOfficeHoldersByPositionIdOrNull(positionId);
	if (rows === null) return undefined;
	const current = rows.filter(row => row.positionId === positionId && row.isCurrent !== false);
	const personIds = current.map(row => row.personId).filter((id): id is string => typeof id === 'string' && id.length > 0);
	let persons: PersonItem[] = [];
	let removed: ReadonlySet<string> | null = null;
	try {
		[persons, removed] = await Promise.all([
			personIds.length > 0 ? getPersonsByIds(personIds) : Promise.resolve([]),
			getRemovedPersonIds(),
		]);
	} catch {
		persons = [];
	}
	const personsById = new Map(persons.map(p => [p.id.toLowerCase(), p]));
	const seen = new Set<string>();
	const people: ElectionsPositionPerson[] = [];
	for (const row of current) {
		const person = row.personId ? personsById.get(row.personId.toLowerCase()) : undefined;
		const mapped = mapOfficeholderToPerson(row, person, removed);
		if (!mapped) continue;
		const dedupeKey = row.personId?.toLowerCase() ?? mapped.name.toLowerCase();
		if (seen.has(dedupeKey)) continue;
		seen.add(dedupeKey);
		people.push(mapped);
	}
	return people;
}
