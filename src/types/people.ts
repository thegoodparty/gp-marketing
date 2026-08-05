// Public /people profile types. The election-api Person + OfficeHolder spine is
// read-only (data-team owned); the gp-api overlay carries the user-editable,
// product-owned fields and the publish/delete state. The two are composed at
// render time (see src/lib/peopleProfile.ts).

export interface PersonOfficeHolder {
	id: string;
	/** Canonical person id (election-api). Present on the /officeholders feed; used to link "Nearby Officials" back to /people. */
	personId?: string | null;
	/** BallotReady position id. Powers "Other Candidates for [Position]" (via Race.positionId). */
	positionId?: string | null;
	/** BallotReady geo id. Powers "Nearby Officials" (same constituency geography). */
	geoId?: string | null;
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
	/** Present when the officeholders feed is fetched with includePosition. */
	Position?: {
		id: string;
		name: string | null;
		level?: string | null;
		description?: string | null;
	} | null;
}

export interface PersonCandidacySummary {
	id: string;
	slug?: string;
	positionName?: string | null;
	party?: string | null;
	state?: string | null;
	raceId?: string | null;
	/** Resolved through the candidacy's Race; may be absent unless requested with includeRace. */
	positionId?: string | null;
	/**
	 * The candidacy's race, nested by election-api's persons endpoint (narrow,
	 * non-PII select). Lets "Recent Experience" date a run without a second fetch.
	 */
	Race?: { electionDate?: string | null } | null;
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
	/** Took the GoodParty pledge (ETL-sourced, read-only). */
	isPledged?: boolean;
	OfficeHolders?: PersonOfficeHolder[];
	Candidacies?: PersonCandidacySummary[];
}

/** Owner-set progress pill on a published issue (mirrors gp-api PersonProfileIssueStatus). */
export type PersonProfileIssueStatus =
	| 'IN_PROGRESS'
	| 'PRIORITIZED'
	| 'ONGOING'
	| 'RESOLVED';

export interface PublicPersonProfileIssue {
	issueId: string;
	title: string | null;
	description: string | null;
	visible: boolean;
	/** Progress pill (IN PROGRESS / PRIORITIZED / ONGOING / RESOLVED); null renders no pill. */
	status: PersonProfileIssueStatus | null;
	transparency: string | null;
	sortOrder: number | null;
}

export interface PersonAccomplishment {
	title: string;
	description?: string | null;
	date?: string | null;
}

/** Owner-authored "Recent Experience" row (gp-api overlay). Mirrors the public whitelist. */
export interface PersonAuthoredExperience {
	title: string;
	organization?: string | null;
	term?: string | null;
	source?: 'ballotready' | 'user' | null;
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
	/** Privacy takedown flag from gp-api. When true, render the minimal K/L states. */
	removed?: boolean;
	displayName: string | null;
	roleTitleOverride: string | null;
	bioOverride: string | null;
	coverImageUrl: string | null;
	avatarUrl: string | null;
	whyRunning: string | null;
	accomplishments: PersonAccomplishment[] | null;
	recentExperience: PersonAuthoredExperience[] | null;
	publicEmail: string | null;
	publicPhone: string | null;
	/** Owner-set office line; falls back to the election-api office spine. */
	officePhone: string | null;
	websiteUrl: string | null;
	/** Official .gov office site, distinct from the personal/campaign website. */
	governmentWebsiteUrl: string | null;
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
