import { getIcon } from '../../utils/getIcon.tsx';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { resolveValue } from '../../utils/resolveValue.ts';
import { field_electionTemplateType } from '../fields/field_electionTemplateType.ts';

const EDITOR_INSTRUCTIONS = `Global templates are the site-wide default for each election page family.

Location pages have separate globals for state, county, city, and district index pages.

If a custom template matches the current page but has an error, the site falls back to this global template.
If this global template is missing or invalid, the site falls back to the built-in code default (same as launch).

Supported tokens in plain text fields:
- Location: [State], [County], [City], [District]
- Position / candidates: [office name], [State], [County or City], [office], [location]
- Profile: [candidate name], [office name]

Preview: set Preview Target to a real slug so the iframe opens an example page.`;

export const goodpartyOrg_globalTemplate = {
	title: 'Global Election Template',
	name: 'goodpartyOrg_globalTemplate',
	type: 'document',
	icon: getIcon('Template'),
	fields: [
		{
			name: 'field_title',
			title: 'Title',
			type: 'string',
			description: 'Internal label for editors.',
		},
		{
			...field_electionTemplateType,
			name: 'field_electionTemplateType',
			readOnly: true,
			description: 'Fixed for this template. Determines which election page family it controls.',
		},
		{
			name: 'field_instructions',
			title: 'How to use',
			type: 'text',
			rows: 8,
			initialValue: EDITOR_INSTRUCTIONS,
			readOnly: true,
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
			_type: '_type',
		},
		prepare: (x: Record<string, unknown>) => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Template'),
				fallback: { title: 'Global Election Template' },
			};
			const title = resolveValue('title', goodpartyOrg_globalTemplate.preview.select, x);
			const templateType = x['templateType'] as string | undefined;
			return handleReplacements(
				{
					title: title || infer.fallback.title,
					subtitle: templateType ? `Global · ${templateType}` : 'Global template',
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
