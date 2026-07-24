import { describe, expect, test } from 'bun:test';
import type { PersonItem, PersonOfficeHolder, PublicPersonProfile } from '~/types/people';
import {
	buildBreadcrumb,
	buildPersonSlug,
	composeView,
	extractPersonId,
	resolveProfileState,
	type PersonPersona,
} from './peopleProfile';
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
		publicEmail: null,
		publicPhone: null,
		websiteUrl: null,
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
	test('builds first-last-<personId>', () => {
		expect(buildPersonSlug('Jane Doe', PID)).toBe(`jane-doe-${PID}`);
	});

	test('strips punctuation and diacritics', () => {
		expect(buildPersonSlug("José O'Brien-Smith", PID)).toBe(`jose-o-brien-smith-${PID}`);
	});

	test('falls back to just the id when the name has no slug chars', () => {
		expect(buildPersonSlug('!!!', PID)).toBe(PID);
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

	test('canonicalSlug is the authoritative spine slug, not derived from the overlay display name', () => {
		const view = composeView(
			PID,
			makePerson({ slug: 'jane-doe', fullName: 'Jane Doe' }),
			makeOverlay({ displayName: 'Councilmember Doe' }),
		);
		// Clean slug (no trailing UUID) comes straight from election-api Person.slug.
		expect(view.canonicalSlug).toBe('jane-doe');
		expect(view.initials).toBe('CD');
	});

	test('canonicalSlug falls back to a derived slug when the spine is absent', () => {
		const view = composeView(PID, null, makeOverlay({ displayName: 'Councilmember Doe' }));
		expect(view.canonicalSlug).toBe('councilmember-doe');
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

describe('buildBreadcrumb', () => {
	test('degrades to Home > People > Name without a race slug', async () => {
		const trail = await buildBreadcrumb({
			displayName: 'Jane Doe',
			stateCode: 'CA',
			raceSlug: null,
			positionLevel: null,
			positionName: null,
		});
		expect(trail.map((c) => c.label)).toEqual(['Home', 'People', 'Jane Doe']);
	});

	test('builds Elections > State > ... > Position > Name from a race slug', async () => {
		const trail = await buildBreadcrumb({
			displayName: 'Jane Doe',
			stateCode: 'CA',
			raceSlug: 'ca/los-angeles-county/mayor',
			positionLevel: 'COUNTY',
			positionName: 'Mayor',
		});
		const labels = trail.map((c) => c.label);
		expect(labels[0]).toBe('Home');
		expect(labels[1]).toBe('Elections');
		expect(labels[2]).toBe('California');
		expect(labels).toContain('Mayor');
		expect(labels[labels.length - 1]).toBe('Jane Doe');
	});
});
