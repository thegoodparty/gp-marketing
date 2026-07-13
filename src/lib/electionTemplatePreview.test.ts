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
				field_electionTargetSlug: 'ny/kings',
			}),
		).toBe('/elections/ny/kings');
	});

	test('builds city location path', () => {
		expect(
			buildElectionTemplatePreviewPath('locationCity', {
				field_electionTargetType: 'place',
				field_electionTargetSlug: 'ny/kings/brooklyn',
			}),
		).toBe('/elections/ny/kings/brooklyn');
	});

	test('builds district location path', () => {
		expect(
			buildElectionTemplatePreviewPath('locationDistrict', {
				field_electionTargetType: 'place',
				field_electionTargetSlug: 'tx/congressional-district-1',
			}),
		).toBe('/elections/tx/congressional-district-1');
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
});
