import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const component_breadcrumbBlock = {
	title: 'Breadcrumb Block',
	name: 'component_breadcrumbBlock',
	type: 'object',
	icon: getIcon('ArrowRight'),
	fields: [
		{
			title: 'Design Settings',
			name: 'breadcrumbBlockDesignSettings',
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
			group: 'breadcrumbBlockDesignSettings',
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
				icon: getIcon('ArrowRight'),
				fallback: {
					previewTitle: '*Breadcrumb Block',
					previewSubTitle: '*Breadcrumb Block',
					title: 'Breadcrumb Block',
				},
			};
			const title = resolveValue('title', component_breadcrumbBlock.preview.select, x);
			const subtitle = resolveValue('subtitle', component_breadcrumbBlock.preview.select, x);
			const media = resolveValue('media', component_breadcrumbBlock.preview.select, x);
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
			name: 'breadcrumbBlockDesignSettings',
			icon: getIcon('ColorPalette'),
		},
		{
			title: 'Settings',
			name: 'componentSettings',
			icon: getIcon('Settings'),
		},
	],
};
