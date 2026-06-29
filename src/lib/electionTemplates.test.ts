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
});
