import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const component_teamValuesBlock = {
	title: 'Team Values Block',
	name: 'component_teamValuesBlock',
	type: 'object',
	icon: getIcon('Heart'),
	fields: [
		{
			title: 'Text',
			name: 'summaryInfo',
			type: 'summaryInfo',
			group: 'summaryInfo',
		},
		{
			title: 'Values Cards',
			name: 'teamValuesBlockContent',
			type: 'teamValuesBlockContent',
			group: 'teamValuesBlockContent',
		},
		{
			title: 'Design Settings',
			name: 'teamValuesBlockDesignSettings',
			type: 'teamValuesBlockDesignSettings',
			group: 'teamValuesBlockDesignSettings',
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
				icon: getIcon('Heart'),
				fallback: {
					previewTitle: 'summaryInfo.field_title',
					previewSubTitle: '*Team Values Block',
					title: 'Team Values Block',
				},
			};
			const title = resolveValue('title', component_teamValuesBlock.preview.select, x);
			const subtitle = resolveValue('subtitle', component_teamValuesBlock.preview.select, x);
			const media = resolveValue('media', component_teamValuesBlock.preview.select, x);
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
			title: 'Values Cards',
			name: 'teamValuesBlockContent',
			icon: getIcon('Heart'),
		},
		{
			title: 'Design Settings',
			name: 'teamValuesBlockDesignSettings',
			icon: getIcon('ColorPalette'),
		},
		{
			title: 'Settings',
			name: 'componentSettings',
			icon: getIcon('Settings'),
		},
	],
};
