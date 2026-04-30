import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const teamValuesBlockDesignSettings = {
	title: 'Team Values Block Design Settings',
	name: 'teamValuesBlockDesignSettings',
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
	],
	preview: {
		select: {
			title: 'field_blockColorCreamMidnight',
			_type: '_type',
		},
		prepare: (x: Record<string, unknown>) => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('ColorPalette'),
				fallback: {},
			};
			const title = resolveValue('title', teamValuesBlockDesignSettings.preview.select, x);
			const subtitle = resolveValue('subtitle', teamValuesBlockDesignSettings.preview.select, x);
			const media = resolveValue('media', teamValuesBlockDesignSettings.preview.select, x);
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
