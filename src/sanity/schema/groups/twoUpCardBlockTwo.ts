import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const twoUpCardBlockTwo = {
	title: 'Two Up Card Block Two',
	name: 'twoUpCardBlockTwo',
	type: 'object',
	options: {
		collapsed: false,
		columns: 1,
	},
	icon: getIcon('AlignBoxMiddleCenter'),
	fields: [
		{
			title: 'Card Type',
			name: 'field_twoUpCardBlockCardType',
			type: 'field_twoUpCardBlockCardType',
		},
		{
			title: 'Value Proposition Card',
			name: 'valuePropositionCard',
			type: 'valuePropositionCard',
			hidden: function (ctx) {
				return !['ValueProposition'].includes(ctx.parent?.field_twoUpCardBlockCardType);
			},
		},
		{
			title: 'Quote',
			name: 'ref_quoteReference',
			type: 'ref_quoteReference',
			hidden: function (ctx) {
				return !['Quote'].includes(ctx.parent?.field_twoUpCardBlockCardType);
			},
		},
		{
			title: 'Image',
			name: 'img_twoUpCardBlockCardImage',
			type: 'img_twoUpCardBlockCardImage',
			hidden: function (ctx) {
				return !['Image'].includes(ctx.parent?.field_twoUpCardBlockCardType);
			},
		},
	],
	preview: {
		select: {
			title: 'field_twoUpCardBlockCardType',
			_type: '_type',
		},
		prepare: x => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('AlignBoxMiddleCenter'),
				fallback: {},
			};
			const title = resolveValue('title', twoUpCardBlockTwo.preview.select, x);
			const subtitle = resolveValue('subtitle', twoUpCardBlockTwo.preview.select, x);
			const media = resolveValue('media', twoUpCardBlockTwo.preview.select, x);
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
