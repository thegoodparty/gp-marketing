import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const component_profileContentBlock = {
	title: 'Profile Content Block',
	name: 'component_profileContentBlock',
	type: 'object',
	icon: getIcon('FileText'),
	fields: [
		{
			title: 'Design Settings',
			name: 'profileContentBlockDesignSettings',
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
			group: 'profileContentBlockDesignSettings',
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
					previewTitle: '*Profile Content Block',
					previewSubTitle: '*Profile Content Block',
					title: 'Profile Content Block',
				},
			};
			const title = resolveValue('title', component_profileContentBlock.preview.select, x);
			const subtitle = resolveValue('subtitle', component_profileContentBlock.preview.select, x);
			const media = resolveValue('media', component_profileContentBlock.preview.select, x);
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
			name: 'profileContentBlockDesignSettings',
			icon: getIcon('ColorPalette'),
		},
		{
			title: 'Settings',
			name: 'componentSettings',
			icon: getIcon('Settings'),
		},
	],
};
