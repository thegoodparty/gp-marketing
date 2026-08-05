/**
 * Dev-only enriched fixtures for the 12 harness /people profiles (states A–L).
 *
 * The live pages fetch from election-api-dev / gp-api-dev, whose seeded records
 * are sparse (1 issue, 1–2 experience rows, no interlinks, no voter density),
 * while the Figma mocks are fully populated. That data-volume gap — not layout —
 * is what keeps the visual-regression `body` band above the 3% gate.
 *
 * When `PEOPLE_DEV_FIXTURES=true`, `resolveView` short-circuits to the enriched
 * view built here (keyed by the exact harness slug), so the SAME render pipeline
 * (`composeView` → `buildPersonSectionOverrides` → template) runs against
 * mock-volume content. This is strictly a local parity aid: prod never sets the
 * flag and reads the real APIs.
 *
 * Persona/state resolution is delegated to the shared `STATE_FIXTURES` matrix so
 * each slug lands on the intended Figma state; only the CONTENT VOLUME (issues,
 * experience, interlinks, density, bios) is enriched on top.
 */
import { buildBreadcrumbTrail, composeView, type ExperienceItem, type PersonProfileView, type ProfileState, type RelatedPersonCard } from '~/lib/peopleProfile';
import type { PersonPersona } from '~/lib/peopleProfile';
import type { PublicPersonProfile, VoterDensity } from '~/types/people';
import { buildElectionPositionHrefFromRaceSlug } from '~/lib/electionsHelpers';
import { fixtureForState } from '~/testing/peopleProfileFixtures';

/**
 * A realistic race slug (`state/county/city/position`) so the dev pages render
 * the full breadcrumb + position href the same way production does for anyone
 * with a candidacy. The city matches the fixtures' office name so the trail and
 * the section headings name the same place.
 */
const DEV_RACE_SLUG = 'wy/laramie/springfield/city-council';
const DEV_POSITION_NAME = 'Springfield City Council';

function devPositionHref(): string | undefined {
	return buildElectionPositionHrefFromRaceSlug({ slug: DEV_RACE_SLUG, positionLevel: 'CITY' });
}

export function isDevPeopleFixturesEnabled(): boolean {
	return process.env['PEOPLE_DEV_FIXTURES'] === 'true';
}

/** Harness slug → target Figma state + display name (mirrors harness/config.mjs). */
const DEV_PEOPLE: Record<string, { state: ProfileState; first: string; last: string }> = {
	'allen-slagle-74eee01a': { state: 'A', first: 'Allen', last: 'Slagle' },
	'tracy-good-ecff49d3': { state: 'B', first: 'Tracy', last: 'Good' },
	'susan-overman-ad914b82': { state: 'C', first: 'Susan', last: 'Overman' },
	'kim-byrd-b77f912d': { state: 'D', first: 'Kim', last: 'Byrd' },
	'rob-zotti-d8c578fb': { state: 'E', first: 'Rob', last: 'Zotti' },
	'tim-ficken-0a951485': { state: 'F', first: 'Tim', last: 'Ficken' },
	'bill-fortner-61a42912': { state: 'G', first: 'Bill', last: 'Fortner' },
	'gregory-schreurs-136cadf0': { state: 'H', first: 'Gregory', last: 'Schreurs' },
	'jeb-hanson-3753676b': { state: 'I', first: 'Jeb', last: 'Hanson' },
	'deb-craft-f88e7434': { state: 'J', first: 'Deb', last: 'Craft' },
	'x-27255f40': { state: 'K', first: 'Jordan', last: 'Reyes' },
	'x-3412f69c': { state: 'L', first: 'Morgan', last: 'Ellis' },
};

/** Deterministic personId from the slug suffix so caching/keys stay stable. */
function personIdFromSuffix(suffix: string): string {
	const hex = suffix.replace(/[^0-9a-f]/gi, '').padEnd(8, '0').slice(0, 8).toLowerCase();
	return `${hex}-0000-4000-8000-000000000000`;
}

const LOREM =
	'Focused on transparent, accountable local government that puts residents first. Building coalitions across the community to deliver practical results on the issues families care about most.';

// Issues WITHOUT a status are the campaign platform ("Campaign Issues"); issues
// WITH one are the in-office record ("Top Priorities While in Office"). The
// frames show these as separate sections, so seed each kind only for the
// personas whose frame has that section.
const CAMPAIGN_ISSUES = [
	{
		issueId: 'issue-housing',
		title: 'Affordable Housing',
		description: 'Expand affordable housing options and streamline permitting for new homes.',
		visible: true,
		status: null,
		transparency: null,
		sortOrder: 0,
	},
	{
		issueId: 'issue-safety',
		title: 'Public Safety & Roads',
		description: 'Repair aging roads and invest in community-based public safety programs.',
		visible: true,
		status: null,
		transparency: null,
		sortOrder: 1,
	},
	{
		issueId: 'issue-transparency',
		title: 'Government Transparency',
		description: 'Publish budgets and votes openly so residents can hold leaders accountable.',
		visible: true,
		status: null,
		transparency: null,
		sortOrder: 2,
	},
] as const;

const IN_OFFICE_ISSUES = [
	{
		issueId: 'issue-tree-canopy',
		title: 'Protecting the tree canopy as we grow',
		description: 'Pair new development with replanting so block-level shade keeps pace with construction.',
		visible: true,
		status: 'IN_PROGRESS',
		transparency: 'Verified',
		sortOrder: 3,
	},
	{
		issueId: 'issue-repaving',
		title: 'Potholes and repaving on Riverside Avenue',
		description: 'Fund the repaving backlog and publish a street-by-street schedule residents can track.',
		visible: true,
		status: 'PRIORITIZED',
		transparency: 'Verified',
		sortOrder: 4,
	},
	{
		issueId: 'issue-fire-staffing',
		title: 'Fire department staffing and response times',
		description: 'Keep every station fully staffed and hold response times under the national benchmark.',
		visible: true,
		status: 'ONGOING',
		transparency: 'Verified',
		sortOrder: 5,
	},
] as const;

function richOverlay(name: string, persona: PersonPersona): Partial<PublicPersonProfile> {
	const ran = persona === 'candidate' || persona === 'both' || persona === 'past';
	const holdsOffice = persona === 'officeholder' || persona === 'both' || persona === 'past';
	return {
		displayName: name,
		bioOverride: `${name} is a lifelong resident and community advocate. ${LOREM}`,
		whyRunning: `I'm running because our community deserves leadership that listens. ${LOREM}`,
		// Accomplishments describe time IN office, so they're seeded only for
		// office-holding personas (officeholder/both/past) — a pure candidate
		// (State A) has none, matching the Figma candidate frames.
		accomplishments: holdsOffice
			? [
					{ title: 'Balanced the district budget without raising taxes', date: '2024' },
					{ title: 'Expanded after-school programs to every neighborhood school', date: '2023' },
					{ title: 'Launched a small-business recovery grant program', date: '2022' },
				]
			: null,
		publicEmail: 'contact@example.org',
		publicPhone: '(307) 555-0142',
		websiteUrl: 'https://example.org',
		governmentWebsiteUrl: 'https://gov.example.org',
		facebookUrl: 'https://facebook.com/example',
		linkedinUrl: 'https://linkedin.com/in/example',
		instagramUrl: 'https://instagram.com/example',
		issues: [
			...(ran ? CAMPAIGN_ISSUES : []),
			...(holdsOffice ? IN_OFFICE_ISSUES : []),
		],
	};
}

function richExperience(persona: PersonPersona): ExperienceItem[] {
	const running = persona === 'candidate' || persona === 'both';
	const rows: ExperienceItem[] = [
		{ title: 'City Council, District 40', organization: '2022 – present', term: '2022 – present', status: 'Incumbent', href: '/elections/city-council-40' },
		{ title: 'City Council, District 3', organization: '2018 – 2022', term: '2018 – 2022', status: 'Incumbent', href: '/elections/city-council-3' },
		{ title: 'Candidate for Position, District 3', organization: '2014', term: '2014', status: 'Candidate', href: '/elections/position-3' },
		{ title: 'School Board Trustee, At-Large', organization: '2010 – 2014', term: '2010 – 2014', status: null, href: '/elections/school-board' },
	];
	if (running) {
		rows.unshift({ title: `Candidate for ${DEV_POSITION_NAME}`, organization: '2026 election', term: '2026 election', status: 'Candidate', href: devPositionHref() ?? null });
	}
	return rows;
}

function relatedCards(prefix: string, count: number, empoweredEvery = 3): RelatedPersonCard[] {
	const NAMES = ['Garrett Borton', 'Nathan Todd', 'Don Taylor', 'Henry Nessul', 'Vera Huber', 'Gilian Sears', 'Cheri Steinmetz', 'Eric Barlow', 'Marcia Bean', 'Lori Smallwood', 'Serena Lipp', 'Abby Angelos'];
	// Realistic party mix, but ONLY non-partisan/independent people can be
	// GoodParty-empowered — a Republican/Democrat card must never show the
	// "Empowered by GoodParty.org" badge (we only empower non-partisan/3rd-party).
	const PARTIES = ['Nonpartisan', 'Republican', 'Independent', 'Democrat'];
	return Array.from({ length: count }, (_, i) => {
		const subtitle = PARTIES[i % PARTIES.length]!;
		const isMajorParty = subtitle === 'Republican' || subtitle === 'Democrat';
		return {
			personId: `${prefix}-${i}`,
			name: NAMES[i % NAMES.length]!,
			subtitle,
			href: `/people/${prefix}-${i}`,
			isEmpowered: !isMajorParty && i % empoweredEvery === 0,
			avatarUrl: null,
		};
	});
}

function richVoterDensity(): VoterDensity {
	const cells = Array.from({ length: 48 }, (_, i) => ({
		lat: 41.14 + (i % 8) * 0.01,
		lng: -104.82 + Math.floor(i / 8) * 0.01,
		count: 20 + ((i * 7) % 60),
	}));
	return { coverage: 1, cells };
}

function richElectionsIndex() {
	const counties = ['Albany', 'Big Horn', 'Campbell', 'Carbon', 'Converse', 'Crook', 'Fremont', 'Goshen', 'Hot Springs', 'Johnson', 'Laramie', 'Lincoln', 'Natrona', 'Niobrara', 'Park', 'Platte', 'Sheridan', 'Sublette', 'Sweetwater', 'Teton', 'Uinta', 'Washakie', 'Weston'];
	return {
		stateSlug: 'wy',
		stateName: 'Wyoming',
		entryLevel: 'county' as const,
		entries: counties.map((c) => ({ name: `${c} County`, href: `/elections/${c.toLowerCase().replace(/ /g, '-')}-county`, level: 'county' as const })),
	};
}

/** Builds the enriched dev view for a harness slug, or null if not a dev person. */
export function getDevPersonProfileView(slug: string): PersonProfileView | null {
	const entry = DEV_PEOPLE[slug];
	if (!entry) return null;

	const suffix = slug.slice(slug.lastIndexOf('-') + 1);
	const personId = personIdFromSuffix(suffix);
	const name = `${entry.first} ${entry.last}`;
	const fixture = fixtureForState(entry.state);
	// Real-looking headshot so the hero matches the Figma design (and the harness
	// can compare it un-masked). Deterministic per state. Dev-only.
	const headshotUrl = `https://i.pravatar.cc/320?img=${(entry.state.charCodeAt(0) - 64) % 70}`;

	const person = {
		...fixture.person,
		id: personId,
		firstName: entry.first,
		lastName: entry.last,
		fullName: name,
		// The shared matrix runs its candidacies for a different office (Mayor)
		// than it holds (city council), which is fine for state/gating tests but
		// would show a dev page whose hero names one race while the breadcrumb
		// and position link point at another. Every dev persona is about the one
		// DEV_RACE_SLUG race, so an incumbent here is running for re-election.
		Candidacies: (fixture.person.Candidacies ?? []).map((c) => ({ ...c, positionName: DEV_POSITION_NAME })),
		bioText: `${name} has served the community for over a decade. ${LOREM}`,
		headshotUrl,
		websiteUrl: 'https://example.org',
		facebookUrl: 'https://facebook.com/example',
		linkedinUrl: 'https://linkedin.com/in/example',
		// Office contact/mailing feed the sidebar "Office Contact" / "Office Mailing
		// Address" rows for anyone currently in office (Figma officeholder frames).
		OfficeHolders: (fixture.person.OfficeHolders ?? []).map((o) => ({
			...o,
			officeEmail: 'office@townofexample.gov',
			officePhone: '(307) 555-0100',
			mailingCity: 'Cheyenne',
			mailingState: 'WY',
		})),
	};

	const persona: PersonPersona = fixture.expected.persona;
	const running = persona === 'candidate' || persona === 'both';

	const overlay: PublicPersonProfile | null =
		fixture.overlay.status === 'live'
			? { ...fixture.overlay.profile, personId, ...richOverlay(name, persona), avatarUrl: headshotUrl }
			: null;
	const removed = fixture.overlay.status === 'removed';

	const positionHref = devPositionHref() ?? null;

	const view = composeView(personId, person, overlay, {
		removed,
		stateCode: 'WY',
		positionId: 'pos-dev',
		electionDate: '2026-11-03',
		positionDescription:
			'The County Legislature or Executive Board is the governing body of the county and exercises broad policy-making authority. The Board is charged with implementing policy and overseeing the county budget process and administration.',
		positionHref,
		// Mirror production's trail so reviewers see the real
		// Elections > State > County > City > Position > Name hierarchy rather
		// than the bare `Elections > Name` fallback.
		breadcrumb: buildBreadcrumbTrail({
			displayName: name,
			stateCode: 'WY',
			raceSlug: DEV_RACE_SLUG,
			positionLevel: 'CITY',
			positionName: DEV_POSITION_NAME,
		}),
		recentExperience: richExperience(persona),
		// Running personas get "Other candidates"; the Figma "past" mocks (G/H) are
		// the tallest frames and also carry this section, so include it there too.
		otherCandidates: running || persona === 'past' ? relatedCards('other-candidate', 5) : [],
		nearbyOfficials: relatedCards('nearby-official', 6),
		voterDensity: richVoterDensity(),
		electionsIndex: richElectionsIndex(),
		officeAddress: ['123 Capitol Avenue', 'Suite 200', 'Cheyenne, WY 82001'],
	});

	return { ...view, canonicalSlug: slug };
}
