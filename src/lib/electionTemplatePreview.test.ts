import { describe, expect, test } from 'bun:test';
import { buildElectionTemplatePreviewPath } from '~/lib/electionTemplatePreview';

describe('buildElectionTemplatePreviewPath', () => {
	test('builds state location path', () => {
		expect(
			buildElectionTemplatePreviewPath('locationState', {
				field_electionTargetType: 'place',
				field_electionTargetSlug: 'ny',
			}),
		).toBe('/elections/ny');
	});

	test('builds county location path', () => {
		expect(
			buildElectionTemplatePreviewPath('locationCounty', {
				field_electionTargetType: 'place',
				field_electionTargetSlug: 'wi/adams-county',
			}),
		).toBe('/elections/wi/adams-county');
	});

	test('builds city location path', () => {
		expect(
			buildElectionTemplatePreviewPath('locationCity', {
				field_electionTargetType: 'place',
				field_electionTargetSlug: 'wi/adams-county/adams',
			}),
		).toBe('/elections/wi/adams-county/adams');
	});

	test('builds district location path', () => {
		expect(
			buildElectionTemplatePreviewPath('locationDistrict', {
				field_electionTargetType: 'place',
				field_electionTargetSlug: 'mn/minneapolis-public-school-district',
			}),
		).toBe('/elections/mn/minneapolis-public-school-district');
	});

	test('builds legacy location path', () => {
		expect(
			buildElectionTemplatePreviewPath('location', {
				field_electionTargetType: 'place',
				field_electionTargetSlug: 'ny/kings-county',
			}),
		).toBe('/elections/ny/kings-county');
	});

	test('builds position path with position slug', () => {
		expect(
			buildElectionTemplatePreviewPath('position', {
				field_electionTargetType: 'place',
				field_electionTargetSlug: 'ny',
				field_positionSlug: 'governor',
			}),
		).toBe('/elections/ny/position/governor');
	});

	test('builds candidate profile path', () => {
		expect(
			buildElectionTemplatePreviewPath('candidateProfile', {
				field_electionTargetType: 'candidate',
				field_electionTargetSlug: 'ny/albany/jane-doe',
			}),
		).toBe('/candidate/ny/albany/jane-doe');
	});

	test('builds person profile path', () => {
		expect(
			buildElectionTemplatePreviewPath('personProfile', {
				field_electionTargetType: 'person',
				field_electionTargetSlug: 'jane-doe-2f1c',
			}),
		).toBe('/people/jane-doe-2f1c');
	});
});
