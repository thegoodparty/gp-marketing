import { describe, expect, test } from 'bun:test';
import {
	buildCandidatesSiteUrl,
	buildProfileUrl,
	extractProductRaceIdFromCandidatesHtml,
	isPledgedCandidatesPage,
	positionElectionIdFromBrHash,
	toCsvRow,
	vanitySlugFromCandidacySlug,
	type AuditRow,
} from './lib/claimed-profile-audit';

describe('vanitySlugFromCandidacySlug', () => {
	test('returns first path segment', () => {
		expect(vanitySlugFromCandidacySlug('heather-marie-wilson/washington-state-senate-district-43')).toBe(
			'heather-marie-wilson',
		);
	});
});

describe('positionElectionIdFromBrHash', () => {
	test('decodes Wilson elections race', () => {
		const id = 'Z2lkOi8vYmFsbG90LWZhY3RvcnkvUG9zaXRpb25FbGVjdGlvbi8yMDI0Mzc5';
		expect(positionElectionIdFromBrHash(id)).toBe('2024379');
	});

	test('decodes Wilson product race', () => {
		const id = 'Z2lkOi8vYmFsbG90LWZhY3RvcnkvUG9zaXRpb25FbGVjdGlvbi8yMDI0Mzc0';
		expect(positionElectionIdFromBrHash(id)).toBe('2024374');
	});
});

describe('candidates page parsing', () => {
	const sampleHtml =
		'pledged\\":true,raceId\\":\\"Z2lkOi8vYmFsbG90LWZhY3RvcnkvUG9zaXRpb25FbGVjdGlvbi8yMDI0Mzc0\\"';

	test('isPledgedCandidatesPage', () => {
		expect(isPledgedCandidatesPage(sampleHtml)).toBe(true);
		expect(isPledgedCandidatesPage('pledged":false')).toBe(false);
	});

	test('extractProductRaceIdFromCandidatesHtml escaped JSON', () => {
		expect(extractProductRaceIdFromCandidatesHtml(sampleHtml)).toBe(
			'Z2lkOi8vYmFsbG90LWZhY3RvcnkvUG9zaXRpb25FbGVjdGlvbi8yMDI0Mzc0',
		);
	});

	test('extractProductRaceIdFromCandidatesHtml plain JSON', () => {
		const html = '"raceId":"Z2lkOi8vYmFsbG90LWZhY3RvcnkvUG9zaXRpb25FbGVjdGlvbi8yMDIxMzU3"';
		expect(extractProductRaceIdFromCandidatesHtml(html)).toBe(
			'Z2lkOi8vYmFsbG90LWZhY3RvcnkvUG9zaXRpb25FbGVjdGlvbi8yMDIxMzU3',
		);
	});
});

describe('buildProfileUrl', () => {
	test('builds goodparty candidate URL', () => {
		expect(buildProfileUrl('https://goodparty.org', 'a/b')).toBe('https://goodparty.org/candidate/a/b');
	});
});

describe('buildCandidatesSiteUrl', () => {
	test('builds candidates subdomain URL', () => {
		expect(buildCandidatesSiteUrl('heather-marie-wilson')).toBe(
			'https://candidates.goodparty.org/heather-marie-wilson',
		);
	});
});

describe('toCsvRow', () => {
	test('escapes quotes in fields', () => {
		const row: AuditRow = {
			slug: 'test/candidate',
			firstName: 'Heather-Marie',
			lastName: 'Wilson',
			electionsRaceId: 'abc',
			lookupStatus: 'lookup_failure',
			mismatchConfirmed: true,
			electionsPositionElection: '2024379',
			productPositionElection: '2024374',
			pledged: true,
			profileUrl: 'https://goodparty.org/candidate/test/candidate',
		};
		const csv = toCsvRow(row);
		expect(csv).toContain('Heather-Marie');
		expect(csv).toContain('2024379');
		expect(csv).toContain('2024374');
	});
});
