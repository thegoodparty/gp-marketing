import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const component_electionsPositionContentBlock = {
	title: 'Elections Position Content Block',
	name: 'component_electionsPositionContentBlock',
	description: 'Content block for Position Pages with card, grid items, and bottom sections.',
	type: 'object',
	icon: getIcon('FileText'),
	fields: [
		{
			title: 'Design Settings',
			name: 'electionsPositionContentBlockDesignSettings',
			type: 'object',
			fields: [
				{
					title: 'Background Color',
					name: 'field_blockColorCreamMidnight',
					type: 'string',
					options: {
						list: [
							{ title: 'Cream', value: 'Cream' },
							{ title: 'Midnight', value: 'MidnightDark' },
						],
					},
				},
			],
			group: 'electionsPositionContentBlockDesignSettings',
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
			_type: '_type',
		},
		prepare: x => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('FileText'),
				fallback: {
					previewTitle: '*Elections Position Content Block',
					previewSubTitle: '*Elections Position Content Block',
					title: 'Elections Position Content Block',
				},
			};
			const title = resolveValue('title', component_electionsPositionContentBlock.preview.select, x);
			const subtitle = resolveValue('subtitle', component_electionsPositionContentBlock.preview.select, x);
			const media = resolveValue('media', component_electionsPositionContentBlock.preview.select, x);
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
			title: 'Design Settings',
			name: 'electionsPositionContentBlockDesignSettings',
			icon: getIcon('ColorPalette'),
		},
		{
			title: 'Settings',
			name: 'componentSettings',
			icon: getIcon('Settings'),
		},
	],
};
