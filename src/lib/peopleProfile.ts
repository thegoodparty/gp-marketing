import {
	COUNTY_MTFCC,
	getCandidacies,
	getCandidateBySlug,
	getCityPlacesByCounty,
	getOfficeHoldersByGeoId,
	getPersonByPersonId,
	getPersonsByIds,
	getPlacesByState,
	getPublicPersonProfileStatus,
	getVoterDensityForDistrict,
} from '~/lib/electionsApi';
import { US_STATES_TUPLES } from '~/constants/usStates';
import {
	buildElectionPositionHrefFromRaceSlug,
	getStateName,
} from '~/lib/electionsHelpers';
import { classifyPartyFrom, isMajorParty, type PartyClass } from '~/lib/party';
import { formatPersonName } from '~/lib/personName';
import type { CandidacyItem } from '~/types/elections';
import type {
	PersonAccomplishment,
	PersonCandidacySummary,
	PersonItem,
	PersonOfficeHolder,
	PersonProfileIssueStatus,
	PublicPersonProfile,
	VoterDensity,
} from '~/types/people';

const PERSON_ID_RE = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

/** Extracts the canonical personId (trailing UUID) from a /people slug. */
export function extractPersonId(slug: string): string | null {
	const match = PERSON_ID_RE.exec(slug);
	return match?.[1]?.toLowerCase() ?? null;
}

function slugifyName(name: string): string {
	return name
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * First 8 hex chars of the personId — the stable, collision-safe slug suffix.
 * The election-api resolves /people/<base>-<id8> by an indexed range scan on the
 * id PK, so this suffix (not the non-unique base slug) is the real lookup key.
 */
export function personIdSuffix(personId: string): string {
	return personId.replace(/-/g, '').slice(0, 8).toLowerCase();
}

/**
 * Builds the public `<base>-<id8>` slug from an already-slugified base.
 *
 * Idempotent, because the two kinds of base this is called with disagree about
 * whether the suffix is already there: a name-derived base (`slugifyName`) never
 * carries it, while the election-api mart's `Person.slug` already ends in it.
 * Appending unconditionally produced `jane-doe-11111111-11111111` for every
 * person sourced from the spine — pages still resolved (the resolver reads the
 * *trailing* 8 hex either way), but the canonical URL, the og:url, the sitemap
 * entries and every inter-profile link carried the doubled suffix, and the clean
 * URL cost a redirect hop to reach it.
 */
export function buildPersonSlugFromBase(base: string, personId: string): string {
	const suffix = personIdSuffix(personId);
	if (!base || base === suffix) return suffix;
	return base.endsWith(`-${suffix}`) ? base : `${base}-${suffix}`;
}

/** Builds the public `first-last-<id8>` slug for a person from a display name. */
export function buildPersonSlug(name: string, personId: string): string {
	return buildPersonSlugFromBase(slugifyName(name), personId);
}

export interface PersonProfileLink {
	label: string;
	href: string;
	icon: string;
	kind:
		| 'website'
		| 'government'
		| 'email'
		| 'phone'
		| 'instagram'
		| 'tiktok'
		| 'facebook'
		| 'twitter'
		| 'linkedin';
}

export interface PersonProfileIssueView {
	id: string;
	title: string;
	description: string | null;
	status: PersonProfileIssueStatus | null;
	transparency: string | null;
}

/** A prior office term rendered in the "Recent Experience" section. */
export interface ExperienceItem {
	title: string;
	organization: string | null;
	term: string | null;
	/** Status pill per the Figma rows, e.g. "Incumbent" / "Candidate". null = no pill. */
	status: string | null;
	/** Optional link to the office/position page ("View position →"). null = no link. */
	href: string | null;
}

/** A card in the "Other Candidates" / "Nearby Officials" interlink sections. */
export interface RelatedPersonCard {
	personId: string | null;
	name: string;
	subtitle: string | null;
	href: string | null;
	isEmpowered: boolean;
	avatarUrl: string | null;
}

export interface ProfileBreadcrumb {
	href?: string;
	label: string;
}

/** An entry in the "Explore Elections" index (interlink to elections routes). */
export interface ElectionIndexEntry {
	name: string;
	href: string;
	level: 'state' | 'county' | 'city' | 'town' | 'district';
}

export interface ElectionsIndex {
	stateSlug: string;
	stateName: string;
	entries: ElectionIndexEntry[];
	/**
	 * Geographic tier of the listed entries — scales with the profile's own
	 * office level (state profile → states, county → counties, city → cities).
	 * Drives the pre-footer band's "Select your {state|county|city}…" copy.
	 */
	entryLevel: 'state' | 'county' | 'city';
}

/**
 * How the person relates to office right now. Drives which sections render and
 * the tense/labels the page uses — mirroring the Figma states:
 *  - candidate    → running, not currently in office
 *  - officeholder → currently serving, not running
 *  - both         → currently serving AND running (simultaneous)
 *  - past         → held office previously, not current and not running
 */
export type PersonPersona = 'candidate' | 'officeholder' | 'both' | 'past';

/**
 * The 12 approved Figma page states. Two axes layer over the 4 personas:
 *  - claimed (A–C, G): owner-authored, empowered, pledge-gated
 *  - unclaimed non-partisan (D–F, H): programmatic SEO w/ empowerment + claim CTA
 *  - unclaimed major-party (I/J): bare civics spine, no empowerment/pledge/claim
 *  - removal requested (K/L): minimal civics spine, photo/authored content stripped
 */
export type ProfileState =
	| 'A'
	| 'B'
	| 'C'
	| 'D'
	| 'E'
	| 'F'
	| 'G'
	| 'H'
	| 'I'
	| 'J'
	| 'K'
	| 'L';

export interface PersonProfileView {
	personId: string;
	canonicalSlug: string;
	/** Resolved Figma state (A–L). */
	state: ProfileState;
	/** True once an owner has claimed + published; false = programmatic SEO page. */
	claimed: boolean;
	persona: PersonPersona;
	partyClass: PartyClass | null;
	/** True for Republican/Democrat — strips the empowerment framing (states I/J). */
	majorParty: boolean;
	/** True when the person requested removal (states K/L). */
	removed: boolean;
	/** True when the page uses the empowerment/pledge/claim framing. */
	empowered: boolean;
	/** True when the person has taken the GoodParty pledge (renders a badge). */
	pledged: boolean;
	displayName: string;
	/** Hero line under the name, e.g. "Candidate for Mayor" or "City Council". */
	roleTitle: string | null;
	/**
	 * Second hero line, only for someone serving and running at once (Figma
	 * state C): `roleTitle` names the seat held, this names the candidacy.
	 */
	secondaryRoleTitle: string | null;
	/** Bare office name for the sidebar "About Office" row. */
	officeName: string | null;
	party: string | null;
	avatarUrl: string | null;
	coverImageUrl: string | null;
	initials: string;
	bio: string | null;
	whyRunning: string | null;
	accomplishments: PersonAccomplishment[];
	currentOffice: PersonOfficeHolder | null;
	termLabel: string | null;
	electionDate: string | null;
	positionId: string | null;
	positionDescription: string | null;
	/** Canonical /elections position page href for the person's own office ("Learn more"). */
	positionHref: string | null;
	districtLabel: string | null;
	stateLabel: string | null;
	issues: PersonProfileIssueView[];
	links: PersonProfileLink[];
	recentExperience: ExperienceItem[];
	otherCandidates: RelatedPersonCard[];
	nearbyOfficials: RelatedPersonCard[];
	breadcrumb: ProfileBreadcrumb[];
	electionsIndex: ElectionsIndex | null;
	voterDensity: VoterDensity | null;
	/** Office mailing address lines for the sidebar "Office Mailing Address" row. */
	officeAddress: string[] | null;
	updatedAt: string;
}

function pickCurrentOffice(person: PersonItem | null): PersonOfficeHolder | null {
	const offices = person?.OfficeHolders ?? [];
	if (offices.length === 0) return null;
	const current = offices.find((o) => o.isCurrent);
	if (current) return current;
	// Fall back to the most recently started term.
	return [...offices].sort((a, b) => (b.startAt ?? '').localeCompare(a.startAt ?? ''))[0] ?? null;
}

/**
 * Whether the person is running in a race that has not been decided yet.
 *
 * Candidacy rows are permanent — election-api keeps every race a person ever
 * ran in — so the mere existence of one says nothing about whether they are
 * running *now*. Only a race whose election is still ahead of us counts.
 *
 * Undated rows count as current: a missing `Race.electionDate` means "we don't
 * know when", not "already happened", and treating absent data as concluded
 * would silently demote a real candidate out of the running personas.
 */
function isRunningNow(person: PersonItem | null): boolean {
	const { upcoming, undated } = candidaciesByRecency(person?.Candidacies ?? []);
	return upcoming.length > 0 || undated.length > 0;
}

export function resolvePersona(
	person: PersonItem | null,
	office: PersonOfficeHolder | null,
): PersonPersona {
	const runningNow = isRunningNow(person);
	const isCurrentlyInOffice = office?.isCurrent === true;
	const heldOfficeBefore = (person?.OfficeHolders?.length ?? 0) > 0;

	if (runningNow && isCurrentlyInOffice) return 'both';
	if (isCurrentlyInOffice) return 'officeholder';
	if (runningNow) return 'candidate';
	if (heldOfficeBefore) return 'past';
	// Nothing current to go on. Someone whose only row is a concluded race has
	// no officeholder term to say they won and no result field to say they
	// lost, so the candidate framing stays the least-wrong reading — as it does
	// for a claimed person with no civics rows at all.
	return 'candidate';
}

/**
 * Resolves the concrete Figma state (A–L) from persona + the claim / partisan /
 * removal axes. Precedence (highest first): removal (unclaimed only) > partisan
 * (unclaimed only) > claimed persona > unclaimed persona.
 *
 * Two edge mappings, defaulted and flagged per the plan:
 *  - partisan/removal "both" collapses to the candidate variant (I / K).
 *  - partisan/removal "past" uses the most-recent role (office → J / L).
 */
export function resolveProfileState(
	persona: PersonPersona,
	opts: { claimed: boolean; removed: boolean; partyClass: PartyClass | null },
): ProfileState {
	if (opts.claimed) {
		switch (persona) {
			case 'candidate':
				return 'A';
			case 'officeholder':
				return 'B';
			case 'both':
				return 'C';
			case 'past':
				return 'G';
		}
	}

	// Unclaimed. `runningVariant` is true for candidate-leaning personas.
	const runningVariant = persona === 'candidate' || persona === 'both';

	if (opts.removed) {
		return runningVariant ? 'K' : 'L';
	}

	if (isMajorParty(opts.partyClass)) {
		return runningVariant ? 'I' : 'J';
	}

	switch (persona) {
		case 'candidate':
			return 'D';
		case 'officeholder':
			return 'E';
		case 'both':
			return 'F';
		case 'past':
			return 'H';
	}
}

function initialsOf(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	const first = parts[0];
	if (!first) return '?';
	if (parts.length === 1) return first.slice(0, 2).toUpperCase();
	const last = parts[parts.length - 1] ?? first;
	return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase() || '?';
}

function formatYear(date: string | null): string | null {
	if (!date) return null;
	const year = date.slice(0, 4);
	return /^\d{4}$/.test(year) ? year : null;
}

function formatTerm(office: PersonOfficeHolder | null): string | null {
	if (!office) return null;
	// Term is shown only when the spine gives us real dates. electionFrequency was
	// unreliable/unpopulated so it's intentionally unused; "In office since 20xx"
	// was likewise dropped as data-limitation guesswork.
	const start = formatYear(office.startAt);
	const end = formatYear(office.endAt);
	if (start && end) return `${start} – ${end}`;
	if (end) return `Through ${end}`;
	return null;
}

/**
 * Buckets candidacies by how current they are: the soonest upcoming election
 * first, then the most recent past one, then rows we can't date. The API does
 * not guarantee an order, so anything that reads "the" candidacy off the array
 * must go through this or it risks naming a race the person already ran.
 */
function candidaciesByRecency(candidacies: PersonCandidacySummary[]): {
	upcoming: PersonCandidacySummary[];
	past: PersonCandidacySummary[];
	undated: PersonCandidacySummary[];
} {
	const now = Date.now();
	const dated: { candidacy: PersonCandidacySummary; time: number }[] = [];
	const undated: PersonCandidacySummary[] = [];
	for (const candidacy of candidacies) {
		const parsed = candidacy.Race?.electionDate ? Date.parse(candidacy.Race.electionDate) : NaN;
		if (Number.isNaN(parsed)) undated.push(candidacy);
		else dated.push({ candidacy, time: parsed });
	}
	return {
		upcoming: dated.filter(x => x.time >= now).sort((a, b) => a.time - b.time).map(x => x.candidacy),
		past: dated.filter(x => x.time < now).sort((a, b) => b.time - a.time).map(x => x.candidacy),
		undated,
	};
}

/**
 * The race a person is currently running in, else the last one they ran in.
 *
 * Prefers a candidacy with a slug, because the rest of the page — position
 * link, breadcrumb crumb, "About [position]", other candidates — is built from
 * {@link selectPrimaryCandidacy}, which can only use slugged rows. Without that
 * preference the hero could name one race while everything under it named
 * another. Slug-less rows are still a fallback rather than being filtered out:
 * they carry the office name and party, and dropping them would blank the hero
 * and, via `classifyPartyFrom`, change which profile state the page renders.
 */
function primaryCandidacy(person: PersonItem | null): PersonCandidacySummary | null {
	const all = person?.Candidacies ?? [];
	const first = (candidacies: PersonCandidacySummary[]) => {
		const { upcoming, past, undated } = candidaciesByRecency(candidacies);
		return upcoming[0] ?? past[0] ?? undated[0] ?? null;
	};
	return first(all.filter(c => c.slug)) ?? first(all);
}

function candidateOfficeName(person: PersonItem | null): string | null {
	return primaryCandidacy(person)?.positionName ?? null;
}

function resolveRoleTitle(
	persona: PersonPersona,
	person: PersonItem | null,
	office: PersonOfficeHolder | null,
	overrideTitle: string | null,
): string | null {
	if (overrideTitle) return overrideTitle;
	const officeTitle = office?.officeTitle ?? office?.positionName ?? null;
	switch (persona) {
		case 'candidate': {
			const target = candidateOfficeName(person);
			return target ? `Candidate for ${target}` : 'Candidate';
		}
		case 'both':
		case 'officeholder':
			return officeTitle;
		case 'past':
			return officeTitle ? `Former ${officeTitle}` : null;
	}
}

function buildLinks(
	overlay: PublicPersonProfile | null,
	person: PersonItem | null,
	office: PersonOfficeHolder | null,
): PersonProfileLink[] {
	const links: PersonProfileLink[] = [];
	const website = overlay?.websiteUrl ?? person?.websiteUrl ?? office?.websiteUrl ?? null;
	// Official .gov site is a distinct link from the personal/campaign website.
	const governmentWebsite = overlay?.governmentWebsiteUrl ?? null;
	const email = overlay?.publicEmail ?? office?.officeEmail ?? null;
	// Owner's public line wins; their office-line override precedes the spine's.
	const phone = overlay?.publicPhone ?? overlay?.officePhone ?? office?.officePhone ?? null;
	const instagram = overlay?.instagramUrl ?? null;
	const tiktok = overlay?.tiktokUrl ?? null;
	const facebook = overlay?.facebookUrl ?? person?.facebookUrl ?? null;
	const twitter = overlay?.twitterUrl ?? person?.twitterUrl ?? null;
	const linkedin = overlay?.linkedinUrl ?? person?.linkedinUrl ?? null;

	if (website) links.push({ kind: 'website', label: 'Website', icon: 'globe', href: website });
	if (governmentWebsite)
		links.push({ kind: 'government', label: 'Official Site', icon: 'landmark', href: governmentWebsite });
	if (email) links.push({ kind: 'email', label: 'Email', icon: 'mail', href: `mailto:${email}` });
	if (phone) links.push({ kind: 'phone', label: 'Phone', icon: 'phone', href: `tel:${phone}` });
	if (instagram) links.push({ kind: 'instagram', label: 'Instagram', icon: 'instagram', href: instagram });
	if (tiktok) links.push({ kind: 'tiktok', label: 'TikTok', icon: 'music', href: tiktok });
	if (facebook) links.push({ kind: 'facebook', label: 'Facebook', icon: 'facebook', href: facebook });
	if (twitter) links.push({ kind: 'twitter', label: 'X', icon: 'twitter', href: twitter });
	if (linkedin) links.push({ kind: 'linkedin', label: 'LinkedIn', icon: 'linkedin', href: linkedin });
	return links;
}

/**
 * Spine-derived "Recent Experience" for unclaimed/major-party/removed pages
 * (the Figma frames list a person's public record here). Offices carry their
 * term (startAt/endAt); candidacies carry their race's election year. Both are
 * interleaved and sorted most-recent-first so a current run leads an old office
 * term (and vice versa). Entries without a date sort last.
 * Claimed profiles override this with the owner-authored list (see composeView).
 */
function buildRecentExperience(person: PersonItem | null): ExperienceItem[] {
	const offices = (person?.OfficeHolders ?? []).map((o) => ({
		sortKey: o.startAt ?? '',
		item: {
			title: o.officeTitle ?? o.positionName ?? 'Public office',
			organization: [o.subAreaValue ?? o.subAreaName, o.state].filter(Boolean).join(', ') || null,
			term: formatTerm(o),
			// Current terms read as "Incumbent"; past terms let the year range speak.
			status: o.isCurrent === true ? 'Incumbent' : null,
			href: null,
		},
	}));

	const candidacies = (person?.Candidacies ?? [])
		.filter((c) => c.positionName)
		.map((c) => {
			const electionDate = c.Race?.electionDate ?? null;
			return {
				sortKey: electionDate ?? '',
				item: {
					title: `Candidate for ${c.positionName}`,
					organization: c.state ?? null,
					term: formatYear(electionDate),
					status: 'Candidate',
					href: c.slug ? `/candidate/${c.slug}` : null,
				},
			};
		});

	return [...candidacies, ...offices]
		.sort((a, b) => b.sortKey.localeCompare(a.sortKey))
		.map((e) => e.item)
		.slice(0, 5);
}

/** Authored overlay experience → the view's ExperienceItem shape (drops `source`). */
function authoredExperience(overlay: PublicPersonProfile | null): ExperienceItem[] | null {
	const rows = overlay?.recentExperience;
	if (!rows || rows.length === 0) return null;
	return rows.map((e) => ({
		title: e.title,
		organization: e.organization ?? null,
		term: e.term ?? null,
		status: null,
		href: null,
	}));
}

const PARTY_LABELS: Record<PartyClass, string> = {
	republican: 'Republican',
	democrat: 'Democrat',
	independent: 'Independent',
	other: 'Other',
};

function nameOf(first?: string | null, last?: string | null, fallback = ''): string {
	return formatPersonName([first, last].filter(Boolean).join(' ')) ?? fallback;
}

/** Maps candidacies sharing a position into "Other Candidates" cards, excluding the subject. */
export function buildOtherCandidateCards(
	candidacies: CandidacyItem[],
	excludePersonId: string,
): RelatedPersonCard[] {
	const cards: RelatedPersonCard[] = [];
	const seen = new Set<string>();
	for (const c of candidacies) {
		if (c.personId && c.personId.toLowerCase() === excludePersonId.toLowerCase()) continue;
		const name = nameOf(c.firstName, c.lastName, 'Candidate');
		const dedupeKey = (c.personId ?? c.slug ?? name).toLowerCase();
		if (seen.has(dedupeKey)) continue;
		seen.add(dedupeKey);
		const href = c.personId
			? `/people/${buildPersonSlug(name, c.personId)}`
			: c.slug
				? `/candidate/${c.slug}`
				: null;
		cards.push({
			personId: c.personId ?? null,
			name,
			subtitle: c.party ?? null,
			href,
			isEmpowered: false,
			avatarUrl: c.image ?? null,
		});
		if (cards.length >= 6) break;
	}
	return cards;
}

/** Maps officeholders sharing a geo id into "Nearby Officials" cards, excluding the subject. */
export function buildNearbyOfficialCards(
	officeholders: PersonOfficeHolder[],
	personsById: Map<string, PersonItem>,
	excludePersonId: string,
): RelatedPersonCard[] {
	const cards: RelatedPersonCard[] = [];
	const seen = new Set<string>();
	for (const oh of officeholders) {
		const pid = oh.personId ?? null;
		if (pid && pid.toLowerCase() === excludePersonId.toLowerCase()) continue;
		const person = pid ? personsById.get(pid.toLowerCase()) : undefined;
		// The office-title fallback needs the same casing pass: it comes from the
		// same spine and arrives all-lowercase ("city council member") on the rows
		// that have no linked person. `formatPersonName` is reused rather than
		// duplicated because the guard is what matters here — only an entirely
		// lowercase value is touched — not the person-specific prefix rules.
		const name =
			formatPersonName(person?.fullName) ??
			nameOf(person?.firstName, person?.lastName, formatPersonName(oh.officeTitle) ?? '');
		if (!name) continue;
		// Dedupe by personId when present, else by name — otherwise null-id rows
		// with the same office title yield duplicate cards (and colliding React
		// keys downstream, where the key falls back to the name).
		const dedupeKey = pid?.toLowerCase() ?? name.toLowerCase();
		if (seen.has(dedupeKey)) continue;
		seen.add(dedupeKey);
		// Prefer the person's mint base slug so the link is already canonical
		// (/people/<base>-<id8>) and skips the redirect hop.
		const href = pid
			? `/people/${buildPersonSlugFromBase(person?.slug ?? slugifyName(name), pid)}`
			: null;
		cards.push({
			personId: pid,
			name,
			subtitle: oh.officeTitle ?? oh.Position?.name ?? oh.positionName ?? null,
			href,
			isEmpowered: false,
			avatarUrl: person?.headshotUrl ?? null,
		});
		if (cards.length >= 6) break;
	}
	return cards;
}

function humanizeSlugSegment(segment: string): string {
	return segment
		.replace(/-/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Builds the location + position breadcrumb hierarchy
 * (`Elections > State > County > City > Position > Name`).
 *
 * The trail always starts at `Elections` (no leading `Home` crumb) so it matches
 * the profile frames and so the JSON-LD `BreadcrumbList` leads with Elections.
 * The intermediate location crumbs are derived from the resolved elections
 * position path (`/elections/<state>/<county?>/<city?>/position/<slug>`) so they
 * match the canonical elections routes exactly. When no race slug is available
 * (e.g. an office holder with no linked race), the trail degrades to
 * `Elections > State? > Name`.
 */
export function buildBreadcrumbTrail(params: {
	displayName: string;
	stateCode: string | null;
	raceSlug: string | null;
	positionLevel: string | null;
	positionName: string | null;
}): ProfileBreadcrumb[] {
	const { displayName, stateCode, raceSlug, positionLevel, positionName } = params;
	const trail: ProfileBreadcrumb[] = [{ href: '/elections', label: 'Elections' }];

	if (!raceSlug) {
		if (stateCode) {
			trail.push({ href: `/elections/${stateCode.toLowerCase()}`, label: getStateName(stateCode) });
		}
		trail.push({ label: displayName });
		return trail;
	}

	const positionHref = buildElectionPositionHrefFromRaceSlug({
		slug: raceSlug,
		positionLevel: positionLevel ?? undefined,
	});

	if (positionHref) {
		// /elections/<state>/<county?>/<city?>/position/<slug>
		const segments = positionHref.split('/').filter(Boolean); // ['elections', state, ...]
		const positionIdx = segments.indexOf('position');
		const locationSegments =
			positionIdx > 1 ? segments.slice(1, positionIdx) : segments.slice(1);
		let cumulative = '/elections';
		locationSegments.forEach((segment, i) => {
			cumulative += `/${segment}`;
			const label = i === 0 ? getStateName(segment) : humanizeSlugSegment(segment);
			trail.push({ href: cumulative, label });
		});
		if (positionName) {
			trail.push({ href: positionHref, label: positionName });
		}
	} else if (stateCode) {
		trail.push({ href: `/elections/${stateCode.toLowerCase()}`, label: getStateName(stateCode) });
		if (positionName) trail.push({ label: positionName });
	}

	trail.push({ label: displayName });
	return trail;
}

export interface ComposeExtras {
	removed?: boolean;
	positionId?: string | null;
	electionDate?: string | null;
	positionDescription?: string | null;
	positionHref?: string | null;
	recentExperience?: ExperienceItem[];
	otherCandidates?: RelatedPersonCard[];
	nearbyOfficials?: RelatedPersonCard[];
	breadcrumb?: ProfileBreadcrumb[];
	electionsIndex?: ElectionsIndex | null;
	voterDensity?: VoterDensity | null;
	/** Office mailing address lines (sidebar). Absent in prod until data exists. */
	officeAddress?: string[] | null;
	/** Authoritative state resolved by the loader (office → person → candidacy). */
	stateCode?: string | null;
}

/**
 * Composes the render view from the civics spine (election-api Person +
 * Candidacy/OfficeHolder) and the gp-api overlay.
 *
 * Data-source precedence (SEO notes §5), resolved here:
 * - Why I'm Running / Campaign Issues: overlay (Win) wins over the BR spine.
 *   `whyRunning`/`issues` read from the overlay; issues are overlay-authored.
 * - Top Priorities / Accomplishments: Serve-sourced overlay fields
 *   (`accomplishments`, issue `status`/`transparency`) win; no spine fallback.
 * - Position Description: BR-only, taken from the spine
 *   (`extras.positionDescription`), never overridden by the overlay.
 * - Display name / role title / bio / photo / links: overlay override, then
 *   spine fallback (see `displayName`, `roleTitle`, `bio`, `avatarUrl`, links).
 * - Pledge: single-source — the ETL-maintained spine flag `person.isPledged`
 *   (rolled up from gp-api/HubSpot); there is no overlay override for it.
 * Removal (K/L) strips all overlay/authored content and the pledge framing.
 */
export function composeView(
	personId: string,
	person: PersonItem | null,
	overlay: PublicPersonProfile | null,
	extras: ComposeExtras = {},
): PersonProfileView {
	const removed = extras.removed ?? false;
	const claimed = overlay !== null && !removed;
	const composedName = [person?.firstName, person?.lastName].filter(Boolean).join(' ');
	// Casing is applied to the spine name only. The overlay's displayName is
	// owner-authored, where an all-lowercase value is a deliberate style choice
	// (bell hooks) rather than the unformatted-data signature it is upstream.
	const nameFromPerson = formatPersonName(person?.fullName ?? (composedName || null));
	const displayName = overlay?.displayName ?? nameFromPerson ?? 'Public Official';
	const office = pickCurrentOffice(person);
	const persona = resolvePersona(person, office);
	// Label and class must share one source precedence, or a "both" persona whose
	// office and candidacy parties differ would show one party while being gated
	// (majorParty → I/J empowerment) by the other. Office-first for both.
	// Read the party off the CURRENT race, not whichever candidacy the API
	// happens to return first: someone who ran as a Democrat in 2020 and is now
	// running as an Independent would otherwise be gated as major-party (I/J)
	// and lose the empowerment framing they qualify for.
	const primaryCand = primaryCandidacy(person);
	const rawParty = office?.partyNames?.[0] ?? primaryCand?.party ?? null;
	const partyClass = classifyPartyFrom(office?.partyNames?.[0], primaryCand?.party);
	const majorParty = isMajorParty(partyClass);
	const state = resolveProfileState(persona, { claimed, removed, partyClass });
	// Empowerment framing applies to claimed pages and unclaimed non-partisan
	// pages; it is stripped for major-party (I/J) and removal (K/L) states.
	const empowered = claimed || (!removed && !majorParty);
	const roleTitle = resolveRoleTitle(persona, person, office, overlay?.roleTitleOverride ?? null);
	// Someone serving AND running shows both offices in the hero (Figma C):
	// `roleTitle` carries the seat held, this carries the candidacy beneath it.
	const candidacyTarget = primaryCand?.positionName ?? null;
	const secondaryRoleTitle =
		persona === 'both' && candidacyTarget ? `Candidate for ${candidacyTarget}` : null;
	const party = rawParty ?? (partyClass ? PARTY_LABELS[partyClass] : null);
	const districtLabel = office?.subAreaValue ?? office?.subAreaName ?? null;
	// Mirror the loader's stateCode (which includes the candidacy fallback) so a
	// candidate-only person's sidebar label matches their breadcrumb.
	const stateLabel = extras.stateCode ?? office?.state ?? person?.state ?? null;

	// Removal strips photo + authored content; keep only the civics spine.
	const avatarUrl = removed ? null : (overlay?.avatarUrl ?? person?.headshotUrl ?? null);
	const bio = removed ? null : (overlay?.bioOverride ?? person?.bioText ?? null);

	return {
		personId,
		// Public URL is /people/<base>-<id8>, where the 8-hex id suffix is what makes
		// a non-unique `first-last` base resolve to exactly one person. The mart's
		// `Person.slug` already ends in that suffix, so it passes through unchanged;
		// the name-derived fallback (for the overlay-only edge case, where there is
		// no spine row) gets the suffix appended.
		canonicalSlug: buildPersonSlugFromBase(
			person?.slug ?? slugifyName(nameFromPerson ?? displayName),
			personId,
		),
		state,
		claimed,
		persona,
		partyClass,
		majorParty,
		removed,
		empowered,
		// Pledge is a factual spine flag; suppress it on removed (K/L) pages along
		// with the rest of the authored/empowerment framing.
		pledged: !removed && (person?.isPledged ?? false),
		displayName,
		roleTitle,
		secondaryRoleTitle,
		// Candidate-only people have no held office; fall back to the candidacy's
		// position so section headings ("About …", "Other Candidates for …") still
		// name the seat they're running for, matching the Figma candidate frames.
		officeName: office?.positionName ?? office?.officeTitle ?? candidacyTarget,
		party,
		avatarUrl,
		coverImageUrl: removed ? null : (overlay?.coverImageUrl ?? null),
		initials: initialsOf(displayName),
		bio,
		whyRunning: removed ? null : (overlay?.whyRunning ?? null),
		accomplishments: removed ? [] : (overlay?.accomplishments ?? []),
		currentOffice: office,
		termLabel: formatTerm(office),
		electionDate: extras.electionDate ?? null,
		positionId: extras.positionId ?? office?.positionId ?? null,
		positionDescription: extras.positionDescription ?? null,
		positionHref: extras.positionHref ?? null,
		districtLabel,
		stateLabel,
		issues: removed
			? []
			: (overlay?.issues ?? [])
					.filter(
						(issue): issue is typeof issue & { title: string } =>
							issue.visible && Boolean(issue.title),
					)
					.map((issue) => ({
						id: issue.issueId,
						title: issue.title,
						description: issue.description,
						status: issue.status,
						transparency: issue.transparency,
					})),
		links: removed ? [] : buildLinks(overlay, person, office),
		// Owner-authored experience wins on a claimed page; removal strips it back
		// to the public-record spine. Unclaimed pages get the spine list too.
		recentExperience:
			extras.recentExperience ??
			(removed ? buildRecentExperience(person) : (authoredExperience(overlay) ?? buildRecentExperience(person))),
		otherCandidates: extras.otherCandidates ?? [],
		nearbyOfficials: extras.nearbyOfficials ?? [],
		breadcrumb: extras.breadcrumb ?? [{ href: '/elections', label: 'Elections' }, { label: displayName }],
		electionsIndex: extras.electionsIndex ?? null,
		voterDensity: extras.voterDensity ?? null,
		officeAddress: removed ? null : (extras.officeAddress ?? null),
		updatedAt: overlay?.updatedAt ?? new Date(0).toISOString(),
	};
}

/**
 * Selects which of a person's candidacies drives the profile's office context
 * (breadcrumb position crumb, "Other Candidates", position href), by precedence:
 *   1. CURRENT candidate — the soonest UPCOMING election wins, even when the
 *      person also holds office ("both"): the office they're running for leads.
 *   2. Elected officeholder who is NOT currently running — defer to the elected
 *      office (return null) so the crumb reflects the seat they hold.
 *   3. Archived (no current run, no current office) — the most recent PAST run
 *      by election date wins.
 * Candidacies without a slug are skipped (the detail fetch keys off the slug).
 */
function selectPrimaryCandidacy(
	person: PersonItem | null,
	hasCurrentOffice: boolean,
): PersonCandidacySummary | null {
	const { upcoming, past, undated } = candidaciesByRecency(
		(person?.Candidacies ?? []).filter((c) => c.slug),
	);
	// (1) Current candidate: earliest upcoming election.
	if (upcoming[0]) return upcoming[0];
	// (2) Elected officeholder not currently running: defer to the office.
	if (hasCurrentOffice) return null;
	// (3) Archived: most recent past run wins; undated rows fall back to first.
	return past[0] ?? undated[0] ?? null;
}

/** Resolves the primary candidacy detail (with race) used to enrich the page. */
async function loadPrimaryCandidacy(
	person: PersonItem | null,
	hasCurrentOffice: boolean,
): Promise<CandidacyItem | null> {
	const slug = selectPrimaryCandidacy(person, hasCurrentOffice)?.slug;
	if (!slug) return null;
	return getCandidateBySlug({ slug, includeStances: false, includeRace: true });
}

/** Fetches "Other Candidates for [Position]" cards for a resolved position. */
async function loadOtherCandidates(
	positionId: string | null,
	excludePersonId: string,
): Promise<RelatedPersonCard[]> {
	if (!positionId) return [];
	const candidacies = await getCandidacies({ positionId });
	return buildOtherCandidateCards(candidacies, excludePersonId);
}

/** Fetches "Nearby Officials" cards for a resolved geo id. */
async function loadNearbyOfficials(
	geoId: string | null,
	excludePersonId: string,
): Promise<RelatedPersonCard[]> {
	if (!geoId) return [];
	const officeholders = await getOfficeHoldersByGeoId(geoId);
	const ids = officeholders
		.map((o) => o.personId)
		.filter((id): id is string => Boolean(id) && id!.toLowerCase() !== excludePersonId.toLowerCase());
	const persons = await getPersonsByIds(ids);
	const byId = new Map(persons.map((p) => [p.id.toLowerCase(), p]));
	return buildNearbyOfficialCards(officeholders, byId, excludePersonId);
}

/**
 * Resolves the pre-footer "Explore Elections" index tier from the profile's
 * office geography. City/local offices list sibling cities in their county,
 * county offices list sibling counties in their state, and everything else
 * (state/federal/unknown) lists all states.
 *
 * The county slug is recovered from the resolved position href
 * (`/elections/<state>/<county>/<city?>/position/<slug>`) since the persons
 * spine does not carry a clean county reference for city-level offices.
 */
function deriveElectionsIndexTier(
	positionHref: string | null,
	positionLevel: string | null,
): { tier: 'state' | 'county' | 'city'; countySlug: string | null } {
	if (positionHref) {
		const segments = positionHref.split('/').filter(Boolean); // ['elections', state, ...]
		const positionIdx = segments.indexOf('position');
		const locationSegments =
			positionIdx > 1 ? segments.slice(1, positionIdx) : segments.slice(1);
		// [state] | [state, county] | [state, county, city(, subplace)]
		if (locationSegments.length >= 3) {
			return { tier: 'city', countySlug: `${locationSegments[0]}/${locationSegments[1]}` };
		}
		if (locationSegments.length === 2) return { tier: 'county', countySlug: null };
		return { tier: 'state', countySlug: null };
	}
	const level = (positionLevel ?? '').toUpperCase();
	if (/CITY|LOCAL|TOWN|MUNICIPAL|VILLAGE|BOROUGH/.test(level)) return { tier: 'county', countySlug: null };
	if (/COUNTY|REGIONAL/.test(level)) return { tier: 'county', countySlug: null };
	return { tier: 'state', countySlug: null };
}

/** Lists all US states as an "Explore Elections" index (state-level profiles). */
function statesElectionsIndex(stateCode: string | null): ElectionsIndex {
	const entries: ElectionIndexEntry[] = US_STATES_TUPLES.map(([code, name]) => ({
		name,
		href: `/elections/${code.toLowerCase()}`,
		level: 'state' as const,
	}));
	return {
		stateSlug: stateCode?.toLowerCase() ?? '',
		stateName: stateCode ? getStateName(stateCode) : 'United States',
		entryLevel: 'state',
		entries,
	};
}

/**
 * Builds the pre-footer "Explore Elections" index, scaled to the profile's
 * office level: state → all states, county → counties in the state, city →
 * sibling cities in the office's county.
 */
async function loadElectionsIndex(params: {
	stateCode: string | null;
	tier: 'state' | 'county' | 'city';
	countySlug: string | null;
}): Promise<ElectionsIndex | null> {
	const { stateCode, tier, countySlug } = params;

	if (tier === 'city' && countySlug) {
		const state = countySlug.split('/')[0]?.toUpperCase() ?? stateCode?.toUpperCase() ?? '';
		const cities = await getCityPlacesByCounty({ state, countySlug });
		const entries: ElectionIndexEntry[] = cities
			.filter((c) => c.slug && c.name)
			.map((c) => ({
				name: c.name,
				href: `/elections/${countySlug}/${c.slug.split('/').pop() ?? ''}`,
				level: 'city' as const,
			}));
		if (entries.length > 0) {
			return {
				stateSlug: countySlug,
				stateName: stateCode ? getStateName(stateCode) : '',
				entryLevel: 'city',
				entries,
			};
		}
		// Fall through to the state list if the county has no listable cities.
		return statesElectionsIndex(stateCode);
	}

	if (tier === 'county' && stateCode) {
		const counties = await getPlacesByState({ state: stateCode, mtfcc: COUNTY_MTFCC });
		const entries: ElectionIndexEntry[] = counties
			.filter((c) => c.slug && c.name)
			.map((c) => ({ name: c.name, href: `/elections/${c.slug}`, level: 'county' as const }));
		if (entries.length > 0) {
			return {
				stateSlug: stateCode.toLowerCase(),
				stateName: getStateName(stateCode),
				entryLevel: 'county',
				entries,
			};
		}
	}

	// State-level profiles (and any tier that produced no entries) list states.
	return statesElectionsIndex(stateCode);
}

/**
 * Loads and composes a public person profile across all 12 states.
 *
 * The page exists whenever election-api has a Person row (programmatic SEO), OR
 * an owner has a live published overlay, OR a removal was requested (K/L). It is
 * suppressed (returns null → 404) only when none of those hold, or when the
 * owner deleted their profile (gp-api answers 410 → `gone`). The resolved
 * `view.state` drives which template + sections render.
 */
export async function loadPersonProfile(personId: string): Promise<PersonProfileView | null> {
	const [overlayResult, person, voterDensity] = await Promise.all([
		getPublicPersonProfileStatus(personId),
		getPersonByPersonId(personId),
		getVoterDensityForDistrict(personId),
	]);

	// Owner deleted their profile: suppress entirely (distinct from removal K/L).
	if (overlayResult.status === 'gone') return null;

	const removed = overlayResult.status === 'removed';
	const overlay = overlayResult.status === 'live' ? overlayResult.profile : null;

	// Unclaimed and no removal: only render if the data team has a canonical
	// Person. (Removal keeps the crawlable spine even without a live overlay.)
	if (!overlay && !removed && !person) return null;

	const office = pickCurrentOffice(person);
	const candidacy = await loadPrimaryCandidacy(person, office?.isCurrent === true);

	const raceSlug = candidacy?.Race?.slug ?? null;
	const positionLevel = candidacy?.Race?.positionLevel ?? office?.Position?.level ?? null;
	const positionId =
		candidacy?.Race?.positionId ?? candidacy?.positionId ?? office?.positionId ?? null;
	const geoId = office?.geoId ?? null;
	const positionName =
		candidacy?.positionName ?? office?.positionName ?? office?.officeTitle ?? null;
	const electionDate = candidacy?.Race?.electionDate ?? null;
	const positionDescription =
		candidacy?.Race?.positionDescription ??
		candidacy?.positionDescription ??
		office?.Position?.description ??
		null;
	// Canonical /elections position href for the person's OWN office ("Learn more").
	// Only resolvable from a candidacy's race slug today, so this is populated for
	// candidate/"both" personas; pure office-holders get null until election-api
	// threads the office race slug (tracked follow-up).
	const positionHref =
		buildElectionPositionHrefFromRaceSlug({
			slug: raceSlug ?? undefined,
			positionLevel: positionLevel ?? undefined,
		}) ?? null;
	const stateCode = office?.state ?? person?.state ?? candidacy?.state ?? null;

	const composedName = [person?.firstName, person?.lastName].filter(Boolean).join(' ');
	const displayName =
		overlay?.displayName ?? formatPersonName(person?.fullName ?? composedName) ?? 'Public Official';

	// The interlink sections are independent; fetch in parallel. Each degrades to
	// empty on any miss so the core profile always renders.
	const { tier, countySlug } = deriveElectionsIndexTier(positionHref, positionLevel);
	const breadcrumb = buildBreadcrumbTrail({ displayName, stateCode, raceSlug, positionLevel, positionName });
	const [otherCandidates, nearbyOfficials, electionsIndex] = await Promise.all([
		loadOtherCandidates(positionId, personId),
		loadNearbyOfficials(geoId, personId),
		loadElectionsIndex({ stateCode, tier, countySlug }),
	]);

	return composeView(personId, person, overlay, {
		removed,
		positionId,
		electionDate,
		positionDescription,
		positionHref,
		otherCandidates,
		nearbyOfficials,
		breadcrumb,
		electionsIndex,
		voterDensity,
		stateCode,
	});
}
