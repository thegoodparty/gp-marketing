import {
	getPersonByPersonId,
	getPublicPersonProfileStatus,
} from '~/lib/electionsApi';
import type {
	PersonAccomplishment,
	PersonItem,
	PersonOfficeHolder,
	PublicPersonProfile,
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

/** Builds the canonical `first-last-<personId>` slug for a person. */
export function buildPersonSlug(name: string, personId: string): string {
	const base = slugifyName(name);
	return base ? `${base}-${personId}` : personId;
}

export interface PersonProfileLink {
	label: string;
	href: string;
	icon: string;
	kind:
		| 'website'
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
	transparency: string | null;
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

export interface PersonProfileView {
	personId: string;
	canonicalSlug: string;
	/** True once an owner has claimed + published; false = programmatic SEO page. */
	claimed: boolean;
	persona: PersonPersona;
	displayName: string;
	/** Hero line under the name, e.g. "Candidate for Mayor" or "City Council". */
	roleTitle: string | null;
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
	districtLabel: string | null;
	stateLabel: string | null;
	issues: PersonProfileIssueView[];
	links: PersonProfileLink[];
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

function resolvePersona(person: PersonItem | null, office: PersonOfficeHolder | null): PersonPersona {
	const hasCandidacy = (person?.Candidacies?.length ?? 0) > 0;
	const isCurrentlyInOffice = office?.isCurrent === true;
	const heldOfficeBefore = (person?.OfficeHolders?.length ?? 0) > 0;

	if (hasCandidacy && isCurrentlyInOffice) return 'both';
	if (isCurrentlyInOffice) return 'officeholder';
	if (hasCandidacy) return 'candidate';
	if (heldOfficeBefore) return 'past';
	// A claimed person with no civics rows yet reads best as a candidate.
	return 'candidate';
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
	const start = formatYear(office.startAt);
	const end = formatYear(office.endAt);
	if (start && end) return `${start} – ${end}`;
	if (start) return `Since ${start}`;
	if (end) return `Through ${end}`;
	return null;
}

function candidateOfficeName(person: PersonItem | null): string | null {
	const candidacy = person?.Candidacies?.[0];
	return candidacy?.positionName ?? null;
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
	const email = overlay?.publicEmail ?? office?.officeEmail ?? null;
	const phone = overlay?.publicPhone ?? office?.officePhone ?? null;
	const instagram = overlay?.instagramUrl ?? null;
	const tiktok = overlay?.tiktokUrl ?? null;
	const facebook = overlay?.facebookUrl ?? person?.facebookUrl ?? null;
	const twitter = overlay?.twitterUrl ?? person?.twitterUrl ?? null;
	const linkedin = overlay?.linkedinUrl ?? person?.linkedinUrl ?? null;

	if (website) links.push({ kind: 'website', label: 'Website', icon: 'globe', href: website });
	if (email) links.push({ kind: 'email', label: 'Email', icon: 'mail', href: `mailto:${email}` });
	if (phone) links.push({ kind: 'phone', label: 'Phone', icon: 'phone', href: `tel:${phone}` });
	if (instagram) links.push({ kind: 'instagram', label: 'Instagram', icon: 'instagram', href: instagram });
	if (tiktok) links.push({ kind: 'tiktok', label: 'TikTok', icon: 'music', href: tiktok });
	if (facebook) links.push({ kind: 'facebook', label: 'Facebook', icon: 'facebook', href: facebook });
	if (twitter) links.push({ kind: 'twitter', label: 'X', icon: 'twitter', href: twitter });
	if (linkedin) links.push({ kind: 'linkedin', label: 'LinkedIn', icon: 'linkedin', href: linkedin });
	return links;
}

export function composeView(
	personId: string,
	person: PersonItem | null,
	overlay: PublicPersonProfile | null,
): PersonProfileView {
	const claimed = overlay !== null;
	const composedName = [person?.firstName, person?.lastName].filter(Boolean).join(' ');
	const nameFromPerson = person?.fullName ?? (composedName || null);
	const displayName = overlay?.displayName ?? nameFromPerson ?? 'Public Official';
	const office = pickCurrentOffice(person);
	const persona = resolvePersona(person, office);
	const roleTitle = resolveRoleTitle(persona, person, office, overlay?.roleTitleOverride ?? null);
	const party = office?.partyNames?.[0] ?? person?.Candidacies?.[0]?.party ?? null;
	const districtLabel = office?.subAreaValue ?? office?.subAreaName ?? null;
	const stateLabel = office?.state ?? person?.state ?? null;

	return {
		personId,
		canonicalSlug: buildPersonSlug(nameFromPerson ?? displayName, personId),
		claimed,
		persona,
		displayName,
		roleTitle,
		officeName: office?.positionName ?? office?.officeTitle ?? null,
		party,
		avatarUrl: overlay?.avatarUrl ?? person?.headshotUrl ?? null,
		coverImageUrl: overlay?.coverImageUrl ?? null,
		initials: initialsOf(displayName),
		bio: overlay?.bioOverride ?? person?.bioText ?? null,
		whyRunning: overlay?.whyRunning ?? null,
		accomplishments: overlay?.accomplishments ?? [],
		currentOffice: office,
		termLabel: formatTerm(office),
		districtLabel,
		stateLabel,
		issues: (overlay?.issues ?? [])
			.filter(
				(issue): issue is typeof issue & { title: string } =>
					issue.visible && Boolean(issue.title),
			)
			.map((issue) => ({
				id: issue.issueId,
				title: issue.title,
				description: issue.description,
				transparency: issue.transparency,
			})),
		links: buildLinks(overlay, person, office),
		updatedAt: overlay?.updatedAt ?? new Date(0).toISOString(),
	};
}

/**
 * Loads and composes a public person profile.
 *
 * The page exists whenever election-api has a Person row (programmatic SEO),
 * OR an owner has a live published overlay. It is suppressed (returns null →
 * 404) only when neither is true, or when the owner has deleted their profile
 * (gp-api answers 410). `view.claimed` tells the page whether to render the
 * enriched, owner-authored experience or the unclaimed spine + claim CTAs.
 */
export async function loadPersonProfile(personId: string): Promise<PersonProfileView | null> {
	const [overlay, person] = await Promise.all([
		getPublicPersonProfileStatus(personId),
		getPersonByPersonId(personId),
	]);

	// The owner asked for their public page to be removed: respect that even if
	// the civics spine still exists.
	if (overlay.status === 'gone') return null;

	if (overlay.status === 'live') {
		return composeView(personId, person, overlay.profile);
	}

	// Unclaimed: only render if the data team has a canonical Person for them.
	if (!person) return null;
	return composeView(personId, person, null);
}
