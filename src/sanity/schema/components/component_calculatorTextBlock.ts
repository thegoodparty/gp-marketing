import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const component_calculatorTextBlock = {
	title: 'Calculator Text Block',
	name: 'component_calculatorTextBlock',
	type: 'object',
	icon: getIcon('Calculator'),
	fields: [
		{
			title: 'Text',
			name: 'summaryInfo',
			type: 'summaryInfo',
			group: 'summaryInfo',
		},
		{
			title: 'Design Settings',
			name: 'calculatorTextBlockDesignSettings',
			type: 'calculatorTextBlockDesignSettings',
			group: 'calculatorTextBlockDesignSettings',
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
		prepare: x => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Calculator'),
				fallback: {
					previewTitle: 'summaryInfo.field_title',
					previewSubTitle: '*Calculator Text Block',
					title: 'Calculator Text Block',
				},
			};
			const title = resolveValue('title', component_calculatorTextBlock.preview.select, x);
			const subtitle = resolveValue('subtitle', component_calculatorTextBlock.preview.select, x);
			const media = resolveValue('media', component_calculatorTextBlock.preview.select, x);
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
		{ title: 'Text', name: 'summaryInfo', icon: getIcon('TextFont') },
		{ title: 'Design Settings', name: 'calculatorTextBlockDesignSettings', icon: getIcon('ColorPalette') },
		{ title: 'Settings', name: 'componentSettings', icon: getIcon('Settings') },
	],
};
