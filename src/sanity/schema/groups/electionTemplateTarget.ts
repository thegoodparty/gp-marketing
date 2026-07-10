import { field_electionTargetSlug, field_electionTargetType } from '../fields/field_electionTemplateType.ts';

export const electionTemplateTarget = {
	name: 'electionTemplateTarget',
	title: 'Template Target',
	type: 'object',
	fields: [
		{
			...field_electionTargetType,
			name: 'field_electionTargetType',
		},
		{
			...field_electionTargetSlug,
			name: 'field_electionTargetSlug',
		},
	],
	preview: {
		select: {
			targetType: 'field_electionTargetType',
			slug: 'field_electionTargetSlug',
		},
		prepare: (x: { targetType?: string; slug?: string }) => ({
			title: x.slug ?? 'Target',
			subtitle: x.targetType ?? 'target',
		}),
	},
};
