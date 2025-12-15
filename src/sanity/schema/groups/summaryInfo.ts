import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const summaryInfo = {
	title: 'Summary Info',
	name: 'summaryInfo',
	type: 'object',
	options: {
		collapsed: false,
		columns: 1,
	},
	icon: getIcon('TextFont'),
	fields: [
		{
			title: 'Overline',
			name: 'field_label',
			type: 'field_label',
		},
		{
			title: 'Heading',
			name: 'field_title',
			type: 'field_title',
		},
		{
			title: 'Body Text',
			name: 'block_summaryText',
			type: 'block_summaryText',
		},
		{
			title: 'Buttons',
			name: 'list_buttons',
			type: 'list_buttons',
		},
		{
			title: 'Caption',
			name: 'field_caption',
			type: 'field_caption',
		},
		{
			title: 'Text Size',
			name: 'field_textSize',
			type: 'field_textSize',
		},
	],
	preview: {
		select: {
			title: 'field_label',
			_type: '_type',
		},
		prepare: x => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('TextFont'),
				fallback: {},
			};
			const title = resolveValue('title', summaryInfo.preview.select, x);
			const subtitle = resolveValue('subtitle', summaryInfo.preview.select, x);
			const media = resolveValue('media', summaryInfo.preview.select, x);
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
