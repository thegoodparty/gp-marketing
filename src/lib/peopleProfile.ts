import {
	COUNTY_MTFCC,
	getCandidacies,
	getCandidateBySlug,
	getCityPlacesByCounty,
	getCitySlugToCountySlugMap,
	getCountySlugsByState,
	getOfficeHoldersByGeoId,
	getPersonByPersonId,
	getPersonsByIds,
	getPlacesByState,
	getPublicPersonProfileStatus,
	getRemovedPersonIds,
	getVoterDensityForDistrict,
	looksLikeDistrictSlug,
	resolveCountySlugForCitySlug,
} from '~/lib/electionsApi';
import { US_STATES_TUPLES } from '~/constants/usStates';
import { normalizeStateCode } from '~/constants/usStateCodes';
import {
	buildElectionPositionHrefFromRaceSlug,
	getStateName,
} from '~/lib/electionsHelpers';
import { classifyParty, classifyPartyFrom, isMajorParty, orderPartyNames, type PartyClass } from '~/lib/party';
import { formatPersonName } from '~/lib/personName';
import { buildPersonSlug, buildPersonSlugFromBase, slugifyName } from '~/lib/personSlug';
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
	/**
	 * The same ETL-maintained spine flag the hero reads (`Person.isPledged`), so
	 * a card and the profile it links to read one source. Gated on party
	 * eligibility by {@link pledgedFromSpine}, which is stricter than the hero
	 * because a card sees less of the person than their own profile does.
	 */
	isPledged: boolean;
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
	/**
	 * True when the person cannot have taken the pledge at all: a major-party
	 * affiliate, or one the CRM marks "Partisan Candidate". Checked BEFORE
	 * {@link pledged}, so a bad `Pledge Status` cannot publish a pledge we know
	 * to be impossible. Wider than {@link majorParty}, which still gates the
	 * page's state letter and empowerment framing on party alone.
	 */
	pledgeIneligible: boolean;
	/** True when the person requested removal (states K/L). */
	removed: boolean;
	/**
	 * True when someone owns a profile here that is not live. Orthogonal to the
	 * Figma state letter — the page keeps its normal unclaimed layout and spine
	 * content — but every "claim this profile" affordance is suppressed, because
	 * the person it would address has already claimed it.
	 */
	unpublished: boolean;
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
	/** Display label: {@link partyNames} joined with commas, major party first. */
	party: string | null;
	/**
	 * The same parties unjoined, for consumers that must not treat the label as
	 * one party's name (structured data emits one PoliticalParty per entry).
	 */
	partyNames: string[];
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

/**
 * Whether a spine string carries an actual value.
 *
 * Shared with the sitemap builder so both halves of the indexing decision
 * normalize the civics feed the same way. The feed has three spellings for
 * "absent" — null, '' and whitespace — because the BallotReady S3 export writes
 * '' rather than null and the dbt mart only nullif()s some of the columns it
 * lands (see isThinProfile). Anything that tests one of these fields for
 * presence has to collapse all three or the two rules drift apart.
 */
export function hasText(value: string | null | undefined): boolean {
	return Boolean(value?.trim());
}

/**
 * Whether the profile carries anything that tells it apart from the rest of the
 * unclaimed corpus.
 *
 * A profile with no resolved office, no authored content, no photo and no links
 * renders a name and a state inside ~114KB of site chrome, and nothing else.
 * Sampling the URLs Google flagged put 200 of 200 in that shape and within 817
 * bytes of each other (0.7%), while profiles that do resolve an office spread
 * across 78% of their size — so the flagged pages are not merely similar, they
 * are the same document with the name swapped. That is what makes Google
 * cluster them and elect its own canonical; the canonical tag itself is correct
 * and self-referential, so nothing about it is worth changing.
 *
 * The test is deliberately generous — any single signal is enough to keep the
 * page indexable — and it is recomputed from the view on every render, so a
 * page returns to the index on its own once the data team backfills its office.
 * There is no list to maintain and nothing to re-index by hand.
 */
export function isThinProfile(view: PersonProfileView): boolean {
	// An owner who claimed and published asked for this page to exist; the
	// population is small enough that indexing it can never drive clustering.
	if (view.claimed) return false;
	// Every signal goes through `hasText`, and the alternatives are `||` rather
	// than `??`, because the upstream feed spells "absent" three ways. The dbt
	// mart wraps some BallotReady columns in nullif(x, '') and not others —
	// m_election_api__office_holder.sql does it for office_title but not for
	// position_name, and m_election_api__person.sql does it for neither bio_text
	// nor headshot_url — so '' arrives as a value. Under `??` that '' is the
	// answer: `officeName ?? positionId` returns '' and never consults the
	// positionId, so a profile with a resolved race would be suppressed.
	const hasOffice = hasText(view.officeName) || hasText(view.positionId);
	const hasAuthoredContent =
		hasText(view.bio) ||
		hasText(view.whyRunning) ||
		view.issues.length > 0 ||
		view.accomplishments.length > 0;
	const hasIdentity = hasText(view.avatarUrl) || view.links.length > 0;
	// Load-bearing beyond its own line: this is what makes the sitemap's
	// projection of this rule safe. buildRecentExperience emits a row for every
	// office term and every named candidacy — the same two feeds the sitemap
	// sweeps — so anything the sitemap counts as an office lands here even when
	// `hasOffice` above misses it (the sitemap sees every row; the view's
	// officeName is only the one `pickCurrentOffice`/`primaryCandidacy` chose).
	// Narrowing this to, say, current terms only would silently reopen the
	// "sitemap advertises a page that renders noindex" direction.
	const hasPublicRecord = view.recentExperience.length > 0;
	return !hasOffice && !hasAuthoredContent && !hasIdentity && !hasPublicRecord;
}

/**
 * Whether the page asks to be indexed.
 *
 * Two unrelated reasons to say no — a privacy removal (Figma K/L) keeps a
 * crawlable URL it should not advertise, and a contentless profile is a
 * near-duplicate of every other one — resolved into the single directive
 * `generateMetadata` emits. It lives here rather than inline at the call site so
 * the 12-state matrix asserts the expression that actually ships.
 */
export function isIndexableProfile(view: PersonProfileView): boolean {
	return !view.removed && !isThinProfile(view);
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
	// Instagram reads the spine like its four siblings below. It was the one
	// public link in election-api's `urls[]` block the spine fallback skipped, so
	// an unclaimed person whose only public link was an Instagram rendered no
	// link rail at all — and, since isThinProfile reads `links` as the identity
	// signal, was withheld from the index for having no content while we held a
	// URL that no other profile in the corpus shares.
	const instagram = overlay?.instagramUrl ?? person?.instagramUrl ?? null;
	// No spine fallback: TikTok is owner-authored only. BallotReady's urls[] has
	// no tiktok type, so there is no spine column to read.
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
/**
 * The city-slug prefix of a race slug that only resolves to a canonical
 * `/elections` URL once its county is known, or null when the slug needs no help.
 *
 * City and town races routinely carry county-less slugs (`nc/greensboro/mayor`,
 * or `nc/greensboro/ward-1/council` for a joint office). Handed to
 * `buildElectionPositionHrefFromRaceSlug` without a county lookup they fall
 * through to its generic segment-count branch and produce the pre-restructuring
 * URL `/elections/nc/greensboro/position/mayor`, which now 308s to
 * `/elections/nc/guilford-county/greensboro/position/mayor`. That is the redirect
 * every /people profile was emitting (~36,900 internal links across ~4,800
 * destinations in the 2026-09-14 crawl).
 *
 * A hit in the lookup is itself proof the segment is a city, so this asks about
 * slug shape only and lets the map decide. It used to pre-filter on two signals
 * that both turned out to be wrong, and the 2026-09-18 crawl measured what each
 * cost:
 *
 * - The position level (142 links). Only CITY and LOCAL were let through, but a
 *   judicial, county or district-attorney office is routinely seated in a city:
 *   `nv/las-vegas/justice-of-the-peace-judicial`,
 *   `ar/pocahontas/county-constable`.
 * - A county-shaped second segment (91 links). Where two cities in a state share
 *   a name the feed disambiguates the city's own slug with a county suffix, so
 *   `tx/reno-lamar-county` and `oh/oakwood-cuyahoga-county` are cities, not
 *   counties, and `looksLikeCountySlugSegment` cannot tell them apart.
 *
 * A genuine county race costs a lookup miss rather than a wrong URL: county
 * slugs are not city slugs, so they are never in the map. The miss does mean
 * county-level profiles now resolve the state's place lists where they used to
 * skip them, which is a hit on the same cached `/v1/places` responses the
 * profile's own "Explore Elections" band already reads.
 *
 * A district-shaped third segment is still excluded: that is a district inside a
 * city, which the resolver routes without a county.
 */
function cityPrefixNeedingCounty(slug: string | null | undefined): string | null {
	if (!slug) return null;

	const parts = slug.split('/').filter(Boolean);
	parts.pop();
	const [state, place, third] = parts;
	if (!state || !place) return null;
	if (parts.length === 2) return `${state}/${place}`;
	if (parts.length === 3 && third && !looksLikeDistrictSlug(third)) return `${state}/${place}`;
	return null;
}

/**
 * The `/elections` position page for a race slug, or null when none resolves —
 * the destination "View Position" promises and the breadcrumb's position crumb
 * already uses. Every hop is optional upstream (a term need not reach a race,
 * and a slug can be too short to place), so an unresolvable row renders as
 * plain text rather than a link that 404s.
 *
 * `citySlugToCountySlug` (see {@link cityPrefixNeedingCounty}) is what keeps a
 * city race off the redirecting, county-less URL. The level is forced to CITY on
 * a lookup hit because the resolver only consults the map for CITY/LOCAL races,
 * and a blank level would otherwise skip it.
 */
function positionHrefFor(
	slug: string | null | undefined,
	positionLevel: string | null | undefined,
	citySlugToCountySlug?: Map<string, string> | null,
): string | null {
	if (!slug) return null;
	const cityPrefix = citySlugToCountySlug ? cityPrefixNeedingCounty(slug) : null;
	const mapped = Boolean(cityPrefix && citySlugToCountySlug?.has(cityPrefix));
	return (
		buildElectionPositionHrefFromRaceSlug(
			{
				slug,
				positionLevel: mapped ? 'CITY' : (positionLevel ?? undefined),
			},
			citySlugToCountySlug ? { citySlugToCountySlug } : undefined,
		) ?? null
	);
}

function buildRecentExperience(
	person: PersonItem | null,
	positionLink: { candidacySlug: string | null; href: string } | null = null,
	citySlugToCountySlug?: Map<string, string> | null,
): ExperienceItem[] {
	const offices = (person?.OfficeHolders ?? []).map((o) => ({
		sortKey: o.startAt ?? '',
		item: {
			title: o.officeTitle ?? o.positionName ?? 'Public office',
			organization: [o.subAreaValue ?? o.subAreaName, o.state].filter(Boolean).join(', ') || null,
			term: formatTerm(o),
			// Current terms read as "Incumbent"; past terms let the year range speak.
			status: o.isCurrent === true ? 'Incumbent' : null,
			// The term's own race slug, flattened onto it by election-api. Prefer the
			// race's level, which is non-null where Position.level is nullable — the
			// level is what sends a city slug down the county-expanding branch of
			// resolveElectionPositionFromRaceSlug rather than the generic one.
			href: positionHrefFor(
				o.positionSlug,
				o.positionLevel ?? o.Position?.level,
				citySlugToCountySlug,
			),
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
					// "View Position" means the /elections position page the breadcrumb
					// already points at, not the candidate's own page. The row's own race
					// slug is the accurate source; `positionLink` only covers the one
					// candidacy the loader fetched in full, and stays as a fallback for
					// payloads predating omni#1425 (which added slug to the nested Race).
					href:
						positionHrefFor(c.Race?.slug, c.Race?.positionLevel, citySlugToCountySlug) ??
						(positionLink && c.slug && c.slug === positionLink.candidacySlug
							? positionLink.href
							: null),
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

// HubSpot "Confirmed Candidate" (`verified_candidates`) as it arrives on the
// person feed. These are the STORED values, which are not the labels the CRM
// shows an editor: "Yes" is displayed there as "Running".
const CONFIRMED_RUNNING = 'Yes';
const CONFIRMED_PARTISAN = 'Partisan Candidate';

/**
 * `Confirmed Candidate = Running` is required alongside `Pledge Status = Yes`
 * before we publish a pledge, so that one mistyped CRM field cannot assert one
 * on its own.
 *
 * An ABSENT value passes. The field is not on the person feed yet, and treating
 * "we were not told" as "not running" would silently clear the pledge line from
 * every profile on the site the moment this shipped.
 */
function confirmedRunning(confirmedCandidate: string | null | undefined): boolean {
	return confirmedCandidate == null ? true : confirmedCandidate === CONFIRMED_RUNNING;
}

/**
 * True only when the spine affirms the pledge AND the party evidence within
 * reach affirms eligibility. Party wins, as it does for the hero
 * (`pledgeAttribution`): a Republican or Democrat is ineligible rather than
 * unpledged, so a stale flag from a past run under another party must not make
 * a card claim otherwise.
 *
 * Deliberately STRICTER than the hero rather than merely different. The hero
 * resolves party office-first then current candidacy across the person's whole
 * record; a card has only the row it was built from, plus whatever the batched
 * person payload happens to carry. So an unknown party suppresses the line, and
 * a major-party signal anywhere in reach suppresses it, instead of the hero's
 * "most specific class wins". The failure we can afford is a pledged person
 * whose card stays quiet. The one we cannot is a card asserting a pledge that
 * the profile it links to calls impossible.
 *
 * Residual, and unclosable from here: if the batch payload carries no nested
 * offices or candidacies and the row's own party disagrees with the office the
 * hero would read, the two can still differ. Closing it needs the current
 * office party on the person feed, not more logic here.
 */
function pledgedFromSpine(person: PersonItem | undefined, ...rowParties: Array<string | null | undefined>): boolean {
	if (person?.isPledged !== true) return false;
	if (!confirmedRunning(person.confirmedCandidate)) return false;
	const evidence = [
		...rowParties,
		...(person.OfficeHolders ?? []).flatMap((o) => o.partyNames ?? []),
		...(person.Candidacies ?? []).map((c) => c.party),
	];
	const classes = evidence.map(classifyParty).filter((cls): cls is PartyClass => cls !== null);
	if (classes.length === 0) return false;
	return !classes.some(isMajorParty);
}

/**
 * A removed person's photo must not appear anywhere, including on somebody
 * else's page. The profile page nulls the subject's own photo at render, but the
 * candidacy and officeholder feeds carry their own copy of it for these cards,
 * so the card avatar has to be dropped here too.
 *
 * `removedPersonIds` of null means the feed could not be read: suppress every
 * card photo rather than risk republishing one (see getRemovedPersonIds).
 */
function cardAvatarUrl(
	personId: string | null,
	avatarUrl: string | null,
	removedPersonIds: ReadonlySet<string> | null,
): string | null {
	if (!removedPersonIds) return null;
	if (personId && removedPersonIds.has(personId.toLowerCase())) return null;
	return avatarUrl;
}

/**
 * Maps candidacies sharing a position into "Other Candidates" cards, excluding
 * the subject. `personsById` supplies the pledge flag, which the candidacy feed
 * does not carry — see {@link loadOtherCandidates}.
 */
export function buildOtherCandidateCards(
	candidacies: CandidacyItem[],
	personsById: Map<string, PersonItem>,
	excludePersonId: string,
	removedPersonIds: ReadonlySet<string> | null,
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
			isPledged: pledgedFromSpine(c.personId ? personsById.get(c.personId.toLowerCase()) : undefined, c.party),
			avatarUrl: cardAvatarUrl(c.personId ?? null, c.image ?? null, removedPersonIds),
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
	removedPersonIds: ReadonlySet<string> | null,
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
			isPledged: pledgedFromSpine(person, ...(oh.partyNames ?? [])),
			avatarUrl: cardAvatarUrl(pid, person?.headshotUrl ?? null, removedPersonIds),
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
 *
 * Because every crumb is a slice of that one path, `citySlugToCountySlug` is what
 * decides whether a city profile's trail links the live
 * `…/guilford-county/greensboro` pages or the county-less ones that redirect (see
 * {@link cityPrefixNeedingCounty}). Omitting it keeps the previous shape, which
 * is what lets the dev fixtures and the pure unit tests pass a ready-made 4-part
 * slug and need no lookup.
 */
/**
 * Whether a location segment of an `/elections` path really names a place, given
 * the slot it sits in.
 *
 * The position route's place slots are filled positionally, and a joint office
 * spends one segment per combined role, so the segments after the state are not
 * all places: `ga/state-insurance-commissioner/fire-safety-commissioner-joint`
 * puts an office name in the county slot, and "Choctaw/Nicoma Park Schools"
 * slugifies into two. Linking those produced 346 breadcrumb 404s in the
 * 2026-09-18 crawl, and a further set of redirects where the segment happened to
 * name something real at the wrong depth — `ok/choctaw` is a city, so in the
 * county slot it sent the "Explore Elections" band to the wrong county's towns.
 * Hence the check is per slot, not "is this string a place anywhere".
 *
 * Slot 3 is never a place: every subplace-depth `/elections` URL in the sitemap
 * is a joint office, so nothing below the city is linkable.
 *
 * Without the lookups (dev fixtures, pure unit tests) every segment passes,
 * which keeps the previous shape. This is the /people counterpart of
 * `isRealPlaceSegment`, which does the same job on the elections position pages
 * from the place those pages have already resolved.
 */
function isRealPlaceSlot(params: {
	slot: number;
	state: string;
	segment: string;
	citySlugToCountySlug?: Map<string, string> | null;
	countySlugs?: Set<string> | null;
}): boolean {
	const { slot, state, segment, citySlugToCountySlug, countySlugs } = params;
	if (!countySlugs || !citySlugToCountySlug) return true;
	// Counties only in slot 1, deliberately: a city there means the expansion did
	// not happen, and that county-less URL is itself the redirect being chased.
	if (slot === 1) return countySlugs.has(`${state}/${segment}`);
	if (slot === 2) return citySlugToCountySlug.has(`${state}/${segment}`);
	return false;
}

export function buildBreadcrumbTrail(params: {
	displayName: string;
	stateCode: string | null;
	raceSlug: string | null;
	positionLevel: string | null;
	positionName: string | null;
	citySlugToCountySlug?: Map<string, string> | null;
	countySlugs?: Set<string> | null;
}): ProfileBreadcrumb[] {
	const { displayName, stateCode, raceSlug, positionLevel, positionName, citySlugToCountySlug, countySlugs } =
		params;
	const trail: ProfileBreadcrumb[] = [{ href: '/elections', label: 'Elections' }];

	if (!raceSlug) {
		if (stateCode) {
			trail.push({ href: `/elections/${stateCode.toLowerCase()}`, label: getStateName(stateCode) });
		}
		trail.push({ label: displayName });
		return trail;
	}

	const positionHref = positionHrefFor(raceSlug, positionLevel, citySlugToCountySlug);

	if (positionHref) {
		// /elections/<state>/<county?>/<city?>/position/<slug>
		const segments = positionHref.split('/').filter(Boolean); // ['elections', state, ...]
		const positionIdx = segments.indexOf('position');
		const locationSegments =
			positionIdx > 1 ? segments.slice(1, positionIdx) : segments.slice(1);
		const state = locationSegments[0] ?? '';
		let cumulative = '/elections';
		// A crumb's href is its ancestors' path, so one unreal segment invalidates
		// everything below it as well: stop rather than skip.
		for (const [i, segment] of locationSegments.entries()) {
			if (i > 0 && !isRealPlaceSlot({ slot: i, state, segment, citySlugToCountySlug, countySlugs })) break;
			cumulative += `/${segment}`;
			const label = i === 0 ? getStateName(segment) : humanizeSlugSegment(segment);
			trail.push({ href: cumulative, label });
		}
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
	unpublished?: boolean;
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
	/**
	 * City slug → county slug, so the spine-built "Recent Experience" rows link
	 * the canonical 4-level `/elections` pages instead of the county-less URLs
	 * that redirect. The loader passes the lookup it already built for the
	 * breadcrumb and the position href; see {@link cityPrefixNeedingCounty}.
	 */
	citySlugToCountySlug?: Map<string, string> | null;
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
	// Deliberately not folded into `claimed` or the state letter: an unpublished
	// page is still the unclaimed spine layout, so it keeps the person's public
	// record. Only the claim affordances differ.
	const unpublished = extras.unpublished ?? false;
	const claimed = overlay !== null && !removed;
	const composedName = [person?.firstName, person?.lastName].filter(Boolean).join(' ');
	// Casing is applied to the spine name only. The overlay's displayName is
	// owner-authored, where an all-lowercase value is a deliberate style choice
	// (bell hooks) rather than the unformatted-data signature it is upstream.
	const nameFromPerson = formatPersonName(person?.fullName ?? (composedName || null));
	const displayName = overlay?.displayName ?? nameFromPerson ?? 'Public Official';
	const office = pickCurrentOffice(person);
	const persona = resolvePersona(person, office);
	// Read the party off the CURRENT race, not whichever candidacy the API
	// happens to return first: someone who ran as a Democrat in 2020 and is now
	// running as an Independent would otherwise be gated as major-party (I/J)
	// and lose the empowerment framing they qualify for.
	const primaryCand = primaryCandidacy(person);
	// The label keeps the office-first precedence: a held office describes the
	// person now, where a candidacy may be the seat they are only running for.
	const partyNames = orderPartyNames(office?.partyNames?.length ? office.partyNames : [primaryCand?.party]);
	const rawParty = partyNames.length > 0 ? partyNames.join(', ') : null;
	// Class and label deliberately DIVERGE, where they used to share a source.
	// Eligibility reads every line of the current office and candidacy, so a
	// major-party nomination disqualifies wherever it sits in the list, even when
	// the label leads with a minor line. Still scoped to the current office and
	// race, so the 2020-Democrat-now-Independent case above is untouched.
	const partyClass = classifyPartyFrom(...orderPartyNames([...(office?.partyNames ?? []), primaryCand?.party]));
	const majorParty = isMajorParty(partyClass);
	const pledgeIneligible = majorParty || person?.confirmedCandidate === CONFIRMED_PARTISAN;
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
	// candidate-only person's sidebar label matches their breadcrumb. Normalized
	// for the same reason the loader normalizes: this is a code by contract (it
	// fills schema.org `addressRegion`) and the feed does not always send one.
	const stateLabel =
		extras.stateCode ?? normalizeStateCode(office?.state ?? person?.state) ?? null;
	// `positionHref` was resolved from whichever candidacy selectPrimaryCandidacy
	// picked, so Recent Experience has to key off that same candidacy — matching
	// on anything looser would hang the breadcrumb's position link on a different
	// race than the one it describes.
	const positionLink = extras.positionHref
		? {
				candidacySlug: selectPrimaryCandidacy(person, office?.isCurrent === true)?.slug ?? null,
				href: extras.positionHref,
			}
		: null;

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
		unpublished,
		empowered,
		// Pledge is a factual spine flag; suppress it on removed (K/L) pages along
		// with the rest of the authored/empowerment framing. Eligibility is read
		// BEFORE the flag: a CRM `Pledge Status = Yes` on someone the same CRM
		// calls partisan is a data error, not a pledge (Mamdani, Cuomo).
		pledged:
			!removed &&
			!pledgeIneligible &&
			confirmedRunning(person?.confirmedCandidate) &&
			(person?.isPledged ?? false),
		pledgeIneligible,
		displayName,
		roleTitle,
		secondaryRoleTitle,
		// Candidate-only people have no held office; fall back to the candidacy's
		// position so section headings ("About …", "Other Candidates for …") still
		// name the seat they're running for, matching the Figma candidate frames.
		officeName: office?.positionName ?? office?.officeTitle ?? candidacyTarget,
		// Falls back to the class label so this never disagrees with `party`, which
		// uses the same fallback when the spine names no party at all.
		partyNames: partyNames.length > 0 ? partyNames : party ? [party] : [],
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
			(removed
				? buildRecentExperience(person, positionLink, extras.citySlugToCountySlug)
				: (authoredExperience(overlay) ??
					buildRecentExperience(person, positionLink, extras.citySlugToCountySlug))),
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

/**
 * Fetches "Other Candidates for [Position]" cards for a resolved position.
 *
 * The candidacy feed carries no pledge flag, so the persons are resolved in a
 * second batched call — the same shape {@link loadNearbyOfficials} already uses,
 * and preferred over a candidacy-level flag because it reads the very
 * `Person.isPledged` the hero reads, so a card cannot contradict the profile it
 * links to. `getPersonsByIds` dedupes, caps at 500 and is cached, and returns
 * without a request when the position has no linked people.
 */
async function loadOtherCandidates(
	positionId: string | null,
	excludePersonId: string,
	removedPersonIds: ReadonlySet<string> | null,
): Promise<RelatedPersonCard[]> {
	if (!positionId) return [];
	const candidacies = await getCandidacies({ positionId });
	const ids = candidacies
		.map((c) => c.personId)
		.filter((id): id is string => Boolean(id) && id!.toLowerCase() !== excludePersonId.toLowerCase());
	const persons = await getPersonsByIds(ids);
	const byId = new Map(persons.map((p) => [p.id.toLowerCase(), p]));
	return buildOtherCandidateCards(candidacies, byId, excludePersonId, removedPersonIds);
}

/** Fetches "Nearby Officials" cards for a resolved geo id. */
async function loadNearbyOfficials(
	geoId: string | null,
	excludePersonId: string,
	removedPersonIds: ReadonlySet<string> | null,
): Promise<RelatedPersonCard[]> {
	if (!geoId) return [];
	const officeholders = await getOfficeHoldersByGeoId(geoId);
	const ids = officeholders
		.map((o) => o.personId)
		.filter((id): id is string => Boolean(id) && id!.toLowerCase() !== excludePersonId.toLowerCase());
	const persons = await getPersonsByIds(ids);
	const byId = new Map(persons.map((p) => [p.id.toLowerCase(), p]));
	return buildNearbyOfficialCards(officeholders, byId, excludePersonId, removedPersonIds);
}

/**
 * What one profile needs to know about its state's geography to link `/elections`:
 * the city → county expansion, and the county slugs that say which URL segments
 * name a real county.
 */
export type CityCountyLookup = {
	citySlugToCountySlug: Map<string, string>;
	countySlugs: Set<string>;
};

/** Every race slug this profile can link, in one list. */
function profileRaceSlugs(person: PersonItem | null, raceSlug: string | null): string[] {
	return [
		raceSlug,
		...(person?.OfficeHolders ?? []).map((o) => o.positionSlug),
		...(person?.Candidacies ?? []).map((c) => c.Race?.slug),
	].filter((slug): slug is string => Boolean(slug));
}

/**
 * Whether a race slug's `/elections` URL carries a place segment below the state.
 *
 * Those are the segments the breadcrumb has to vouch for, so their presence is
 * what makes the lookup worth loading even when nothing needs expanding — a
 * joint office spends a URL segment per combined role
 * (`ga/state-insurance-commissioner/fire-safety-commissioner-joint`), and
 * without the county set to check it against, the trail links that office name
 * as if it were a place.
 */
function hasPlaceSegmentBelowState(slug: string): boolean {
	return slug.split('/').filter(Boolean).length >= 3;
}

/**
 * The city → county lookup every `/elections` link on this profile is built
 * from, plus the state's county slugs, or null when the profile's races carry no
 * place segment below the state for either to bear on.
 *
 * A profile links at most a handful of races — the primary candidacy plus the
 * "Recent Experience" rows — and almost always all in one state, so the lookup
 * is fetched per state rather than per race: a `/v1/races` detail fetch for each
 * row just to learn its county would cost more than the state's place lists,
 * which are cached and which the page's own "Explore Elections" band already
 * reads.
 *
 * Two fallbacks sit behind the state sweep, for the 107 links the 2026-09-18
 * crawl found still county-less because the bulk map simply did not contain the
 * city. `walkCountiesWhenEmpty` covers Connecticut, whose statewide municipal
 * queries return nothing at all. The per-place pass covers the scattered
 * singles the sweep misses in states that otherwise map fine (Coeur d'Alene ID,
 * Princes Lakes IN, D'Iberville MS, Reiles Acres ND, Suffolk VA); it runs only
 * for the prefixes still unresolved, which is nothing on a healthy profile.
 */
async function loadCityCountyLookup(
	person: PersonItem | null,
	raceSlug: string | null,
): Promise<CityCountyLookup | null> {
	const slugs = profileRaceSlugs(person, raceSlug);
	if (!slugs.some(hasPlaceSegmentBelowState)) return null;

	const prefixes = [...new Set(slugs.map(cityPrefixNeedingCounty).filter((p): p is string => Boolean(p)))];
	const states = [
		...new Set(slugs.map((slug) => slug.split('/')[0]).filter((s): s is string => Boolean(s))),
	];
	const [maps, countySlugSets] = await Promise.all([
		Promise.all(states.map(async (state) => getCitySlugToCountySlugMap(state, { walkCountiesWhenEmpty: true }))),
		Promise.all(states.map(async (state) => getCountySlugsByState(state))),
	]);
	const countySlugs = new Set(countySlugSets.flatMap((set) => [...set]));
	// Keys carry their state, so merging states cannot collide.
	const citySlugToCountySlug = new Map(maps.flatMap((map) => [...map]));

	const unresolved = prefixes.filter(
		(prefix) => !citySlugToCountySlug.has(prefix) && !countySlugs.has(prefix),
	);
	const resolved = await Promise.all(
		unresolved.map(async (prefix) => [prefix, await resolveCountySlugForCitySlug(prefix)] as const),
	);
	for (const [prefix, countySlug] of resolved) {
		if (countySlug) citySlugToCountySlug.set(prefix, countySlug);
	}

	return { citySlugToCountySlug, countySlugs };
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
export function deriveElectionsIndexTier(
	positionHref: string | null,
	positionLevel: string | null,
	countySlugs?: Set<string> | null,
): { tier: 'state' | 'county' | 'city'; countySlug: string | null } {
	if (positionHref) {
		const segments = positionHref.split('/').filter(Boolean); // ['elections', state, ...]
		const positionIdx = segments.indexOf('position');
		const locationSegments =
			positionIdx > 1 ? segments.slice(1, positionIdx) : segments.slice(1);
		// [state] | [state, county] | [state, county, city(, subplace)]
		if (locationSegments.length >= 3) {
			const countySlug = `${locationSegments[0]}/${locationSegments[1]}`;
			// The county slot can hold an office name (a joint office) or a
			// same-named city, and the band would then list a different county's
			// towns as this person's neighbours. Fall through to the state list
			// rather than answer confidently and wrongly.
			if (countySlugs && !countySlugs.has(countySlug)) return { tier: 'state', countySlug: null };
			return { tier: 'city', countySlug };
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
	const unpublished = overlayResult.status === 'unpublished';
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
	// Every /elections link this page emits — the position href below, the
	// breadcrumb's location and position crumbs, and the "View Position" link on
	// each Recent Experience row — is built from a race slug, and a city race's
	// slug omits its county. One lookup, resolved here, so all of them land on the
	// canonical 4-level URL instead of the pre-restructuring one that redirects.
	const cityCountyLookup = await loadCityCountyLookup(person, raceSlug);
	const citySlugToCountySlug = cityCountyLookup?.citySlugToCountySlug ?? null;
	const countySlugs = cityCountyLookup?.countySlugs ?? null;
	// Canonical /elections position href for the person's OWN office ("Learn more").
	// Only resolvable from a candidacy's race slug today, so this is populated for
	// candidate/"both" personas; pure office-holders get null until election-api
	// threads the office race slug (tracked follow-up).
	const positionHref = positionHrefFor(raceSlug, positionLevel, citySlugToCountySlug);
	// A code by contract — it builds `/elections/<code>` in the breadcrumb — but
	// the mart sends `Minnesota` for rows it created from a gp-api account
	// rather than from BallotReady, which lowercased to a 404 crumb.
	const stateCode = normalizeStateCode(office?.state ?? person?.state ?? candidacy?.state);

	const composedName = [person?.firstName, person?.lastName].filter(Boolean).join(' ');
	const displayName =
		overlay?.displayName ?? formatPersonName(person?.fullName ?? composedName) ?? 'Public Official';

	// The interlink sections are independent; fetch in parallel. Each degrades to
	// empty on any miss so the core profile always renders.
	const { tier, countySlug } = deriveElectionsIndexTier(positionHref, positionLevel, countySlugs);
	const breadcrumb = buildBreadcrumbTrail({
		displayName,
		stateCode,
		raceSlug,
		positionLevel,
		positionName,
		citySlugToCountySlug,
		countySlugs,
	});
	// The removal set gates both card loaders, so it has to resolve first. The
	// elections index needs nothing, so start it now and only join at the end —
	// awaiting it up front would make the card loaders wait on the slower of the
	// two. Safe to leave in flight: getRemovedPersonIds never rejects.
	const electionsIndexPromise = loadElectionsIndex({ stateCode, tier, countySlug });
	const removedPersonIds = await getRemovedPersonIds();
	const [otherCandidates, nearbyOfficials, electionsIndex] = await Promise.all([
		loadOtherCandidates(positionId, personId, removedPersonIds),
		loadNearbyOfficials(geoId, personId, removedPersonIds),
		electionsIndexPromise,
	]);

	return composeView(personId, person, overlay, {
		removed,
		unpublished,
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
		citySlugToCountySlug,
	});
}
