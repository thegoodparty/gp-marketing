import { describe, expect, test } from 'bun:test';
import type { PersonItem, PersonOfficeHolder, PublicPersonProfile } from '~/types/people';
import { buildPersonSlug, composeView, extractPersonId } from './peopleProfile';

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
					{ issueId: 'i1', title: 'Housing', description: 'More homes', visible: true, transparency: 'Verified', sortOrder: 0 },
					{ issueId: 'i2', title: 'Hidden', description: null, visible: false, transparency: null, sortOrder: 1 },
					{ issueId: 'i3', title: null, description: null, visible: true, transparency: null, sortOrder: 2 },
				],
			}),
		);
		expect(view.issues.map((i) => i.id)).toEqual(['i1']);
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

	test('canonicalSlug is derived from the spine name, not the overlay display name', () => {
		const view = composeView(
			PID,
			makePerson({ fullName: 'Jane Doe' }),
			makeOverlay({ displayName: 'Councilmember Doe' }),
		);
		expect(view.canonicalSlug).toBe(`jane-doe-${PID}`);
		expect(view.initials).toBe('CD');
	});

	test('falls back to a generic name when neither spine nor overlay names exist', () => {
		const view = composeView(PID, null, null);
		expect(view.displayName).toBe('Public Official');
		expect(view.claimed).toBe(false);
		// No civics rows and no candidacy reads as a candidate by default.
		expect(view.persona).toBe('candidate');
	});
});
