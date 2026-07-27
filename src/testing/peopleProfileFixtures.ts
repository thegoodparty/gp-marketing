/**
 * Shared 12-state fixtures for the public /people profile matrix (states A–L).
 *
 * Single source of truth for both:
 *  - the view-model integration test (src/lib/peopleProfile.states.test.ts),
 *    which stubs `fetch` and drives `loadPersonProfile` end to end, and
 *  - the Storybook stories (src/components/people/PersonProfile.stories.tsx),
 *    which render each state via `composeView`.
 *
 * The payload shapes are DERIVED FROM the API integration-test contracts:
 *  - election-api Person spine → mirrors persons.integration.test.ts (PII
 *    columns email/phone are OMITTED from the response, relations nested).
 *  - gp-api overlay → mirrors public-person-profiles.controller.test.ts
 *    (200 live / 404 absent / 410 gone / 200 { removed: true }).
 * `assertNoPii` + the shape test in peopleProfileFixtures.test.ts keep these
 * fixtures honest against that contract.
 */
import type {
	PersonCandidacySummary,
	PersonItem,
	PersonOfficeHolder,
	PublicPersonProfile,
} from '~/types/people';
import { composeView, type PersonPersona, type PersonProfileView, type ProfileState } from '~/lib/peopleProfile';

export const PERSON_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

/** gp-api overlay outcomes, mirroring the public-person-profiles status codes. */
export type OverlayFixture =
	| { status: 'live'; profile: PublicPersonProfile }
	| { status: 'absent' }
	| { status: 'gone' }
	| { status: 'removed' };

export interface StateFixture {
	state: ProfileState;
	description: string;
	person: PersonItem;
	overlay: OverlayFixture;
	expected: ExpectedFacts;
}

/** Independently hand-stated expectations — the spec the resolver must satisfy. */
export interface ExpectedFacts {
	persona: PersonPersona;
	claimed: boolean;
	majorParty: boolean;
	empowered: boolean;
	removed: boolean;
	pledged: boolean;
	hasAvatar: boolean;
	hasBio: boolean;
	hasIssues: boolean;
	/** removed profiles keep a crawlable URL but are noindex'd. */
	noindex: boolean;
}

// ----- builders --------------------------------------------------------------

function candidacy(over: Partial<PersonCandidacySummary> = {}): PersonCandidacySummary {
	// No `slug` on purpose: loadPrimaryCandidacy short-circuits without one, so
	// the matrix stays focused on state/gating rather than the race fetch.
	// `Race.electionDate` lets the spine-derived "Recent Experience" date the run.
	return {
		id: 'cand-1',
		positionName: 'Mayor',
		party: 'Independent',
		state: 'CA',
		Race: { electionDate: '2024-11-05' },
		...over,
	};
}

function office(over: Partial<PersonOfficeHolder> = {}): PersonOfficeHolder {
	return {
		id: 'off-1',
		positionName: 'City Council',
		normalizedPositionName: null,
		officeTitle: 'City Council',
		partyNames: ['Independent'],
		startAt: '2021-01-01',
		endAt: null,
		termDateSpecificity: null,
		isCurrent: true,
		isAppointed: null,
		numberOfSeats: null,
		state: 'CA',
		subAreaName: null,
		subAreaValue: null,
		websiteUrl: null,
		officePhone: null,
		officeEmail: null,
		mailingCity: null,
		mailingState: null,
		...over,
	};
}

function spine(over: Partial<PersonItem> = {}): PersonItem {
	// Mirrors the election-api Person response: PII (email/phone) is NOT present.
	return {
		id: PERSON_ID,
		slug: 'jane-public',
		firstName: 'Jane',
		middleName: null,
		lastName: 'Public',
		nickname: null,
		suffix: null,
		fullName: 'Jane Public',
		bioText: 'Serving the community since 2021.',
		headshotUrl: 'https://cdn.example.org/jane.jpg',
		websiteUrl: null,
		linkedinUrl: null,
		facebookUrl: null,
		twitterUrl: null,
		state: 'CA',
		isPledged: false,
		...over,
	};
}

/** A published gp-api overlay (claimed) with authored bio, avatar, and one issue. */
function liveOverlay(over: Partial<PublicPersonProfile> = {}): OverlayFixture {
	return {
		status: 'live',
		profile: {
			personId: PERSON_ID,
			displayName: null,
			roleTitleOverride: null,
			bioOverride: 'Authored bio from the claimed profile.',
			coverImageUrl: null,
			avatarUrl: 'https://cdn.example.org/jane-overlay.jpg',
			whyRunning: 'To make local government work for everyone.',
			accomplishments: null,
			recentExperience: [
				{
					title: 'City Council Member, Ward 3',
					organization: 'City of Springfield',
					term: '2021\u20132025',
					source: 'user',
				},
			],
			publicEmail: null,
			publicPhone: null,
			websiteUrl: null,
			instagramUrl: null,
			tiktokUrl: null,
			facebookUrl: null,
			twitterUrl: null,
			linkedinUrl: null,
			defaultTransparency: null,
			publishedAt: '2026-01-01T00:00:00.000Z',
			updatedAt: '2026-01-01T00:00:00.000Z',
			issues: [
				{
					issueId: 'issue-1',
					title: 'Affordable Housing',
					description: 'Build more homes.',
					visible: true,
					status: 'IN_PROGRESS',
					transparency: 'Verified',
					sortOrder: 0,
				},
			],
			...over,
		},
	};
}

const claimedFacts = (persona: PersonPersona, pledged: boolean): ExpectedFacts => ({
	persona,
	claimed: true,
	majorParty: false,
	empowered: true,
	removed: false,
	pledged,
	hasAvatar: true,
	hasBio: true,
	hasIssues: true,
	noindex: false,
});

const unclaimedIndepFacts = (persona: PersonPersona, pledged: boolean): ExpectedFacts => ({
	persona,
	claimed: false,
	majorParty: false,
	empowered: true,
	removed: false,
	pledged,
	hasAvatar: true, // spine headshot
	hasBio: true, // spine bioText
	hasIssues: false, // no overlay
	noindex: false,
});

const unclaimedMajorFacts = (persona: PersonPersona): ExpectedFacts => ({
	persona,
	claimed: false,
	majorParty: true,
	empowered: false,
	removed: false,
	pledged: false,
	hasAvatar: true,
	hasBio: true,
	hasIssues: false,
	noindex: false,
});

// `majorParty` stays a factual party classification even when removal outranks
// it for the state letter, so K (a Republican) is majorParty:true while L (an
// independent office) is false.
const removedFacts = (persona: PersonPersona, majorParty: boolean): ExpectedFacts => ({
	persona,
	claimed: false,
	majorParty,
	empowered: false,
	removed: true,
	pledged: false, // suppressed on removal even though the spine flag is set
	hasAvatar: false, // stripped
	hasBio: false, // stripped
	hasIssues: false, // stripped
	noindex: true,
});

// ----- the 12-state matrix ---------------------------------------------------

export const STATE_FIXTURES: StateFixture[] = [
	{
		state: 'A',
		description: 'Claimed candidate',
		person: spine({ isPledged: true, Candidacies: [candidacy()] }),
		overlay: liveOverlay(),
		expected: claimedFacts('candidate', true),
	},
	{
		state: 'B',
		description: 'Claimed officeholder',
		person: spine({ OfficeHolders: [office({ isCurrent: true })] }),
		overlay: liveOverlay(),
		expected: claimedFacts('officeholder', false),
	},
	{
		state: 'C',
		description: 'Claimed candidate + officeholder',
		person: spine({
			isPledged: true,
			Candidacies: [candidacy()],
			OfficeHolders: [office({ isCurrent: true })],
		}),
		overlay: liveOverlay(),
		expected: claimedFacts('both', true),
	},
	{
		state: 'D',
		description: 'Unclaimed independent candidate',
		person: spine({ isPledged: true, Candidacies: [candidacy({ party: 'Independent' })] }),
		overlay: { status: 'absent' },
		expected: unclaimedIndepFacts('candidate', true),
	},
	{
		state: 'E',
		description: 'Unclaimed independent officeholder',
		person: spine({ OfficeHolders: [office({ isCurrent: true, partyNames: ['Independent'] })] }),
		overlay: { status: 'absent' },
		expected: unclaimedIndepFacts('officeholder', false),
	},
	{
		state: 'F',
		description: 'Unclaimed independent candidate + officeholder',
		person: spine({
			isPledged: true,
			Candidacies: [candidacy({ party: 'Independent' })],
			OfficeHolders: [office({ isCurrent: true, partyNames: ['Independent'] })],
		}),
		overlay: { status: 'absent' },
		expected: unclaimedIndepFacts('both', true),
	},
	{
		state: 'G',
		description: 'Claimed past officeholder',
		person: spine({
			OfficeHolders: [office({ isCurrent: false, startAt: '2014-01-01', endAt: '2018-01-01' })],
		}),
		overlay: liveOverlay(),
		expected: claimedFacts('past', false),
	},
	{
		state: 'H',
		description: 'Unclaimed independent past officeholder',
		person: spine({
			OfficeHolders: [
				office({
					isCurrent: false,
					partyNames: ['Independent'],
					startAt: '2014-01-01',
					endAt: '2018-01-01',
				}),
			],
		}),
		overlay: { status: 'absent' },
		expected: unclaimedIndepFacts('past', false),
	},
	{
		state: 'I',
		description: 'Unclaimed major-party candidate (running)',
		person: spine({ Candidacies: [candidacy({ party: 'Republican' })] }),
		overlay: { status: 'absent' },
		expected: unclaimedMajorFacts('candidate'),
	},
	{
		state: 'J',
		description: 'Unclaimed major-party officeholder',
		person: spine({ OfficeHolders: [office({ isCurrent: true, partyNames: ['Democratic'] })] }),
		overlay: { status: 'absent' },
		expected: unclaimedMajorFacts('officeholder'),
	},
	{
		state: 'K',
		description: 'Removal requested — running',
		person: spine({ isPledged: true, Candidacies: [candidacy({ party: 'Republican' })] }),
		overlay: { status: 'removed' },
		expected: removedFacts('candidate', true),
	},
	{
		state: 'L',
		description: 'Removal requested — officeholder',
		person: spine({ isPledged: true, OfficeHolders: [office({ isCurrent: true })] }),
		overlay: { status: 'removed' },
		expected: removedFacts('officeholder', false),
	},
];

export function fixtureForState(state: ProfileState): StateFixture {
	const found = STATE_FIXTURES.find((f) => f.state === state);
	if (!found) throw new Error(`No fixture for state ${state}`);
	return found;
}

/**
 * Composes the render view for a state directly from its fixture (no fetch),
 * using the same `composeView` that `loadPersonProfile` calls. Used by the
 * Storybook stories so the rendered UI reflects the exact same fixture data the
 * integration matrix asserts on.
 */
export function viewFor(state: ProfileState): PersonProfileView {
	const fixture = fixtureForState(state);
	const overlay = fixture.overlay.status === 'live' ? fixture.overlay.profile : null;
	const removed = fixture.overlay.status === 'removed';
	return composeView(PERSON_ID, fixture.person, overlay, { removed });
}

// ----- fetch mock ------------------------------------------------------------

type MockResponse = { ok: boolean; status: number; json(): Promise<unknown> };

const jsonResponse = (data: unknown, status = 200): MockResponse => ({
	ok: status >= 200 && status < 300,
	status,
	json: async () => data,
});

/**
 * Builds a `fetch` stand-in that routes the endpoints `loadPersonProfile` hits
 * for a given state fixture. Interlink/enrichment endpoints (other candidates,
 * nearby officials, elections index, voter density) resolve empty/absent so the
 * matrix isolates the state-resolution + content-gating data flow.
 */
export function buildPeopleFetchMock(
	fixture: StateFixture,
): (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> {
	return async (input: RequestInfo | URL): Promise<Response> => {
		const url = String(input);

		// gp-api: voter-density is a progressive enhancement — 404 → no map.
		if (url.includes('/public-person-profiles/voter-density')) {
			return jsonResponse({}, 404) as unknown as Response;
		}

		// gp-api: overlay publish/removal gate.
		if (url.includes('/v1/public-person-profiles')) {
			switch (fixture.overlay.status) {
				case 'gone':
					return jsonResponse({}, 410) as unknown as Response;
				case 'absent':
					return jsonResponse({}, 404) as unknown as Response;
				case 'removed':
					return jsonResponse({ personId: PERSON_ID, removed: true }) as unknown as Response;
				case 'live':
					return jsonResponse(fixture.overlay.profile) as unknown as Response;
			}
		}

		// election-api: person spine by id (no query string).
		if (/\/v1\/persons\/[^/?]+$/.test(url) && !url.includes('/by-slug/')) {
			return jsonResponse(fixture.person) as unknown as Response;
		}

		// Everything else (persons batch, candidacies, officeholders, places,
		// races) degrades to an empty list.
		return jsonResponse([]) as unknown as Response;
	};
}

/**
 * Fails if any Person/overlay PII (the `email`/`phone` keys) appears in a
 * fixture payload — mirrors the election-api PII-omission guarantee so a fixture
 * can't drift into shipping something the real API would never return.
 */
export function assertNoPii(payload: unknown): string[] {
	const leaks: string[] = [];
	const walk = (node: unknown, path: string) => {
		if (Array.isArray(node)) {
			node.forEach((item, i) => {
				walk(item, `${path}[${i}]`);
			});
			return;
		}
		if (node && typeof node === 'object') {
			for (const [key, value] of Object.entries(node)) {
				// gp-api overlay intentionally exposes publicEmail/publicPhone; only
				// the raw spine `email`/`phone` PII columns are forbidden.
				if (key === 'email' || key === 'phone') leaks.push(`${path}.${key}`);
				walk(value, `${path}.${key}`);
			}
		}
	};
	walk(payload, '$');
	return leaks;
}
