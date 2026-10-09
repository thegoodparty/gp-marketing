import { getCandidacies, getPersonsByIds, getPublishedPersonProfileIds, getRemovedPersonIds } from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import { getStateName, isElectionDateBeforeToday } from '~/lib/electionsHelpers';
import { placeWithState } from '~/lib/featuredCandidates';
import { FEATURED_PEOPLE_LIMIT, type FeaturedPeople, type FeaturedPersonCard } from '~/lib/featuredPeople';
import { classifyPartyFrom, isMajorParty, orderPartyNames } from '~/lib/party';
import { cardAvatarUrl, pledgedFromSpine } from '~/lib/peopleProfile';
import { formatPersonName } from '~/lib/personName';
import { buildPersonSlugFromBase, personIdSuffix, slugifyName } from '~/lib/personSlug';
import { resolveProductAvatars } from '~/lib/productAvatars';
import type { CandidacyItem } from '~/types/elections';
import type { PersonItem, PersonOfficeHolder } from '~/types/people';

/**
 * The weekly pick for pages with no ballot of their own (the /elections landing
 * page). The pool is everyone with a published GoodParty.org profile, narrowed
 * to pledged people who are running in an upcoming election or hold office now
 * and have a photo (Emily, 2026-10-09: no past candidates who are not in
 * office). Eight are drawn at random, weighted towards a product photo and an
 * election close at hand, with the ISO week as the seed, so the set changes on
 * Monday and nothing has to run on a schedule. Editors pin or exclude people
 * from the block's Weekly Rotation settings in Studio.
 */

/** An election this close lifts a candidate's odds of being drawn. */
const SOON_ELECTION_DAYS = 120;
const CONCURRENT_CANDIDACY_REQUESTS = 6;

export type PersonRef = { id?: string; suffix: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A Studio entry is a profile link ("https://goodparty.org/people/jane-doe-1a2b3c4d"),
 * the slug on its own, a bare 8-character id tail, or a full person id. The link
 * only carries the first eight characters of the id, which is what the /people
 * slugs carry, so a link matches a person by that prefix.
 */
export function parsePersonRef(value: string | null | undefined): PersonRef | null {
	const trimmed = (value ?? '').trim();
	if (!trimmed) return null;
	if (UUID_RE.test(trimmed)) return { id: trimmed.toLowerCase(), suffix: personIdSuffix(trimmed) };
	const last = trimmed.replace(/[?#].*$/, '').replace(/\/+$/, '').split('/').pop() ?? '';
	const match = /(?:^|-)([0-9a-f]{8})$/i.exec(last);
	return match?.[1] ? { suffix: match[1].toLowerCase() } : null;
}

export function refMatches(ref: PersonRef, personId: string): boolean {
	return ref.id ? ref.id === personId.toLowerCase() : personIdSuffix(personId) === ref.suffix;
}

/** "2026-W41": the ISO week, so the pick is the same for everyone all week and changes on Monday. */
export function weekKey(date: Date): string {
	const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
	const weekday = day.getUTCDay() || 7;
	day.setUTCDate(day.getUTCDate() + 4 - weekday);
	const yearStart = Date.UTC(day.getUTCFullYear(), 0, 1);
	const week = Math.ceil(((day.getTime() - yearStart) / 86_400_000 + 1) / 7);
	return `${day.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/** A small deterministic generator (FNV-1a seed into mulberry32); quality is beside the point, repeatability is not. */
export function seededRandom(seed: string): () => number {
	let hash = 0x811c9dc5;
	for (const char of seed) {
		hash ^= char.codePointAt(0) ?? 0;
		hash = Math.imul(hash, 0x01000193) >>> 0;
	}
	let state = hash || 1;
	return () => {
		state = (state + 0x6d2b79f5) >>> 0;
		let t = state;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export type RotationEntry = { personId: string; weight: number };

/**
 * Pinned people first, in the order the editor listed them, then a weighted
 * draw without replacement (each entry keyed by rand^(1/weight), highest keys
 * win) for the remaining places. The same seed and pool always give the same
 * answer; a different week gives a different one.
 */
export function pickWeeklyPeople(
	entries: RotationEntry[],
	options: { seed: string; pins?: PersonRef[]; excludes?: PersonRef[]; limit?: number },
): string[] {
	const limit = options.limit ?? FEATURED_PEOPLE_LIMIT;
	const excludes = options.excludes ?? [];
	const eligible = entries
		.filter(entry => !excludes.some(ref => refMatches(ref, entry.personId)))
		.sort((a, b) => a.personId.localeCompare(b.personId));
	const picked: string[] = [];
	for (const ref of options.pins ?? []) {
		const pinned = eligible.find(entry => refMatches(ref, entry.personId));
		if (pinned && !picked.includes(pinned.personId)) picked.push(pinned.personId);
	}
	const random = seededRandom(options.seed);
	const rest = eligible
		.filter(entry => !picked.includes(entry.personId))
		.map(entry => ({ personId: entry.personId, key: Math.pow(random(), 1 / Math.max(entry.weight, 0.001)) }))
		.sort((a, b) => b.key - a.key);
	for (const entry of rest) {
		if (picked.length >= limit) break;
		picked.push(entry.personId);
	}
	return picked.slice(0, limit);
}

export type FeaturedRotationDeps = {
	getPublishedPersonProfileIds(): Promise<Set<string> | null>;
	getPersonsByIds(ids: string[], options?: { includeOfficeHolders?: boolean }): Promise<PersonItem[]>;
	getRemovedPersonIds(): Promise<Set<string> | null>;
	resolveProductAvatars(personIds: Iterable<string | null | undefined>): Promise<Map<string, string>>;
	getCandidacies(params: { raceSlug: string }): Promise<CandidacyItem[]>;
};

const defaultDeps: FeaturedRotationDeps = {
	getPublishedPersonProfileIds,
	getPersonsByIds,
	getRemovedPersonIds,
	resolveProductAvatars,
	getCandidacies,
};

type PooledPerson = {
	person: PersonItem;
	name: string;
	avatarUrl: string;
	weight: number;
	candidacy: NonNullable<PersonItem['Candidacies']>[number] | null;
	office: PersonOfficeHolder | null;
};

function nonpartisan(...parties: Array<string | null | undefined>): boolean {
	return !isMajorParty(classifyPartyFrom(...orderPartyNames(parties)));
}

function stateLine(state: string | null | undefined): string | null {
	const code = (state ?? '').trim().toUpperCase();
	return isValidStateCode(code) ? getStateName(code) : null;
}

function daysUntil(dateStr: string, today: Date): number {
	return (new Date(dateStr).getTime() - today.getTime()) / 86_400_000;
}

/**
 * Who in the pool can be featured this week, and how likely each is to be
 * drawn: a product photo and an election within a few months each add one to
 * a base weight of one. The photo is the one the card would show, after the
 * takedown list; nobody is drawn only to appear without a picture.
 */
export function buildRotationPool(
	persons: PersonItem[],
	context: { today: Date; avatars: Map<string, string>; removedPersonIds: ReadonlySet<string> | null },
): PooledPerson[] {
	const pool: PooledPerson[] = [];
	for (const person of persons) {
		const id = person.id.toLowerCase();
		if (context.removedPersonIds?.has(id)) continue;
		const upcoming = (person.Candidacies ?? [])
			.filter(c => c.Race?.electionDate && !isElectionDateBeforeToday(c.Race.electionDate, context.today))
			.sort((a, b) => (a.Race?.electionDate ?? '').localeCompare(b.Race?.electionDate ?? ''));
		const candidacy = upcoming[0] ?? null;
		const office = person.OfficeHolders?.find(o => o.isCurrent === true) ?? null;
		if (!candidacy && !office) continue;
		if (!pledgedFromSpine(person, candidacy?.party)) continue;
		const name = formatPersonName(person.fullName) ?? formatPersonName([person.firstName, person.lastName].filter(Boolean).join(' '));
		if (!name) continue;
		const chosen = context.avatars.get(id) ?? null;
		const avatarUrl = cardAvatarUrl(person.id, chosen ?? person.headshotUrl ?? null, context.removedPersonIds);
		if (!avatarUrl) continue;
		const electionDate = candidacy?.Race?.electionDate ?? null;
		const soon = electionDate ? daysUntil(electionDate, context.today) <= SOON_ELECTION_DAYS : false;
		pool.push({ person, name, avatarUrl, weight: 1 + (chosen ? 1 : 0) + (soon ? 1 : 0), candidacy, office });
	}
	return pool;
}

async function mapConcurrently<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
	const results: R[] = new Array<R>(items.length);
	let next = 0;
	const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
		while (next < items.length) {
			const index = next++;
			results[index] = await fn(items[index] as T);
		}
	});
	await Promise.all(workers);
	return results;
}

export async function getWeeklyFeaturedPeople(
	options: { today?: Date; pins?: Array<string | null | undefined>; excludes?: Array<string | null | undefined>; limit?: number } = {},
	deps: FeaturedRotationDeps = defaultDeps,
): Promise<FeaturedPeople> {
	const empty: FeaturedPeople = { candidates: [], representatives: [], candidatesComplete: false };
	const today = options.today ?? new Date();
	const pins = (options.pins ?? []).map(parsePersonRef).filter((ref): ref is PersonRef => ref !== null);
	const excludes = (options.excludes ?? []).map(parsePersonRef).filter((ref): ref is PersonRef => ref !== null);

	const published = await deps.getPublishedPersonProfileIds();
	// A pin given as a full id is fetched even when its profile is not published.
	const ids = [...new Set([...(published ?? []), ...pins.flatMap(ref => (ref.id ? [ref.id] : []))])];
	if (ids.length === 0) return empty;

	const [persons, removedPersonIds] = await Promise.all([deps.getPersonsByIds(ids, { includeOfficeHolders: true }), deps.getRemovedPersonIds()]);
	const avatars = await deps.resolveProductAvatars(persons.map(person => person.id));
	const pool = buildRotationPool(persons, { today, avatars, removedPersonIds });
	if (pool.length === 0) return empty;

	const chosenIds = pickWeeklyPeople(
		pool.map(entry => ({ personId: entry.person.id.toLowerCase(), weight: entry.weight })),
		{ seed: weekKey(today), pins, excludes, limit: options.limit },
	);
	const byId = new Map(pool.map(entry => [entry.person.id.toLowerCase(), entry]));
	const chosen = chosenIds.map(id => byId.get(id)).filter((entry): entry is PooledPerson => entry !== undefined);

	// The person feed's candidacy carries no place, so the chosen candidates'
	// races are read for the "City, ST" line and the feed photo, a handful of
	// requests at most.
	const placeByPerson = new Map<string, { placeName?: string; state?: string }>();
	await mapConcurrently(
		chosen.filter(entry => entry.candidacy?.Race?.slug),
		CONCURRENT_CANDIDACY_REQUESTS,
		async entry => {
			const rows = await deps.getCandidacies({ raceSlug: entry.candidacy?.Race?.slug ?? '' });
			const own = rows.find(row => row.personId?.toLowerCase() === entry.person.id.toLowerCase());
			if (own) placeByPerson.set(entry.person.id.toLowerCase(), { placeName: own.placeName, state: own.state });
		},
	);

	const candidates: FeaturedPersonCard[] = [];
	const representatives: FeaturedPersonCard[] = [];
	for (const entry of chosen) {
		const { person, name, avatarUrl, candidacy, office } = entry;
		const href = `/people/${buildPersonSlugFromBase(person.slug || slugifyName(name), person.id)}`;
		if (candidacy) {
			const place = placeByPerson.get(person.id.toLowerCase());
			candidates.push({
				personId: person.id,
				name,
				office: candidacy.positionName ?? null,
				location: place?.placeName && place.state ? placeWithState(place.placeName, place.state) : stateLine(candidacy.state ?? person.state),
				href,
				avatarUrl,
				isPledged: true,
				isNonpartisan: nonpartisan(candidacy.party),
				role: 'candidate',
				electionDate: candidacy.Race?.electionDate ?? null,
				raceSlug: candidacy.Race?.slug?.toLowerCase() ?? null,
			});
		} else if (office) {
			representatives.push({
				personId: person.id,
				name,
				office: office.officeTitle ?? office.Position?.name ?? office.positionName ?? null,
				location:
					office.mailingCity && office.mailingState ? `${office.mailingCity}, ${office.mailingState}` : stateLine(office.state ?? person.state),
				href,
				avatarUrl,
				isPledged: true,
				isNonpartisan: nonpartisan(...(office.partyNames ?? [])),
				role: 'representative',
				electionDate: null,
				raceSlug: null,
			});
		}
	}
	return { candidates, representatives, candidatesComplete: false };
}
