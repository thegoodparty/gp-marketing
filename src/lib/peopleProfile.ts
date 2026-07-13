import {
	getPersonByPersonId,
	getPublicPersonProfile,
	getVoterDensityForDistrict,
} from '~/lib/electionsApi';
import type {
	PersonAccomplishment,
	PersonItem,
	PersonOfficeHolder,
	PublicPersonProfile,
	VoterDensity,
} from '~/types/people';

const PERSON_ID_RE = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

/** Extracts the canonical personId (trailing UUID) from a /people slug. */
export function extractPersonId(slug: string): string | null {
	const match = slug.match(PERSON_ID_RE);
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
}

export interface PersonProfileView {
	personId: string;
	canonicalSlug: string;
	displayName: string;
	roleTitle: string | null;
	party: string | null;
	/** The office holder chose to publish a profile, so treat them as verified. */
	isVerified: boolean;
	avatarUrl: string | null;
	coverImageUrl: string | null;
	initials: string;
	bio: string | null;
	whyRunning: string | null;
	accomplishments: PersonAccomplishment[];
	currentOffice: PersonOfficeHolder | null;
	term: { start: string | null; end: string | null } | null;
	districtLabel: string | null;
	stateLabel: string | null;
	issues: PersonProfileIssueView[];
	links: PersonProfileLink[];
	/**
	 * Precomputed voter-density surface for the person's district, or null when
	 * unavailable (no district resolved / upstream not populated yet). The map is
	 * a progressive enhancement — SSR/SEO content never depends on it.
	 */
	voterDensity: VoterDensity | null;
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

function initialsOf(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	const first = parts[0];
	if (!first) return '?';
	if (parts.length === 1) return first.slice(0, 2).toUpperCase();
	const last = parts[parts.length - 1] ?? first;
	return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase() || '?';
}

function buildLinks(
	overlay: PublicPersonProfile,
	person: PersonItem | null,
	office: PersonOfficeHolder | null,
): PersonProfileLink[] {
	const links: PersonProfileLink[] = [];
	const website = overlay.websiteUrl ?? person?.websiteUrl ?? office?.websiteUrl ?? null;
	const email = overlay.publicEmail ?? office?.officeEmail ?? null;
	const phone = overlay.publicPhone ?? office?.officePhone ?? null;
	const instagram = overlay.instagramUrl;
	const tiktok = overlay.tiktokUrl;
	const facebook = overlay.facebookUrl ?? person?.facebookUrl ?? null;
	const twitter = overlay.twitterUrl ?? person?.twitterUrl ?? null;
	const linkedin = overlay.linkedinUrl ?? person?.linkedinUrl ?? null;

	if (website) links.push({ kind: 'website', label: 'Website', href: website });
	if (email) links.push({ kind: 'email', label: 'Email', href: `mailto:${email}` });
	if (phone) links.push({ kind: 'phone', label: 'Phone', href: `tel:${phone}` });
	if (instagram) links.push({ kind: 'instagram', label: 'Instagram', href: instagram });
	if (tiktok) links.push({ kind: 'tiktok', label: 'TikTok', href: tiktok });
	if (facebook) links.push({ kind: 'facebook', label: 'Facebook', href: facebook });
	if (twitter) links.push({ kind: 'twitter', label: 'X', href: twitter });
	if (linkedin) links.push({ kind: 'linkedin', label: 'LinkedIn', href: linkedin });
	return links;
}

function composeView(
	personId: string,
	person: PersonItem | null,
	overlay: PublicPersonProfile,
	voterDensity: VoterDensity | null,
): PersonProfileView {
	const composedName = [person?.firstName, person?.lastName].filter(Boolean).join(' ');
	const nameFromPerson = person?.fullName ?? (composedName || null);
	const displayName = overlay.displayName ?? nameFromPerson ?? 'Public Official';
	const office = pickCurrentOffice(person);
	const roleTitle =
		overlay.roleTitleOverride ?? office?.officeTitle ?? office?.positionName ?? null;
	const party = office?.partyNames?.[0] ?? person?.Candidacies?.[0]?.party ?? null;
	const districtLabel = office?.subAreaValue ?? office?.subAreaName ?? null;
	const stateLabel = office?.state ?? person?.state ?? null;

	return {
		personId,
		canonicalSlug: buildPersonSlug(nameFromPerson ?? displayName, personId),
		displayName,
		roleTitle,
		party,
		isVerified: true,
		avatarUrl: overlay.avatarUrl ?? person?.headshotUrl ?? null,
		coverImageUrl: overlay.coverImageUrl ?? null,
		initials: initialsOf(displayName),
		bio: overlay.bioOverride ?? person?.bioText ?? null,
		whyRunning: overlay.whyRunning ?? null,
		accomplishments: overlay.accomplishments ?? [],
		currentOffice: office,
		term: office ? { start: office.startAt, end: office.endAt } : null,
		districtLabel,
		stateLabel,
		issues: overlay.issues
			.filter((issue) => issue.title)
			.map((issue) => ({
				id: issue.issueId,
				title: issue.title as string,
				description: issue.description,
			})),
		links: buildLinks(overlay, person, office),
		voterDensity,
		updatedAt: overlay.updatedAt,
	};
}

/**
 * Loads and composes a public person profile, enforcing the render gate. Returns
 * null when the profile is not live (unpublished, deleted, or never created) —
 * gp-api answers 404/410 for those and getPublicPersonProfile maps them to null.
 */
export async function loadPersonProfile(personId: string): Promise<PersonProfileView | null> {
	const overlay = await getPublicPersonProfile(personId);
	if (!overlay) return null;
	// The civics spine and the (optional) voter-density surface are independent
	// of each other; fetch them in parallel. Density failures never block the
	// page — getVoterDensityForDistrict resolves to null on any non-live result.
	const [person, voterDensity] = await Promise.all([
		getPersonByPersonId(personId),
		getVoterDensityForDistrict(personId),
	]);
	return composeView(personId, person, overlay, voterDensity);
}
