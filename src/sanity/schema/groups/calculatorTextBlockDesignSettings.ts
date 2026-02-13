import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const calculatorTextBlockDesignSettings = {
	title: 'Calculator Text Block Design Settings',
	name: 'calculatorTextBlockDesignSettings',
	type: 'object',
	options: {
		collapsed: false,
		columns: 1,
	},
	icon: getIcon('ColorPalette'),
	fields: [
		{
			title: 'Block Color',
			name: 'field_blockColorCreamMidnight',
			type: 'field_blockColorCreamMidnight',
		},
		{
			title: 'Calculator Position',
			name: 'field_calculatorLayout',
			type: 'field_calculatorLayout',
		},
	],
	preview: {
		select: {
			title: 'field_blockColorCreamMidnight',
			_type: '_type',
		},
		prepare: x => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('ColorPalette'),
				fallback: {},
			};
			const title = resolveValue('title', calculatorTextBlockDesignSettings.preview.select, x);
			const subtitle = resolveValue('subtitle', calculatorTextBlockDesignSettings.preview.select, x);
			const media = resolveValue('media', calculatorTextBlockDesignSettings.preview.select, x);
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
};
