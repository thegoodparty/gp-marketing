import {
	getElectionsPagePlace,
	getOfficeHoldersByGeoId,
	getOfficeHoldersByPositionIdOrNull,
	getPersonsByIds,
	getRemovedPersonIds,
} from '~/lib/electionsApi';
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
 * (the office title stands in for the name) but cannot link anywhere. A person
 * under a privacy takedown keeps their row but loses the photo and the link.
 * When the takedown list itself could not be read (`removedPersonIds` is null)
 * every photo is withheld, per `getRemovedPersonIds`'s contract: a gp-api blip
 * may cost thumbnails, it must never republish a photo somebody asked to take
 * down. Links stay in that case, as they do on the profile pages' cards, since
 * the profile route applies the takedown itself.
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
	const removed = personId !== null && removedPersonIds !== null && removedPersonIds.has(personId);
	const photoAllowed = personId !== null && removedPersonIds !== null && !removed;
	const seatLabel = [office.subAreaName, office.subAreaValue].filter(Boolean).join(' ') || undefined;
	return {
		key: office.id,
		name,
		href: personId && !removed ? `/people/${buildPersonSlugFromBase(person?.slug ?? slugifyName(name), personId)}` : undefined,
		avatar: photoAllowed ? (person?.headshotUrl ?? undefined) : undefined,
		party: office.partyNames?.[0] ?? undefined,
		isPledged: pledgedFromSpine(person, ...(office.partyNames ?? [])),
		term: formatOfficeholderTerm(office) ?? undefined,
		seatLabel,
		seatValue: office.subAreaValue ?? undefined,
		seatName: office.subAreaName ?? undefined,
	};
}

export type PositionOfficeholderDeps = {
	getOfficeHoldersByPositionIdOrNull: typeof getOfficeHoldersByPositionIdOrNull;
	getOfficeHoldersByGeoId: typeof getOfficeHoldersByGeoId;
	getElectionsPagePlace: typeof getElectionsPagePlace;
	getPersonsByIds: typeof getPersonsByIds;
	getRemovedPersonIds: typeof getRemovedPersonIds;
};

const defaultDeps: PositionOfficeholderDeps = {
	getOfficeHoldersByPositionIdOrNull,
	getOfficeHoldersByGeoId,
	getElectionsPagePlace,
	getPersonsByIds,
	getRemovedPersonIds,
};

export type PositionOfficeholderQuery = {
	/** The page's race's BallotReady position id: one seat of a multi-seat office. */
	positionId?: string | null;
	/** The page's place. Its officeholders are read to find the other seats of the same office. */
	placeSlug?: string | null;
	/** The office's name as election-api normalises it, to pick its seats out of the place's officeholders. */
	positionName?: string | null;
};

function normalizePositionName(value: string | null | undefined): string {
	return (value ?? '').trim().toLowerCase();
}

/**
 * The other seats of a multi-district office. A race carries one position id,
 * and `/v1/officeholders?positionId=` answers for that seat alone, so Los
 * Angeles' city council page listed District 9 and nobody else (Emily,
 * 2026-10-07). The place's officeholders, filtered to the same normalised
 * position name, cover every district. A failed read here is an empty list,
 * not a hidden section: the race's own seat still answers.
 */
async function loadPlaceSeats(query: PositionOfficeholderQuery, deps: PositionOfficeholderDeps): Promise<PersonOfficeHolder[]> {
	const wanted = normalizePositionName(query.positionName);
	if (!query.placeSlug || !wanted) return [];
	try {
		const place = await deps.getElectionsPagePlace({ slug: query.placeSlug });
		if (!place?.geoId) return [];
		const rows = await deps.getOfficeHoldersByGeoId(place.geoId);
		return rows.filter(row => normalizePositionName(row.normalizedPositionName) === wanted);
	} catch {
		return [];
	}
}

/**
 * Numbered seats in district order, then the unnumbered ones as election-api
 * returned them. The race's own row may carry no district value while every
 * seat from the place read is numbered, and that must not leave the whole
 * list in arrival order.
 */
function orderSeats(rows: PersonOfficeHolder[]): PersonOfficeHolder[] {
	const district = (row: PersonOfficeHolder) => (row.subAreaValue != null && /^\d+$/.test(row.subAreaValue) ? Number(row.subAreaValue) : null);
	const numbered = rows.filter(row => district(row) !== null).sort((a, b) => (district(a) ?? 0) - (district(b) ?? 0));
	return [...numbered, ...rows.filter(row => district(row) === null)];
}

/**
 * The current holders of a position, for the position page's "Who's currently
 * in office" list. `undefined` means election-api gave no answer (or the query
 * names nothing to ask for) and the section hides; an empty list is a real
 * "nobody on record" and hides too, because there is nothing to list.
 *
 * Two reads are merged: the race's own position id, and the page place's
 * officeholders filtered to the same office, which is how a multi-district
 * council lists every seat rather than the one the race happens to carry.
 */
export async function loadPositionOfficeholders(
	query: PositionOfficeholderQuery | string | null | undefined,
	deps: PositionOfficeholderDeps = defaultDeps,
): Promise<ElectionsPositionPerson[] | undefined> {
	const q: PositionOfficeholderQuery = typeof query === 'string' || query == null ? { positionId: query } : query;
	const wantsPlaceSeats = Boolean(q.placeSlug && normalizePositionName(q.positionName));
	if (!q.positionId && !wantsPlaceSeats) return undefined;

	const [byPosition, byPlace] = await Promise.all([
		q.positionId ? deps.getOfficeHoldersByPositionIdOrNull(q.positionId) : Promise.resolve<PersonOfficeHolder[] | null>([]),
		loadPlaceSeats(q, deps),
	]);
	if (byPosition === null && byPlace.length === 0) return undefined;

	const rows = [...(byPosition ?? []).filter(row => row.positionId === q.positionId), ...byPlace];
	const current = orderSeats(rows.filter(row => row.isCurrent !== false));
	const personIds = current.map(row => row.personId).filter((id): id is string => typeof id === 'string' && id.length > 0);
	let persons: PersonItem[] = [];
	let removed: ReadonlySet<string> | null = null;
	try {
		[persons, removed] = await Promise.all([
			personIds.length > 0 ? deps.getPersonsByIds(personIds) : Promise.resolve([]),
			deps.getRemovedPersonIds(),
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
		// A person holds one seat, so the person id dedupes a seat the two reads both
		// returned. A row with no linked person falls back to its own id: two vacant
		// seats share an office title but are still two seats.
		const dedupeKey = row.personId?.toLowerCase() ?? `row:${row.id}`;
		if (seen.has(dedupeKey)) continue;
		seen.add(dedupeKey);
		people.push(mapped);
	}
	return people;
}
