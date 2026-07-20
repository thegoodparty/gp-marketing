import { getIcon } from '../../utils/getIcon.tsx';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { resolveValue } from '../../utils/resolveValue.ts';
import { field_electionTemplateType } from '../fields/field_electionTemplateType.ts';

const CUSTOM_INSTRUCTIONS = `Custom templates override the global template when their targets match the current page.

Location templates are split by level (state, county, city, district). Choose the level that matches the pages you want to override.

Matching rules (most specific wins, then lower Priority number):
1. Candidate slug beats position slug beats place slug
2. Longer place slug beats shorter (e.g. ny/kings/brooklyn beats ny)
3. Lower Priority wins ties

On any error in a custom template, the site uses the corresponding global template, then the code default.

Clone workflow: duplicate a global template document, change type to custom, add targets, and edit sections.

Supported tokens in plain text fields:
- Location: [State], [County], [City], [District]
- Position / candidates: [office name], [State], [County or City], [office], [location]
- Profile: [candidate name], [office name]`;

export const goodpartyOrg_customTemplate = {
	title: 'Custom Election Template',
	name: 'goodpartyOrg_customTemplate',
	type: 'document',
	icon: getIcon('Documents'),
	fields: [
		{
			name: 'field_title',
			title: 'Title',
			type: 'string',
			description: 'Internal label, e.g. "NY + TX state landing variant".',
			validation: (rule: { required(): unknown }) => rule.required(),
		},
		{
			...field_electionTemplateType,
			name: 'field_electionTemplateType',
		},
		{
			name: 'field_enabled',
			title: 'Enabled',
			type: 'boolean',
			initialValue: true,
			description: 'Disabled templates are ignored at runtime.',
		},
		{
			name: 'field_priority',
			title: 'Priority',
			type: 'number',
			initialValue: 100,
			description: 'Lower number wins when multiple custom templates match. Default 100.',
		},
		{
			name: 'field_instructions',
			title: 'How to use',
			type: 'text',
			rows: 10,
			initialValue: CUSTOM_INSTRUCTIONS,
			readOnly: true,
		},
		{
			name: 'ref_sourceGlobalTemplate',
			title: 'Cloned from Global Template',
			type: 'reference',
			to: [{ type: 'goodpartyOrg_globalTemplate' }],
			description: 'Optional lineage when this custom template was cloned from a global template.',
		},
		{
			name: 'list_targets',
			title: 'Targets',
			type: 'array',
			of: [{ type: 'electionTemplateTarget' }],
			description: 'One or more targets that use this template (e.g. NY, TX, OH state pages).',
			validation: (rule: { required(): { min(n: number): unknown } }) => rule.required().min(1),
		},
		{
			title: 'Preview Target',
			name: 'previewTarget',
			type: 'electionTemplatePreviewTarget',
			group: 'previewTarget',
		},
		{
			title: 'Page Sections',
			name: 'pageSections',
			type: 'pageSections',
			group: 'pageSections',
		},
	],
	groups: [
		{
			title: 'Overview',
			name: 'overview',
			icon: getIcon('InfoOutline'),
			default: true,
		},
		{
			title: 'Preview',
			name: 'previewTarget',
			icon: getIcon('EyeOpen'),
		},
		{
			title: 'Page Sections',
			name: 'pageSections',
			icon: getIcon('PageBreak'),
		},
	],
	preview: {
		select: {
			title: 'field_title',
			templateType: 'field_electionTemplateType',
			enabled: 'field_enabled',
			targetCount: 'list_targets',
			_type: '_type',
		},
		prepare: (x: Record<string, unknown> & { targetCount?: unknown[] }) => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Documents'),
				fallback: { title: 'Custom Election Template' },
			};
			const title = resolveValue('title', goodpartyOrg_customTemplate.preview.select, x);
			const templateType = x['templateType'] as string | undefined;
			const count = Array.isArray(x.targetCount) ? x.targetCount.length : 0;
			const enabled = x['enabled'] === false ? 'disabled' : 'enabled';
			return handleReplacements(
				{
					title: title || infer.fallback.title,
					subtitle: `${templateType ?? 'custom'} · ${count} target(s) · ${enabled}`,
					media: infer.icon,
				},
				x,
				infer.fallback,
			);
		},
	},
	options: {
		single: false,
	},
};
