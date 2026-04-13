import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const teamValuesBlockContent = {
	title: 'Team Values Block Content',
	name: 'teamValuesBlockContent',
	type: 'object',
	options: {
		collapsed: false,
		columns: 1,
	},
	icon: getIcon('Heart'),
	fields: [
		{
			title: 'Values Cards',
			name: 'list_teamValuesCards',
			type: 'list_teamValuesCards',
		},
	],
	preview: {
		select: {
			list: 'list_teamValuesCards',
			_type: '_type',
		},
		prepare: (x: Record<string, unknown>) => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Heart'),
				fallback: {},
			};
			const title = resolveValue('title', teamValuesBlockContent.preview.select, x);
			const subtitle = resolveValue('subtitle', teamValuesBlockContent.preview.select, x);
			const media = resolveValue('media', teamValuesBlockContent.preview.select, x);
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
