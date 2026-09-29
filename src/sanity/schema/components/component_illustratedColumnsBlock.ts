import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const component_illustratedColumnsBlock = {
	title: 'Illustrated Columns Block',
	name: 'component_illustratedColumnsBlock',
	description:
		'A heading over two to four equal columns divided by thin lines. Each column is an uploaded illustration, a heading, a short sentence and a text link. Built for the "Are you ready for [Location]\'s next election?" voter-readiness section on the location pages; the Icon Content Block is the one with icons in coloured circles.',
	type: 'object',
	icon: getIcon('Grid'),
	fields: [
		{
			title: 'Text',
			name: 'summaryInfo',
			type: 'summaryInfo',
			group: 'summaryInfo',
			description: 'The heading and intro above the columns. Supports location tokens, e.g. "Are you ready for [Location]\'s next election?".',
		},
		{
			title: 'Columns',
			name: 'list_illustratedColumns',
			type: 'array',
			group: 'illustratedColumns',
			description: 'Usually one item per column. Extra items wrap onto a second row.',
			validation: (R: any) => R.min(2).error('Min 2').max(8).error('Max 8'),
			of: [
				{
					title: 'Column',
					name: 'illustratedColumn',
					type: 'object',
					icon: getIcon('Image'),
					fields: [
						{
							title: 'Illustration',
							name: 'img_image',
							type: 'img_image',
							description: 'Shown at 112px square, so upload a square image with a transparent or matching background.',
						},
						{
							title: 'Heading',
							name: 'field_title',
							type: 'field_title',
						},
						{
							title: 'Description',
							name: 'field_description',
							type: 'text',
							rows: 3,
							description: 'One short sentence. Supports location tokens.',
						},
						{
							title: 'Link',
							name: 'button',
							type: 'button',
							description: 'Rendered as a small blue text link with an arrow, whatever hierarchy is chosen.',
						},
					],
					preview: {
						select: {
							title: 'field_title',
							subtitle: 'field_description',
							media: 'img_image',
						},
					},
				},
			],
		},
		{
			title: 'Design Settings',
			name: 'illustratedColumnsBlockDesignSettings',
			type: 'object',
			group: 'illustratedColumnsBlockDesignSettings',
			fields: [
				{
					title: 'Column Layout',
					name: 'field_columnLayout234Columns',
					type: 'field_columnLayout234Columns',
					initialValue: '3Col',
				},
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
			title: 'summaryInfo.field_title',
			_type: '_type',
		},
		prepare: (x: Record<string, unknown>) => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Grid'),
				fallback: {
					previewTitle: 'summaryInfo.field_title',
					previewSubTitle: '*Illustrated Columns Block',
					title: 'Illustrated Columns Block',
				},
			};
			const title = resolveValue('title', component_illustratedColumnsBlock.preview.select, x);
			const subtitle = resolveValue('subtitle', component_illustratedColumnsBlock.preview.select, x);
			const media = resolveValue('media', component_illustratedColumnsBlock.preview.select, x);
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
			title: 'Text',
			name: 'summaryInfo',
			icon: getIcon('TextFont'),
		},
		{
			title: 'Columns',
			name: 'illustratedColumns',
			icon: getIcon('Grid'),
		},
		{
			title: 'Design Settings',
			name: 'illustratedColumnsBlockDesignSettings',
			icon: getIcon('ColorPalette'),
		},
		{
			title: 'Settings',
			name: 'componentSettings',
			icon: getIcon('Settings'),
		},
	],
};
