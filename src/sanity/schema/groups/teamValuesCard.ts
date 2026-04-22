import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const teamValuesCard = {
	title: 'Team Values Card',
	name: 'teamValuesCard',
	type: 'object',
	options: {
		collapsed: false,
		columns: 1,
	},
	icon: getIcon('Heart'),
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
			title: 'Card Color',
			name: 'field_componentColor6Colors',
			type: 'field_componentColor6Colors',
		},
		{
			title: 'Back Copy',
			name: 'field_backCopy',
			type: 'text',
			rows: 5,
			description: 'Content displayed on the back of the card after it is flipped.',
		},
		{
			title: 'Link',
			name: 'ctaActionWithShared',
			type: 'ctaActionWithShared',
		},
	],
	preview: {
		select: {
			title: 'field_title',
			_type: '_type',
		},
		prepare: (x: Record<string, unknown>) => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Heart'),
				fallback: {
					previewTitle: 'field_title',
					previewSubTitle: '*Team Values Card',
					title: 'Team Values Card',
				},
			};
			const title = resolveValue('title', teamValuesCard.preview.select, x);
			const subtitle = resolveValue('subtitle', teamValuesCard.preview.select, x);
			const media = resolveValue('media', teamValuesCard.preview.select, x);
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
