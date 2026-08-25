import { describe, expect, test } from 'bun:test';
import type { CandidacyItem } from '~/types/elections';
import type { PersonItem, PersonOfficeHolder, PublicPersonProfile } from '~/types/people';
import {
	buildBreadcrumbTrail,
	buildNearbyOfficialCards,
	buildOtherCandidateCards,
	buildPersonSlug,
	buildPersonSlugFromBase,
	composeView,
	extractPersonId,
	isThinProfile,
	resolveProfileState,
	type PersonPersona,
} from './peopleProfile';
import { buildElectionPositionHrefFromRaceSlug } from './electionsHelpers';
import { classifyParty, isMajorParty } from './party';

const PID = '11111111-1111-1111-1111-111111111111';

function makeOffice(o: Partial<PersonOfficeHolder> = {}): PersonOfficeHolder {
	return {
		id: 'o1',
		positionName: null,
		normalizedPositionName: null,
		officeTitle: null,
		partyNames: [],
		startAt: null,
		endAt: null,
		termDateSpecificity: null,
		isCurrent: null,
		isAppointed: null,
		numberOfSeats: null,
		state: null,
		subAreaName: null,
		subAreaValue: null,
		websiteUrl: null,
		officePhone: null,
		officeEmail: null,
		mailingCity: null,
		mailingState: null,
		...o,
	};
}

function makePerson(p: Partial<PersonItem> = {}): PersonItem {
	return {
		id: 'p1',
		slug: 'x',
		firstName: null,
		middleName: null,
		lastName: null,
		nickname: null,
		suffix: null,
		fullName: null,
		bioText: null,
		headshotUrl: null,
		websiteUrl: null,
		linkedinUrl: null,
		facebookUrl: null,
		twitterUrl: null,
		instagramUrl: null,
		state: null,
		...p,
	};
}

function makeOverlay(o: Partial<PublicPersonProfile> = {}): PublicPersonProfile {
	return {
		personId: PID,
		displayName: null,
		roleTitleOverride: null,
		bioOverride: null,
		coverImageUrl: null,
		avatarUrl: null,
		whyRunning: null,
		accomplishments: null,
		recentExperience: null,
		publicEmail: null,
		publicPhone: null,
		officePhone: null,
		websiteUrl: null,
		governmentWebsiteUrl: null,
		instagramUrl: null,
		tiktokUrl: null,
		facebookUrl: null,
		twitterUrl: null,
		linkedinUrl: null,
		defaultTransparency: null,
		publishedAt: null,
		updatedAt: '2026-01-01T00:00:00.000Z',
		issues: [],
		...o,
	};
}

describe('composeView recent experience', () => {
	test('unclaimed candidate: spine candidacies populate Recent Experience', () => {
		const person = makePerson({
			firstName: 'Jane',
			lastName: 'Public',
			state: 'CA',
			Candidacies: [{ id: 'c1', positionName: 'Mayor', party: 'Independent', state: 'CA' }],
		});
		const view = composeView(PID, person, null);
		expect(view.recentExperience).toEqual([
			{ title: 'Candidate for Mayor', organization: 'CA', term: null, status: 'Candidate', href: null },
		]);
	});

	test('candidacy election date surfaces as the term year and sorts by recency', () => {
		const person = makePerson({
			state: 'CA',
			// Older office term + a more recent candidacy: the candidacy leads.
			OfficeHolders: [
				makeOffice({
					officeTitle: 'City Council',
					state: 'CA',
					startAt: '2016-01-01',
					endAt: '2020-01-01',
				}),
			],
			Candidacies: [
				{ id: 'c1', positionName: 'Mayor', state: 'CA', Race: { electionDate: '2024-11-05' } },
			],
		});
		const view = composeView(PID, person, null);
		expect(view.recentExperience).toEqual([
			{ title: 'Candidate for Mayor', organization: 'CA', term: '2024', status: 'Candidate', href: null },
			{ title: 'City Council', organization: 'CA', term: '2016 – 2020', status: null, href: null },
		]);
	});

	test('claimed authored experience overrides the spine list', () => {
		const person = makePerson({ Candidacies: [{ id: 'c1', positionName: 'Mayor' }] });
		const overlay = makeOverlay({
			publishedAt: '2026-01-01T00:00:00.000Z',
			recentExperience: [
				{ title: 'City Council Member', organization: 'Springfield', term: '2021-2025', source: 'user' },
			],
		});
		const view = composeView(PID, person, overlay);
		expect(view.recentExperience).toEqual([
			{ title: 'City Council Member', organization: 'Springfield', term: '2021-2025', status: null, href: null },
		]);
	});

	test('removal strips authored experience back to the civics spine', () => {
		const person = makePerson({ Candidacies: [{ id: 'c1', positionName: 'Mayor', state: 'CA' }] });
		const overlay = makeOverlay({
			recentExperience: [{ title: 'Authored, should be stripped', source: 'user' }],
		});
		const view = composeView(PID, person, overlay, { removed: true });
		expect(view.recentExperience).toEqual([
			{ title: 'Candidate for Mayor', organization: 'CA', term: null, status: 'Candidate', href: null },
		]);
	});
});

/**
 * "View Position" is the row's only link, and its label promises the
 * `/elections` position page — the same destination the breadcrumb's position
 * crumb carries. It shipped pointing at `/candidate/<slug>` instead, so the
 * button took voters to the candidate's own page rather than the seat.
 */
describe('Recent Experience links to the position page, not the candidate page', () => {
	const POSITION_HREF = '/elections/al/lee/auburn/position/city-council-ward-5';
	const CANDIDACY_SLUG = 'toshiro-jackson/auburn-city-council-ward-5';

	const runningFor = (over: Record<string, unknown> = {}) =>
		makePerson({
			state: 'AL',
			Candidacies: [
				{
					id: 'c1',
					slug: CANDIDACY_SLUG,
					positionName: 'Auburn City Council - Ward 5',
					state: 'AL',
					Race: { electionDate: '2026-11-03' },
					...over,
				},
			],
		});

	test('the row for the resolved race points at that position page', () => {
		const view = composeView(PID, runningFor(), null, { positionHref: POSITION_HREF });

		expect(view.recentExperience[0]?.href).toBe(POSITION_HREF);
	});

	/**
	 * The reported bug, pinned by destination rather than by absence: any href
	 * under `/candidate/` here is the old wrong link, whatever its slug.
	 */
	test('never points at the candidate page', () => {
		const view = composeView(PID, runningFor(), null, { positionHref: POSITION_HREF });

		for (const row of view.recentExperience) {
			expect(row.href ?? '').not.toStartWith('/candidate/');
		}
	});

	/**
	 * The position href is resolved from whichever candidacy the loader fetched
	 * in full, so it describes that race alone. A second candidacy carries no
	 * race slug of its own (election-api nests only `Race.electionDate`), and
	 * hanging this href on it would point at the wrong seat.
	 */
	test('a candidacy the position href does not describe stays unlinked', () => {
		const person = makePerson({
			state: 'AL',
			Candidacies: [
				{
					id: 'c1',
					slug: CANDIDACY_SLUG,
					positionName: 'Auburn City Council - Ward 5',
					state: 'AL',
					Race: { electionDate: '2026-11-03' },
				},
				{
					id: 'c2',
					slug: 'toshiro-jackson/lee-county-commission',
					positionName: 'Lee County Commission',
					state: 'AL',
					Race: { electionDate: '2022-11-08' },
				},
			],
		});

		const view = composeView(PID, person, null, { positionHref: POSITION_HREF });
		const byTitle = new Map(view.recentExperience.map((r) => [r.title, r.href]));

		expect(byTitle.get('Candidate for Auburn City Council - Ward 5')).toBe(POSITION_HREF);
		expect(byTitle.get('Candidate for Lee County Commission')).toBeNull();
	});

	/**
	 * The requirement is parity with the breadcrumb, so assert against what the
	 * trail actually builds rather than against a hand-written path: if the
	 * elections route shape changes, both move together or this fails.
	 */
	test('matches the destination the breadcrumb position crumb uses', () => {
		const raceSlug = 'al/lee/auburn/city-council-ward-5';
		const trail = buildBreadcrumbTrail({
			displayName: 'Toshiro Jackson',
			stateCode: 'AL',
			raceSlug,
			positionLevel: 'CITY',
			positionName: 'Auburn City Council - Ward 5',
		});
		const crumbHref = trail.find((c) => c.label === 'Auburn City Council - Ward 5')?.href ?? null;

		const view = composeView(PID, runningFor(), null, { positionHref: crumbHref });

		expect(crumbHref).not.toBeNull();
		expect(view.recentExperience[0]?.href).toBe(crumbHref);
	});

	test('renders no link when no position page resolves', () => {
		const view = composeView(PID, runningFor(), null, {});

		expect(view.recentExperience[0]?.href).toBeNull();
	});
});

/**
 * Once election-api nests each candidacy's own race slug (omni#1425) and
 * flattens the office's onto each term, every row can reach its own position
 * page — not just the one candidacy the loader fetched in full.
 */
describe('Recent Experience links every row it has a race slug for', () => {
	/** The canonical builder, so these assert parity rather than a hand-written path. */
	const expectedHref = (slug: string, positionLevel: string) =>
		buildElectionPositionHrefFromRaceSlug({ slug, positionLevel });

	test('each candidacy links to its own race, not to the primary one', () => {
		const current = 'al/lee/auburn/city-council-ward-5';
		const older = 'al/lee/lee-county-commission';
		const person = makePerson({
			state: 'AL',
			Candidacies: [
				{
					id: 'c1',
					slug: 'toshiro-jackson/auburn-city-council-ward-5',
					positionName: 'Auburn City Council - Ward 5',
					state: 'AL',
					Race: { electionDate: '2026-11-03', slug: current, positionLevel: 'CITY' },
				},
				{
					id: 'c2',
					slug: 'toshiro-jackson/lee-county-commission',
					positionName: 'Lee County Commission',
					state: 'AL',
					Race: { electionDate: '2022-11-08', slug: older, positionLevel: 'COUNTY' },
				},
			],
		});

		const view = composeView(PID, person, null, {});
		const byTitle = new Map(view.recentExperience.map((r) => [r.title, r.href]));

		expect(byTitle.get('Candidate for Auburn City Council - Ward 5')).toBe(
			expectedHref(current, 'CITY'),
		);
		expect(byTitle.get('Candidate for Lee County Commission')).toBe(expectedHref(older, 'COUNTY'));
		// Distinct races must not collapse onto one destination.
		expect(byTitle.get('Candidate for Auburn City Council - Ward 5')).not.toBe(
			byTitle.get('Candidate for Lee County Commission'),
		);
	});

	/**
	 * A pure officeholder has no candidacy to borrow a slug from, so the term's
	 * own `positionSlug` is the only route to their seat's page.
	 */
	test('an office term links through the slug flattened onto it', () => {
		const slug = 'ca/los-angeles/mayor';
		const person = makePerson({
			state: 'CA',
			OfficeHolders: [
				makeOffice({
					officeTitle: 'Mayor',
					state: 'CA',
					startAt: '2022-01-01',
					isCurrent: true,
					positionSlug: slug,
					positionLevel: 'CITY',
				}),
			],
		});

		const view = composeView(PID, person, null, {});

		expect(view.recentExperience[0]?.href).toBe(expectedHref(slug, 'CITY'));
	});

	test('an office term with no race stays unlinked', () => {
		const person = makePerson({
			OfficeHolders: [makeOffice({ officeTitle: 'Mayor', state: 'CA', startAt: '2022-01-01' })],
		});

		const view = composeView(PID, person, null, {});

		expect(view.recentExperience[0]?.href).toBeNull();
	});

	/**
	 * A CITY slug carrying no county segment resolves to a county-depth URL that
	 * 308s to the canonical four-level path (redirectCityRaceToFourLevelUrl), so
	 * it is a working link, not a broken one.
	 *
	 * The sitemap deliberately suppresses these (`skipUnmappedCity`) because a
	 * sitemap should advertise canonical URLs rather than redirects. An in-page
	 * link is the opposite case: the breadcrumb's position crumb builds this very
	 * href from the same helper, so suppressing it here would leave the row
	 * unlinked while the crumb directly above it still worked — the exact
	 * inconsistency this whole change set exists to remove.
	 */
	test('a city slug with no county segment links, matching the breadcrumb', () => {
		const slug = 'ca/beverly-hills/city-legislature';
		const person = makePerson({
			state: 'CA',
			Candidacies: [
				{
					id: 'c1',
					slug: 'jane-doe-city-council',
					positionName: 'City Council',
					state: 'CA',
					Race: { electionDate: '2026-11-03', slug, positionLevel: 'CITY' },
				},
			],
		});

		const crumbHref = buildBreadcrumbTrail({
			displayName: 'Jane Doe',
			stateCode: 'CA',
			raceSlug: slug,
			positionLevel: 'CITY',
			positionName: 'City Council',
		}).find((c) => c.label === 'City Council')?.href;

		const view = composeView(PID, person, null, {});

		expect(crumbHref).toBe('/elections/ca/beverly-hills/position/city-legislature');
		expect(view.recentExperience[0]?.href).toBe(crumbHref);
	});

	/**
	 * Slugs come from a dbt macro and can be too short to place. Linking anyway
	 * would point "View Position" at a 404, which is worse than no link.
	 */
	test('a slug that resolves to no page renders unlinked, not a 404', () => {
		const person = makePerson({
			state: 'CA',
			Candidacies: [
				{
					id: 'c1',
					slug: 'jane-doe-mayor',
					positionName: 'Mayor',
					state: 'CA',
					Race: { electionDate: '2026-11-03', slug: 'ca', positionLevel: 'CITY' },
				},
			],
		});

		const view = composeView(PID, person, null, {});

		expect(expectedHref('ca', 'CITY')).toBeUndefined();
		expect(view.recentExperience[0]?.href).toBeNull();
	});
});

describe('extractPersonId', () => {
	test('extracts the trailing UUID from a slug', () => {
		expect(extractPersonId(`jane-doe-${PID}`)).toBe(PID);
	});

	test('lowercases the extracted UUID', () => {
		expect(extractPersonId(`jane-doe-${PID.toUpperCase()}`)).toBe(PID);
	});

	test('returns null when there is no trailing UUID', () => {
		expect(extractPersonId('jane-doe')).toBeNull();
	});
});

describe('buildPersonSlug', () => {
	// id8 = first 8 hex of PID.
	const ID8 = '11111111';

	test('builds first-last-<id8>', () => {
		expect(buildPersonSlug('Jane Doe', PID)).toBe(`jane-doe-${ID8}`);
	});

	test('strips punctuation and diacritics', () => {
		expect(buildPersonSlug("José O'Brien-Smith", PID)).toBe(`jose-o-brien-smith-${ID8}`);
	});

	test('falls back to just the id suffix when the name has no slug chars', () => {
		expect(buildPersonSlug('!!!', PID)).toBe(ID8);
	});
});

describe('buildPersonSlugFromBase', () => {
	const ID8 = '11111111';

	test('appends the suffix to a name-derived base', () => {
		expect(buildPersonSlugFromBase('jane-doe', PID)).toBe(`jane-doe-${ID8}`);
	});

	// The election-api mart mints `Person.slug` with the suffix already on it. This
	// is the case that shipped doubled (`jane-doe-11111111-11111111`) and put a
	// redirect hop in front of every clean person URL.
	test('leaves a mart slug that already carries the suffix alone', () => {
		expect(buildPersonSlugFromBase(`jane-doe-${ID8}`, PID)).toBe(`jane-doe-${ID8}`);
	});

	test('is idempotent under repeated application', () => {
		const once = buildPersonSlugFromBase('jane-doe', PID);
		expect(buildPersonSlugFromBase(once, PID)).toBe(once);
	});

	// A base that slugified away to nothing yields the bare suffix; feeding that
	// back in must not produce `11111111-11111111`.
	test('does not double a base that is only the suffix', () => {
		expect(buildPersonSlugFromBase(ID8, PID)).toBe(ID8);
	});

	test('still appends when the base merely contains the suffix mid-string', () => {
		expect(buildPersonSlugFromBase(`${ID8}-jane`, PID)).toBe(`${ID8}-jane-${ID8}`);
	});
});

describe('composeView persona resolution', () => {
	test('candidate: has a candidacy and no current office', () => {
		const view = composeView(
			PID,
			makePerson({ fullName: 'Jane Doe', Candidacies: [{ id: 'c1', positionName: 'Mayor', party: 'Independent' }] }),
			null,
		);
		expect(view.persona).toBe('candidate');
		expect(view.roleTitle).toBe('Candidate for Mayor');
		expect(view.party).toBe('Independent');
	});

	test('officeholder: currently in office, not running', () => {
		const view = composeView(
			PID,
			makePerson({ fullName: 'Jane Doe', OfficeHolders: [makeOffice({ isCurrent: true, officeTitle: 'City Council' })] }),
			null,
		);
		expect(view.persona).toBe('officeholder');
		expect(view.roleTitle).toBe('City Council');
	});

	test('both: currently in office AND running', () => {
		const view = composeView(
			PID,
			makePerson({
				fullName: 'Jane Doe',
				Candidacies: [{ id: 'c1', positionName: 'Mayor' }],
				OfficeHolders: [makeOffice({ isCurrent: true, officeTitle: 'City Council' })],
			}),
			null,
		);
		expect(view.persona).toBe('both');
	});

	// Regression: election-api keeps a candidacy row forever, so counting rows
	// rather than dating them kept every officeholder who had ever run reading
	// as a current candidate. Shape below is Monique Bryant's live spine — a
	// 2024 school-board race she won, and the 2025–2028 term she is serving.
	test('an officeholder whose only race already happened is not still running', () => {
		const view = composeView(
			PID,
			makePerson({
				fullName: 'Monique Bryant',
				Candidacies: [
					{
						id: 'c1',
						positionName: 'Detroit Community School District Board',
						Race: { electionDate: '2024-11-05' },
					},
				],
				OfficeHolders: [
					makeOffice({
						isCurrent: true,
						positionName: 'Detroit Community School District Board',
						partyNames: ['Nonpartisan'],
						startAt: '2025-01-01',
						endAt: '2028-12-31',
					}),
				],
			}),
			null,
		);
		expect(view.persona).toBe('officeholder');
		expect(view.roleTitle).toBe('Detroit Community School District Board');
		// The "Candidate for …" line is what the bug report saw; it must be gone.
		expect(view.secondaryRoleTitle).toBeNull();
		// Persona drives the template: unclaimed non-partisan officeholder is E,
		// not the candidate-and-officeholder frame F.
		expect(view.state).toBe('E');
	});

	test('serving and running at once still resolves to both when the race is ahead', () => {
		const view = composeView(
			PID,
			makePerson({
				fullName: 'Santosh Salvi',
				Candidacies: [
					{ id: 'c1', positionName: 'Nashua School Board', Race: { electionDate: '2025-11-04' } },
					{ id: 'c2', positionName: 'State House', Race: { electionDate: '2099-09-08' } },
				],
				OfficeHolders: [makeOffice({ isCurrent: true, officeTitle: 'State Representative' })],
			}),
			null,
		);
		expect(view.persona).toBe('both');
		expect(view.secondaryRoleTitle).toBe('Candidate for State House');
	});

	test('a former officeholder whose only race is over reads as past, not running', () => {
		const view = composeView(
			PID,
			makePerson({
				fullName: 'Jane Doe',
				Candidacies: [{ id: 'c1', positionName: 'Mayor', Race: { electionDate: '2018-11-06' } }],
				OfficeHolders: [
					makeOffice({ isCurrent: false, officeTitle: 'Mayor', startAt: '2014-01-01', endAt: '2018-01-01' }),
				],
			}),
			null,
		);
		expect(view.persona).toBe('past');
		expect(view.roleTitle).toBe('Former Mayor');
	});

	test('an undated race counts as running — absent data is not a concluded race', () => {
		const view = composeView(
			PID,
			makePerson({
				fullName: 'Jane Doe',
				// No Race at all: the spine could not date this run.
				Candidacies: [{ id: 'c1', positionName: 'Mayor' }],
				OfficeHolders: [makeOffice({ isCurrent: true, officeTitle: 'City Council' })],
			}),
			null,
		);
		expect(view.persona).toBe('both');
	});

	test('the hero names the current race, not whichever candidacy the API returns first', () => {
		const view = composeView(
			PID,
			makePerson({
				fullName: 'Jane Doe',
				// The API does not order this array, so a past run can come first.
				Candidacies: [
					{ id: 'c1', positionName: 'School Board', Race: { electionDate: '2022-11-08' } },
					{ id: 'c2', positionName: 'Mayor', Race: { electionDate: '2099-11-03' } },
				],
			}),
			null,
		);
		expect(view.roleTitle).toBe('Candidate for Mayor');
		// Section headings ("About …", "Other Candidates for …") read the same name.
		expect(view.officeName).toBe('Mayor');
	});

	test('prefers a linkable race so the hero cannot name one race while the links name another', () => {
		const view = composeView(
			PID,
			makePerson({
				fullName: 'Jane Doe',
				Candidacies: [
					// Sooner, but with no slug the rest of the page cannot use it.
					{ id: 'c1', positionName: 'Mayor', Race: { electionDate: '2099-11-01' } },
					{ id: 'c2', positionName: 'School Board', slug: 'wy/laramie/school-board', Race: { electionDate: '2099-11-03' } },
				],
			}),
			null,
		);
		expect(view.roleTitle).toBe('Candidate for School Board');
	});

	test('a slug-less candidacy still supplies the office name and party', () => {
		const view = composeView(
			PID,
			makePerson({
				fullName: 'Jane Doe',
				Candidacies: [{ id: 'c1', positionName: 'Mayor', party: 'Independent' }],
			}),
			null,
		);
		expect(view.roleTitle).toBe('Candidate for Mayor');
		expect(view.party).toBe('Independent');
	});

	test('an archived candidate falls back to their most recent past race', () => {
		const view = composeView(
			PID,
			makePerson({
				fullName: 'Jane Doe',
				Candidacies: [
					{ id: 'c1', positionName: 'School Board', Race: { electionDate: '2018-11-06' } },
					{ id: 'c2', positionName: 'Mayor', Race: { electionDate: '2022-11-08' } },
				],
			}),
			null,
		);
		expect(view.roleTitle).toBe('Candidate for Mayor');
	});

	test('both: the second hero line names the seat being sought, not a past run', () => {
		const view = composeView(
			PID,
			makePerson({
				fullName: 'Jane Doe',
				Candidacies: [
					{ id: 'c1', positionName: 'School Board', Race: { electionDate: '2022-11-08' } },
					{ id: 'c2', positionName: 'Mayor', Race: { electionDate: '2099-11-03' } },
				],
				OfficeHolders: [makeOffice({ isCurrent: true, officeTitle: 'City Council' })],
			}),
			null,
		);
		expect(view.roleTitle).toBe('City Council');
		expect(view.secondaryRoleTitle).toBe('Candidate for Mayor');
	});

	test('past: held office before, not current and not running', () => {
		const view = composeView(
			PID,
			makePerson({
				fullName: 'Jane Doe',
				OfficeHolders: [makeOffice({ isCurrent: false, officeTitle: 'Mayor', startAt: '2014-01-01', endAt: '2018-01-01' })],
			}),
			null,
		);
		expect(view.persona).toBe('past');
		expect(view.roleTitle).toBe('Former Mayor');
	});
});

describe('composeView claim + overlay precedence', () => {
	test('unclaimed when there is no overlay', () => {
		const view = composeView(PID, makePerson({ fullName: 'Jane Doe' }), null);
		expect(view.claimed).toBe(false);
	});

	test('claimed when an overlay is present, and overlay fields win over the spine', () => {
		const view = composeView(
			PID,
			makePerson({ fullName: 'Jane Doe', bioText: 'spine bio', headshotUrl: 'spine.png' }),
			makeOverlay({ displayName: 'Councilmember Doe', bioOverride: 'overlay bio', avatarUrl: 'overlay.png' }),
		);
		expect(view.claimed).toBe(true);
		expect(view.displayName).toBe('Councilmember Doe');
		expect(view.bio).toBe('overlay bio');
		expect(view.avatarUrl).toBe('overlay.png');
	});

	test('roleTitleOverride wins over the derived role title', () => {
		const view = composeView(
			PID,
			makePerson({ fullName: 'Jane Doe', Candidacies: [{ id: 'c1', positionName: 'Mayor' }] }),
			makeOverlay({ roleTitleOverride: 'Community Organizer' }),
		);
		expect(view.roleTitle).toBe('Community Organizer');
	});
});

describe('composeView display name casing', () => {
	test('cases an unformatted spine name without disturbing the canonical slug', () => {
		const view = composeView(PID, makePerson({ slug: 'chris-lewis', fullName: 'chris lewis' }), null);
		expect(view.displayName).toBe('Chris Lewis');
		expect(view.initials).toBe('CL');
		expect(view.canonicalSlug).toBe('chris-lewis-11111111');
	});

	test('composes first/last when the spine has no fullName', () => {
		const view = composeView(PID, makePerson({ firstName: 'ed', lastName: 'johnson' }), null);
		expect(view.displayName).toBe('Ed Johnson');
	});

	test('leaves an already-formatted spine name alone', () => {
		const view = composeView(PID, makePerson({ fullName: 'Blaine K. Bowman' }), null);
		expect(view.displayName).toBe('Blaine K. Bowman');
	});

	// An owner who types their name in lowercase means it; only the spine's
	// lowercase is the unformatted-data signature.
	test('never re-cases an owner-authored displayName', () => {
		const view = composeView(
			PID,
			makePerson({ fullName: 'bell hooks' }),
			makeOverlay({ displayName: 'bell hooks' }),
		);
		expect(view.displayName).toBe('bell hooks');
	});
});

describe('isThinProfile', () => {
	// The shape behind the 1,792 GSC flagged: a name, a state, and nothing else.
	const thinPerson = makePerson({ fullName: 'chris lewis', state: 'VA' });

	test('an unclaimed profile with no office and no content is thin', () => {
		const view = composeView(PID, thinPerson, null);
		expect(view.roleTitle).toBe('Candidate');
		expect(isThinProfile(view)).toBe(true);
	});

	test('a candidacy that names a position is enough to differentiate', () => {
		const view = composeView(
			PID,
			makePerson({ fullName: 'chris lewis', Candidacies: [{ id: 'c1', positionName: 'Mayor' }] }),
			null,
		);
		expect(isThinProfile(view)).toBe(false);
	});

	test('an office term is enough to differentiate', () => {
		const view = composeView(
			PID,
			makePerson({
				fullName: 'chris lewis',
				OfficeHolders: [makeOffice({ isCurrent: true, officeTitle: 'City Council' })],
			}),
			null,
		);
		expect(isThinProfile(view)).toBe(false);
	});

	test('a candidacy with a null position name does not differentiate', () => {
		const view = composeView(
			PID,
			makePerson({ fullName: 'chris lewis', Candidacies: [{ id: 'c1', positionName: null }] }),
			null,
		);
		expect(isThinProfile(view)).toBe(true);
	});

	// The dbt mart wraps the BallotReady office columns in nullif(x, '') because
	// "the S3 feed uses '' (not null) for absent values" — but only some of them.
	// m_election_api__office_holder.sql does it for office_title and skips
	// position_name, so '' is a value this feed genuinely sends, and under
	// `officeName ?? positionId` that '' is the answer: the positionId behind it
	// is never consulted and a profile whose race resolved gets withheld.
	test('an empty-string position name does not mask a resolved position', () => {
		const view = composeView(
			PID,
			makePerson({ fullName: 'chris lewis', Candidacies: [{ id: 'c1', positionName: '' }] }),
			null,
			{ positionId: 'pos-1' },
		);

		expect(view.officeName).toBe('');
		expect(isThinProfile(view)).toBe(false);
	});

	// Same feed, same reason, one field over: m_election_api__person.sql nullif()s
	// the social URLs beside it but not bio_text, so a blank bio has to read as
	// the absence it is rather than as content that keeps the page in the index.
	test('a whitespace-only spine bio is not content', () => {
		const view = composeView(PID, makePerson({ fullName: 'chris lewis', bioText: '   ' }), null);

		expect(isThinProfile(view)).toBe(true);
	});

	/**
	 * The sitemap builder derives the same signal from the candidacy and
	 * officeholder sweeps, so it drops any URL those feeds name no office for. If
	 * this predicate could withhold a page those feeds DO name, the sitemap would
	 * advertise a URL that renders noindex — trading the current GSC report for
	 * "Submitted URL marked noindex". These pin the link that prevents it, which
	 * is `recentExperience` rather than `officeName`: the sweeps see every row,
	 * while the view names only the row primaryCandidacy/pickCurrentOffice chose.
	 */
	describe('anything the civics feeds name keeps the page indexable', () => {
		test('a named candidacy the view did not choose', () => {
			const view = composeView(
				PID,
				makePerson({
					fullName: 'chris lewis',
					// primaryCandidacy prefers a slugged row, so it picks the unnamed
					// one; the sitemap's sweep sees both.
					Candidacies: [
						{ id: 'c1', slug: 'unnamed-race', positionName: null },
						{ id: 'c2', positionName: 'Mayor' },
					],
				}),
				null,
			);

			expect(view.officeName).toBeNull();
			expect(isThinProfile(view)).toBe(false);
		});

		// #227 stopped a concluded race from making someone a current candidate,
		// which is a persona change only — the race still names the seat. Worth
		// pinning because a page whose only civics row is in the past is exactly
		// the shape that looks discardable, and it is a legitimate voter-guide
		// page carrying a real office, an election date and a disclaimer.
		test('a concluded race that still names the seat', () => {
			const view = composeView(
				PID,
				makePerson({
					fullName: 'chris lewis',
					Candidacies: [
						{ id: 'c1', positionName: 'Mayor', Race: { electionDate: '2020-11-03' } },
					],
				}),
				null,
			);

			expect(view.persona).toBe('candidate');
			expect(isThinProfile(view)).toBe(false);
		});

		test('an office term the view could not title', () => {
			const view = composeView(
				PID,
				makePerson({ fullName: 'chris lewis', OfficeHolders: [makeOffice({ isCurrent: true })] }),
				null,
			);

			expect(view.officeName).toBeNull();
			expect(isThinProfile(view)).toBe(false);
		});
	});

	describe('any single signal keeps the page indexable', () => {
		test('a spine bio', () => {
			expect(isThinProfile(composeView(PID, makePerson({ ...thinPerson, bioText: 'A bio.' }), null))).toBe(false);
		});

		test('a headshot', () => {
			expect(
				isThinProfile(composeView(PID, makePerson({ ...thinPerson, headshotUrl: 'p.png' }), null)),
			).toBe(false);
		});

		test('an outbound link', () => {
			expect(
				isThinProfile(
					composeView(PID, makePerson({ ...thinPerson, websiteUrl: 'https://x.example' }), null),
				),
			).toBe(false);
		});

		// Instagram is the one link in election-api's `urls[]` block that
		// buildLinks did not fall back to the spine for, so a person whose only
		// public link was an Instagram reached this predicate looking contentless.
		// Asserting the link too, not just the verdict: the verdict alone would
		// still pass if the URL were counted but never rendered.
		test('an Instagram on the spine, which the link rail used to drop', () => {
			const view = composeView(
				PID,
				makePerson({ ...thinPerson, instagramUrl: 'https://instagram.com/chris' }),
				null,
			);

			expect(view.links.map((l) => l.kind)).toEqual(['instagram']);
			expect(isThinProfile(view)).toBe(false);
		});
	});

	// An owner asked for this page; the claimed population is far too small to
	// drive clustering, so it is never withheld from the index.
	test('a claimed profile is never thin, even with nothing else on it', () => {
		const view = composeView(PID, thinPerson, makeOverlay({}));
		expect(view.claimed).toBe(true);
		expect(isThinProfile(view)).toBe(false);
	});

	// Removal already sets noindex on its own; both rules agreeing here means the
	// K/L pages cannot be re-indexed by one rule while the other suppresses them.
	test('a removed profile stripped back to the bare spine is thin', () => {
		const view = composeView(PID, thinPerson, makeOverlay({ bioOverride: 'gone' }), { removed: true });
		expect(view.removed).toBe(true);
		expect(isThinProfile(view)).toBe(true);
	});
});

describe('composeView issues, links, labels', () => {
	test('keeps only visible issues that have a title, preserving order', () => {
		const view = composeView(
			PID,
			makePerson({ fullName: 'Jane Doe' }),
			makeOverlay({
				issues: [
					{ issueId: 'i1', title: 'Housing', description: 'More homes', visible: true, status: 'IN_PROGRESS', transparency: 'Verified', sortOrder: 0 },
					{ issueId: 'i2', title: 'Hidden', description: null, visible: false, status: null, transparency: null, sortOrder: 1 },
					{ issueId: 'i3', title: null, description: null, visible: true, status: null, transparency: null, sortOrder: 2 },
				],
			}),
		);
		expect(view.issues.map((i) => i.id)).toEqual(['i1']);
		expect(view.issues[0]?.status).toBe('IN_PROGRESS');
		expect(view.issues[0]?.transparency).toBe('Verified');
	});

	test('builds contact links from the overlay public fields (mailto/tel)', () => {
		const view = composeView(
			PID,
			makePerson({ fullName: 'Jane Doe' }),
			makeOverlay({ publicEmail: 'jane@example.com', publicPhone: '555-1234', websiteUrl: 'https://jane.example' }),
		);
		const byKind = Object.fromEntries(view.links.map((l) => [l.kind, l.href]));
		expect(byKind['email']).toBe('mailto:jane@example.com');
		expect(byKind['phone']).toBe('tel:555-1234');
		expect(byKind['website']).toBe('https://jane.example');
	});

	test('office contact overrides surface as their own links', () => {
		const view = composeView(
			PID,
			makePerson({ fullName: 'Jane Doe' }),
			makeOverlay({
				officePhone: '555-0199',
				governmentWebsiteUrl: 'https://springfield.gov/council/rivera',
			}),
		);
		const byKind = Object.fromEntries(view.links.map((l) => [l.kind, l.href]));
		// The official .gov site is a distinct link from the personal website.
		expect(byKind['government']).toBe('https://springfield.gov/council/rivera');
		// officePhone falls in behind publicPhone (absent here) as the tel: source.
		expect(byKind['phone']).toBe('tel:555-0199');
	});

	test('formats term label, district and state from the current office', () => {
		const view = composeView(
			PID,
			makePerson({
				fullName: 'Jane Doe',
				state: 'CA',
				OfficeHolders: [
					makeOffice({ isCurrent: true, officeTitle: 'City Council', startAt: '2022-01-01', endAt: '2026-01-01', subAreaValue: 'Ward 3', state: 'CA' }),
				],
			}),
			null,
		);
		expect(view.termLabel).toBe('2022 – 2026');
		expect(view.districtLabel).toBe('Ward 3');
		expect(view.stateLabel).toBe('CA');
	});

	test('canonicalSlug uses the spine base slug + id8 suffix, not the overlay display name', () => {
		const view = composeView(
			PID,
			makePerson({ slug: 'jane-doe-11111111', fullName: 'Jane Doe' }),
			makeOverlay({ displayName: 'Councilmember Doe' }),
		);
		// election-api mints Person.slug with the 8-hex id suffix already on it, so
		// the canonical is that slug verbatim. Fixturing an unsuffixed base here is
		// what let the doubled-suffix bug (`jane-doe-11111111-11111111`) reach prod:
		// the assertion held either way.
		expect(view.canonicalSlug).toBe('jane-doe-11111111');
		expect(view.initials).toBe('CD');
	});

	test('canonicalSlug falls back to a derived base + id8 when the spine is absent', () => {
		const view = composeView(PID, null, makeOverlay({ displayName: 'Councilmember Doe' }));
		expect(view.canonicalSlug).toBe('councilmember-doe-11111111');
	});

	test('falls back to a generic name when neither spine nor overlay names exist', () => {
		const view = composeView(PID, null, null);
		expect(view.displayName).toBe('Public Official');
		expect(view.claimed).toBe(false);
		// No civics rows and no candidacy reads as a candidate by default.
		expect(view.persona).toBe('candidate');
	});
});

describe('classifyParty', () => {
	test('recognizes Republican / Democrat variants', () => {
		expect(classifyParty('Republican')).toBe('republican');
		expect(classifyParty('GOP')).toBe('republican');
		expect(classifyParty('R')).toBe('republican');
		expect(classifyParty('Democratic')).toBe('democrat');
		expect(classifyParty('Dem')).toBe('democrat');
		expect(classifyParty('D')).toBe('democrat');
	});

	test('recognizes independent / nonpartisan as independent', () => {
		expect(classifyParty('Independent')).toBe('independent');
		expect(classifyParty('Nonpartisan')).toBe('independent');
		expect(classifyParty('Unaffiliated')).toBe('independent');
	});

	test('unknown non-empty strings fall to "other"; empty is null', () => {
		expect(classifyParty('Green Party')).toBe('other');
		expect(classifyParty('')).toBeNull();
		expect(classifyParty(null)).toBeNull();
	});

	test('isMajorParty is true only for R/D', () => {
		expect(isMajorParty('republican')).toBe(true);
		expect(isMajorParty('democrat')).toBe(true);
		expect(isMajorParty('independent')).toBe(false);
		expect(isMajorParty('other')).toBe(false);
		expect(isMajorParty(null)).toBe(false);
	});
});

describe('resolveProfileState', () => {
	const personas: PersonPersona[] = ['candidate', 'officeholder', 'both', 'past'];

	test('claimed personas map to A/B/C/G', () => {
		const expected = { candidate: 'A', officeholder: 'B', both: 'C', past: 'G' } as const;
		for (const persona of personas) {
			expect(resolveProfileState(persona, { claimed: true, removed: false, partyClass: null })).toBe(
				expected[persona],
			);
		}
	});

	test('unclaimed non-partisan personas map to D/E/F/H', () => {
		const expected = { candidate: 'D', officeholder: 'E', both: 'F', past: 'H' } as const;
		for (const persona of personas) {
			expect(
				resolveProfileState(persona, { claimed: false, removed: false, partyClass: 'independent' }),
			).toBe(expected[persona]);
		}
	});

	test('unclaimed major-party maps to I (running) / J (office)', () => {
		expect(resolveProfileState('candidate', { claimed: false, removed: false, partyClass: 'republican' })).toBe('I');
		expect(resolveProfileState('both', { claimed: false, removed: false, partyClass: 'democrat' })).toBe('I');
		expect(resolveProfileState('officeholder', { claimed: false, removed: false, partyClass: 'republican' })).toBe('J');
		expect(resolveProfileState('past', { claimed: false, removed: false, partyClass: 'democrat' })).toBe('J');
	});

	test('removal maps to K (running) / L (office) and outranks partisan', () => {
		expect(resolveProfileState('candidate', { claimed: false, removed: true, partyClass: 'republican' })).toBe('K');
		expect(resolveProfileState('officeholder', { claimed: false, removed: true, partyClass: 'democrat' })).toBe('L');
		expect(resolveProfileState('past', { claimed: false, removed: true, partyClass: null })).toBe('L');
	});

	test('claimed outranks removal/partisan (claim precedence)', () => {
		expect(resolveProfileState('candidate', { claimed: true, removed: true, partyClass: 'republican' })).toBe('A');
	});
});

describe('composeView state + empowerment gating', () => {
	test('unclaimed major-party candidate resolves to state I and is not empowered', () => {
		const view = composeView(
			PID,
			makePerson({ fullName: 'Jane Doe', Candidacies: [{ id: 'c1', positionName: 'Mayor', party: 'Republican' }] }),
			null,
		);
		expect(view.state).toBe('I');
		expect(view.majorParty).toBe(true);
		expect(view.empowered).toBe(false);
	});

	test('unclaimed independent candidate resolves to state D and is empowered', () => {
		const view = composeView(
			PID,
			makePerson({ fullName: 'Jane Doe', Candidacies: [{ id: 'c1', positionName: 'Mayor', party: 'Independent' }] }),
			null,
		);
		expect(view.state).toBe('D');
		expect(view.empowered).toBe(true);
	});

	test('pledged spine flag surfaces on the view; removal suppresses it', () => {
		const pledged = composeView(
			PID,
			makePerson({ fullName: 'Jane Doe', isPledged: true, Candidacies: [{ id: 'c1', positionName: 'Mayor' }] }),
			null,
		);
		expect(pledged.pledged).toBe(true);

		const removed = composeView(
			PID,
			makePerson({ fullName: 'Jane Doe', isPledged: true, Candidacies: [{ id: 'c1', positionName: 'Mayor' }] }),
			null,
			{ removed: true },
		);
		expect(removed.pledged).toBe(false);
	});

	test('removal strips authored content and photo (state K/L)', () => {
		const view = composeView(
			PID,
			makePerson({ fullName: 'Jane Doe', headshotUrl: 'spine.png', Candidacies: [{ id: 'c1', positionName: 'Mayor' }] }),
			null,
			{ removed: true },
		);
		expect(view.state).toBe('K');
		expect(view.removed).toBe(true);
		expect(view.empowered).toBe(false);
		expect(view.avatarUrl).toBeNull();
		expect(view.bio).toBeNull();
		expect(view.issues).toEqual([]);
	});
});

describe('buildBreadcrumbTrail', () => {
	test('degrades to Elections > State > Name without a race slug', async () => {
		const trail = buildBreadcrumbTrail({
			displayName: 'Jane Doe',
			stateCode: 'CA',
			raceSlug: null,
			positionLevel: null,
			positionName: null,
		});
		expect(trail.map((c) => c.label)).toEqual(['Elections', 'California', 'Jane Doe']);
		expect(trail[0]?.href).toBe('/elections');
	});

	test('degrades to Elections > Name when neither race slug nor state is known', async () => {
		const trail = buildBreadcrumbTrail({
			displayName: 'Jane Doe',
			stateCode: null,
			raceSlug: null,
			positionLevel: null,
			positionName: null,
		});
		expect(trail.map((c) => c.label)).toEqual(['Elections', 'Jane Doe']);
	});

	test('builds Elections > State > ... > Position > Name from a race slug', async () => {
		const trail = buildBreadcrumbTrail({
			displayName: 'Jane Doe',
			stateCode: 'CA',
			raceSlug: 'ca/los-angeles-county/mayor',
			positionLevel: 'COUNTY',
			positionName: 'Mayor',
		});
		const labels = trail.map((c) => c.label);
		expect(labels[0]).toBe('Elections');
		expect(labels[1]).toBe('California');
		expect(labels).toContain('Mayor');
		expect(labels[labels.length - 1]).toBe('Jane Doe');
	});
});

describe('buildNearbyOfficialCards', () => {
	const OTHER = '22222222-2222-2222-2222-222222222222';
	const personsById = (person: PersonItem) => new Map([[OTHER.toLowerCase(), person]]);

	test('takes the spine fullName, re-cased', () => {
		const cards = buildNearbyOfficialCards(
			[makeOffice({ personId: OTHER, officeTitle: 'city council member' })],
			personsById(makePerson({ id: OTHER, fullName: 'chris lewis' })),
			PID,
		);
		expect(cards.map((c) => c.name)).toEqual(['Chris Lewis']);
	});

	test('falls through to first + last when fullName is absent', () => {
		const cards = buildNearbyOfficialCards(
			[makeOffice({ personId: OTHER })],
			personsById(makePerson({ id: OTHER, firstName: 'chris', lastName: 'lewis' })),
			PID,
		);
		expect(cards.map((c) => c.name)).toEqual(['Chris Lewis']);
	});

	// Rows with no linked person still render a card, labelled by the office. The
	// title comes from the same spine as the names and arrives uncased too.
	test('falls through to the office title, cased', () => {
		const cards = buildNearbyOfficialCards([makeOffice({ officeTitle: 'city council member' })], new Map(), PID);
		expect(cards.map((c) => c.name)).toEqual(['City Council Member']);
	});

	test('skips a row with no name and no office title', () => {
		expect(buildNearbyOfficialCards([makeOffice({})], new Map(), PID)).toEqual([]);
	});

	test('excludes the subject of the profile', () => {
		expect(buildNearbyOfficialCards([makeOffice({ personId: PID, officeTitle: 'mayor' })], new Map(), PID)).toEqual([]);
	});

	// The pledge flag was already in memory here — `loadNearbyOfficials` resolves
	// the same persons for their names — and the builder simply never read it.
	test('carries the spine pledge flag through', () => {
		const cards = buildNearbyOfficialCards(
			[makeOffice({ personId: OTHER, officeTitle: 'mayor', partyNames: ['Independent'] })],
			personsById(makePerson({ id: OTHER, fullName: 'chris lewis', isPledged: true })),
			PID,
		);
		expect(cards.map((c) => c.isPledged)).toEqual([true]);
	});

	test('is not pledged when the spine says nothing', () => {
		const cards = buildNearbyOfficialCards(
			[makeOffice({ personId: OTHER, officeTitle: 'mayor', partyNames: ['Independent'] })],
			personsById(makePerson({ id: OTHER, fullName: 'chris lewis' })),
			PID,
		);
		expect(cards.map((c) => c.isPledged)).toEqual([false]);
	});

	// A row with no linked person still renders a card, labelled by its office.
	// There is no one to have pledged, so it must not claim anyone did.
	test('is not pledged when there is no person to look up', () => {
		const cards = buildNearbyOfficialCards([makeOffice({ officeTitle: 'city council member' })], new Map(), PID);
		expect(cards.map((c) => c.isPledged)).toEqual([false]);
	});

	// Same precedence as the hero: party decides eligibility, so a stale flag from
	// a past run under another party cannot make the card contradict the profile
	// it links to.
	test('a major-party official is not pledged even when the flag says so', () => {
		const cards = buildNearbyOfficialCards(
			[makeOffice({ personId: OTHER, officeTitle: 'mayor', partyNames: ['Democratic'] })],
			personsById(makePerson({ id: OTHER, fullName: 'chris lewis', isPledged: true })),
			PID,
		);
		expect(cards.map((c) => c.isPledged)).toEqual([false]);
	});

	// An officeholder row carries no party at all far more often than it carries a
	// wrong one. Unknown has to read as "do not assert", or the card claims a
	// pledge for someone whose own profile may call them ineligible.
	test('an unknown party is not enough to claim the pledge', () => {
		const cards = buildNearbyOfficialCards(
			[makeOffice({ personId: OTHER, officeTitle: 'mayor', partyNames: [] })],
			personsById(makePerson({ id: OTHER, fullName: 'chris lewis', isPledged: true })),
			PID,
		);
		expect(cards.map((c) => c.isPledged)).toEqual([false]);
	});

	// The hero would read the major-party candidacy and call them ineligible, so
	// an Independent office row on its own must not outvote it.
	test('a major-party signal elsewhere on the person disqualifies', () => {
		const cards = buildNearbyOfficialCards(
			[makeOffice({ personId: OTHER, officeTitle: 'mayor', partyNames: ['Independent'] })],
			personsById(
				makePerson({
					id: OTHER,
					fullName: 'chris lewis',
					isPledged: true,
					Candidacies: [{ id: 'c1', party: 'Republican' }],
				}),
			),
			PID,
		);
		expect(cards.map((c) => c.isPledged)).toEqual([false]);
	});
});

describe('buildOtherCandidateCards', () => {
	const OTHER = '33333333-3333-3333-3333-333333333333';
	const candidacy = (c: Partial<CandidacyItem> = {}): CandidacyItem => ({
		id: 'c1',
		personId: OTHER,
		firstName: 'chris',
		lastName: 'lewis',
		party: 'Independent',
		...c,
	});
	const personsById = (person: PersonItem) => new Map([[OTHER.toLowerCase(), person]]);

	// The candidacy feed carries no pledge field, so the flag can only arrive via
	// the batched person lookup `loadOtherCandidates` adds.
	test('carries the pledge flag from the resolved person', () => {
		const cards = buildOtherCandidateCards(
			[candidacy()],
			personsById(makePerson({ id: OTHER, isPledged: true })),
			PID,
		);
		expect(cards.map((c) => c.isPledged)).toEqual([true]);
	});

	test('is not pledged when the person lookup found nothing', () => {
		const cards = buildOtherCandidateCards([candidacy()], new Map(), PID);
		expect(cards).toHaveLength(1);
		expect(cards.map((c) => c.isPledged)).toEqual([false]);
	});

	test('a major-party candidate is not pledged even when the flag says so', () => {
		const cards = buildOtherCandidateCards(
			[candidacy({ party: 'Republican' })],
			personsById(makePerson({ id: OTHER, isPledged: true })),
			PID,
		);
		expect(cards.map((c) => c.isPledged)).toEqual([false]);
	});

	test('an unknown party is not enough to claim the pledge', () => {
		const cards = buildOtherCandidateCards(
			[candidacy({ party: undefined })],
			personsById(makePerson({ id: OTHER, isPledged: true })),
			PID,
		);
		expect(cards.map((c) => c.isPledged)).toEqual([false]);
	});

	// The hero resolves party office-first, so a partisan office outranks this
	// Independent race. The card sees the office only when the batched person
	// payload carries it — when it does, it must not contradict the profile.
	test('a major-party office on the person disqualifies an Independent run', () => {
		const cards = buildOtherCandidateCards(
			[candidacy({ party: 'Independent' })],
			personsById(
				makePerson({
					id: OTHER,
					isPledged: true,
					OfficeHolders: [makeOffice({ partyNames: ['Democratic'] })],
				}),
			),
			PID,
		);
		expect(cards.map((c) => c.isPledged)).toEqual([false]);
	});

	test('excludes the subject of the profile', () => {
		expect(buildOtherCandidateCards([candidacy({ personId: PID })], new Map(), PID)).toEqual([]);
	});
});
