import { describe, expect, test } from 'bun:test';
import { buildElectionTemplatePreviewPath } from '~/lib/electionTemplatePreview';

describe('buildElectionTemplatePreviewPath', () => {
	test('builds location path', () => {
		expect(
			buildElectionTemplatePreviewPath('location', {
				field_electionTargetType: 'place',
				field_electionTargetSlug: 'ny',
			}),
		).toBe('/elections/ny');
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
