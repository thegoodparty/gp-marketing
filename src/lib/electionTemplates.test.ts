import { describe, expect, test } from 'bun:test';
import { pickBestCustomTemplate, type ElectionTemplateContext } from '~/lib/electionTemplates';

const baseCtx: ElectionTemplateContext = {
	templateType: 'location',
	placeSlug: 'ny/kings/brooklyn',
};

describe('pickBestCustomTemplate', () => {
	test('prefers candidate target over place when template types match', () => {
		const docs = [
			{
				_id: 'place',
				field_enabled: true,
				field_priority: 1,
				field_electionTemplateType: 'candidateProfile' as const,
				list_targets: [{ field_electionTargetType: 'place' as const, field_electionTargetSlug: 'ny' }],
			},
			{
				_id: 'candidate',
				field_enabled: true,
				field_priority: 100,
				field_electionTemplateType: 'candidateProfile' as const,
				list_targets: [
					{ field_electionTargetType: 'candidate' as const, field_electionTargetSlug: 'jane-doe' },
				],
			},
		];
		const ctx: ElectionTemplateContext = {
			templateType: 'candidateProfile',
			candidateSlug: 'jane-doe',
			placeSlug: 'ny',
		};
		expect(pickBestCustomTemplate(docs, ctx)?._id).toBe('candidate');
	});

	test('prefers longer place slug over shorter', () => {
		const docs = [
			{
				_id: 'ny',
				field_enabled: true,
				field_priority: 1,
				field_electionTemplateType: 'location' as const,
				list_targets: [{ field_electionTargetType: 'place' as const, field_electionTargetSlug: 'ny' }],
			},
			{
				_id: 'ny-kings',
				field_enabled: true,
				field_priority: 50,
				field_electionTemplateType: 'location' as const,
				list_targets: [
					{ field_electionTargetType: 'place' as const, field_electionTargetSlug: 'ny/kings' },
				],
			},
		];
		expect(pickBestCustomTemplate(docs, baseCtx)?._id).toBe('ny-kings');
	});

	test('uses lower priority on tie', () => {
		const docs = [
			{
				_id: 'high-priority',
				field_enabled: true,
				field_priority: 200,
				field_electionTemplateType: 'location' as const,
				list_targets: [{ field_electionTargetType: 'place' as const, field_electionTargetSlug: 'ny' }],
			},
			{
				_id: 'low-priority',
				field_enabled: true,
				field_priority: 10,
				field_electionTemplateType: 'location' as const,
				list_targets: [{ field_electionTargetType: 'place' as const, field_electionTargetSlug: 'ny' }],
			},
		];
		const ctx: ElectionTemplateContext = { templateType: 'location', placeSlug: 'ny' };
		expect(pickBestCustomTemplate(docs, ctx)?._id).toBe('low-priority');
	});

	test('breaks score+priority ties on most-recent _updatedAt regardless of order', () => {
		const older = {
			_id: 'older',
			field_enabled: true,
			field_priority: 100,
			field_electionTemplateType: 'location' as const,
			_updatedAt: '2024-01-01T00:00:00Z',
			list_targets: [{ field_electionTargetType: 'place' as const, field_electionTargetSlug: 'ny' }],
		};
		const newer = {
			_id: 'newer',
			field_enabled: true,
			field_priority: 100,
			field_electionTemplateType: 'location' as const,
			_updatedAt: '2024-06-01T00:00:00Z',
			list_targets: [{ field_electionTargetType: 'place' as const, field_electionTargetSlug: 'ny' }],
		};
		const ctx: ElectionTemplateContext = { templateType: 'location', placeSlug: 'ny' };
		expect(pickBestCustomTemplate([older, newer], ctx)?._id).toBe('newer');
		expect(pickBestCustomTemplate([newer, older], ctx)?._id).toBe('newer');
	});

	test('ignores disabled templates', () => {
		const docs = [
			{
				_id: 'disabled',
				field_enabled: false,
				field_priority: 1,
				field_electionTemplateType: 'location' as const,
				list_targets: [{ field_electionTargetType: 'place' as const, field_electionTargetSlug: 'ny' }],
			},
		];
		const ctx: ElectionTemplateContext = { templateType: 'location', placeSlug: 'ny' };
		expect(pickBestCustomTemplate(docs, ctx)).toBeNull();
	});

	test('uses raceSlug over positionSlug for position target when both are supplied', () => {
		const docs = [
			{
				_id: 'by-race-slug',
				field_enabled: true,
				field_priority: 100,
				field_electionTemplateType: 'position' as const,
				list_targets: [{ field_electionTargetType: 'position' as const, field_electionTargetSlug: 'mayor-2024' }],
			},
			{
				_id: 'by-position-slug',
				field_enabled: true,
				field_priority: 100,
				field_electionTemplateType: 'position' as const,
				list_targets: [{ field_electionTargetType: 'position' as const, field_electionTargetSlug: 'mayor' }],
			},
		];
		const ctx: ElectionTemplateContext = {
			templateType: 'position',
			raceSlug: 'mayor-2024',
			positionSlug: 'mayor',
		};
		expect(pickBestCustomTemplate(docs, ctx)?._id).toBe('by-race-slug');
	});
});
