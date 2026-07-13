// Public /people profile types. The election-api Person + OfficeHolder spine is
// read-only (data-team owned); the gp-api overlay carries the user-editable,
// product-owned fields and the publish/delete state. The two are composed at
// render time (see src/lib/peopleProfile.ts).

export interface PersonOfficeHolder {
	id: string;
	positionName: string | null;
	normalizedPositionName: string | null;
	officeTitle: string | null;
	partyNames: string[];
	startAt: string | null;
	endAt: string | null;
	termDateSpecificity: string | null;
	isCurrent: boolean | null;
	isAppointed: boolean | null;
	numberOfSeats: number | null;
	state: string | null;
	subAreaName: string | null;
	subAreaValue: string | null;
	websiteUrl: string | null;
	officePhone: string | null;
	officeEmail: string | null;
	mailingCity: string | null;
	mailingState: string | null;
}

export interface PersonCandidacySummary {
	id: string;
	slug?: string;
	positionName?: string | null;
	party?: string | null;
	state?: string | null;
}

export interface PersonItem {
	id: string;
	slug: string;
	firstName: string | null;
	middleName: string | null;
	lastName: string | null;
	nickname: string | null;
	suffix: string | null;
	fullName: string | null;
	bioText: string | null;
	headshotUrl: string | null;
	websiteUrl: string | null;
	linkedinUrl: string | null;
	facebookUrl: string | null;
	twitterUrl: string | null;
	state: string | null;
	OfficeHolders?: PersonOfficeHolder[];
	Candidacies?: PersonCandidacySummary[];
}

export interface PublicPersonProfileIssue {
	issueId: string;
	title: string | null;
	description: string | null;
	visible: boolean;
	transparency: string | null;
	sortOrder: number | null;
}

export interface PersonAccomplishment {
	title: string;
	description?: string | null;
	date?: string | null;
}

// One precomputed voter-density heat-map cell: an H3 cell centroid + its voter
// count. Aggregated + k-anonymized upstream (people-api) — never a voter or
// household location. See src/components/people/VoterDensityMap.tsx.
export interface VoterDensityCell {
	lat: number;
	lng: number;
	count: number;
}

export interface VoterDensity {
	// rendered_voters / total_voters in [0, 1], or null when unknown. The map is
	// hidden below a coverage threshold so a sparse/unreliable surface is never
	// shown as if it were complete.
	coverage: number | null;
	cells: VoterDensityCell[];
}

export interface PublicPersonProfile {
	personId: string;
	displayName: string | null;
	roleTitleOverride: string | null;
	bioOverride: string | null;
	coverImageUrl: string | null;
	avatarUrl: string | null;
	whyRunning: string | null;
	accomplishments: PersonAccomplishment[] | null;
	publicEmail: string | null;
	publicPhone: string | null;
	websiteUrl: string | null;
	instagramUrl: string | null;
	tiktokUrl: string | null;
	facebookUrl: string | null;
	twitterUrl: string | null;
	linkedinUrl: string | null;
	defaultTransparency: string | null;
	publishedAt: string | null;
	updatedAt: string;
	issues: PublicPersonProfileIssue[];
}
