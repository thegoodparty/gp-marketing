import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const component_locationEditorialBlock = {
	title: 'Location Editorial Block',
	name: 'component_locationEditorialBlock',
	description:
		'The "More about [Location]" prose section on location pages. The paragraphs are supplied per page at runtime; the Body Text field here is only a fallback for pages that supply none.',
	type: 'object',
	icon: getIcon('FileText'),
	fields: [
		{
			title: 'Header',
			name: 'locationEditorialBlockHeader',
			type: 'object',
			group: 'locationEditorialBlockHeader',
			fields: [
				{
					title: 'Heading',
					name: 'field_title',
					type: 'field_title',
					description: 'Supports location tokens, e.g. "More about [City]" or "More about [State]".',
				},
			],
		},
		{
			title: 'Body Text',
			name: 'locationEditorialBlockContent',
			type: 'object',
			group: 'locationEditorialBlockContent',
			fields: [
				{
					title: 'Fallback Body Text',
					name: 'block_summaryText',
					type: 'block_summaryText',
					description:
						'Only shown on pages that do not supply their own editorial copy. On the location templates every page supplies its own, so text typed here would be the same on every page in that family — leave it empty there.',
				},
			],
		},
		{
			title: 'Design Settings',
			name: 'locationEditorialBlockDesignSettings',
			type: 'object',
			group: 'locationEditorialBlockDesignSettings',
			fields: [
				{
					title: 'Background Color',
					name: 'field_blockColorCreamMidnight',
					type: 'field_blockColorCreamMidnight',
				},
			],
		},
		{
			title: 'Settings',
			name: 'componentSettings',
			type: 'componentSettings',
			group: 'componentSettings',
		},
	],
	preview: {
		select: {
			title: 'locationEditorialBlockHeader.field_title',
			_type: '_type',
		},
		prepare: (x: Record<string, unknown>) => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('FileText'),
				fallback: {
					previewTitle: 'locationEditorialBlockHeader.field_title',
					previewSubTitle: '*Location Editorial Block',
					title: 'Location Editorial Block',
				},
			};
			const title = resolveValue('title', component_locationEditorialBlock.preview.select, x);
			const subtitle = resolveValue('subtitle', component_locationEditorialBlock.preview.select, x);
			const media = resolveValue('media', component_locationEditorialBlock.preview.select, x);
			return handleReplacements(
				{
					title: infer.singletonTitle || title || undefined,
					subtitle: subtitle ? subtitle : infer.fallback['title'],
					media: media || infer.icon,
				},
				x,
				infer.fallback,
			);
		},
	},
	groups: [
		{
			title: 'Header',
			name: 'locationEditorialBlockHeader',
			icon: getIcon('TextFont'),
		},
		{
			title: 'Body Text',
			name: 'locationEditorialBlockContent',
			icon: getIcon('FileText'),
		},
		{
			title: 'Design Settings',
			name: 'locationEditorialBlockDesignSettings',
			icon: getIcon('ColorPalette'),
		},
		{
			title: 'Settings',
			name: 'componentSettings',
			icon: getIcon('Settings'),
		},
	],
};
