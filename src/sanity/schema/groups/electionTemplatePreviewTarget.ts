import { field_electionTargetSlug, field_electionTargetType } from '../fields/field_electionTemplateType.ts';

export const electionTemplatePreviewTarget = {
	name: 'electionTemplatePreviewTarget',
	title: 'Preview Target',
	type: 'object',
	description:
		'Used by Studio preview to open a real page URL. Set a representative slug for the page family you are editing.',
	fields: [
		{
			...field_electionTargetType,
			name: 'field_electionTargetType',
			title: 'Preview Target Type',
		},
		{
			...field_electionTargetSlug,
			name: 'field_electionTargetSlug',
			title: 'Preview Slug',
		},
		{
			name: 'field_positionSlug',
			title: 'Position Slug (optional)',
			type: 'string',
			description: 'Route position segment when previewing position or candidates pages, e.g. `governor`.',
		},
	],
};
