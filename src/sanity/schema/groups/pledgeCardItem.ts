import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const pledgeCardItem = {
	title: 'Pledge Card Item',
	name: 'pledgeCardItem',
	type: 'object',
	options: {
		collapsed: false,
		columns: 1,
	},
	icon: getIcon('Checkbox'),
	fields: [
		{
			title: 'Icon',
			name: 'field_icon',
			type: 'field_icon',
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
			title: 'Button',
			name: 'ctaActionWithShared',
			type: 'ctaActionWithShared',
		},
	],
	preview: {
		select: {
			title: 'field_title',
			_type: '_type',
			subtitle: 'block_summaryText.0.children.0.text',
		},
		prepare: x => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Checkbox'),
				fallback: {
					previewTitle: 'field_title',
					previewSubTitle: 'block_summaryText.0.children.0.text',
					title: 'Pledge Card Item',
				},
			};
			const title = resolveValue('title', pledgeCardItem.preview.select, x);
			const subtitle = resolveValue('subtitle', pledgeCardItem.preview.select, x);
			const media = resolveValue('media', pledgeCardItem.preview.select, x);
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
