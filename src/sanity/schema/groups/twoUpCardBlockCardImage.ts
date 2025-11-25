import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const twoUpCardBlockCardImage = {
	title: 'Two Up Card Block Card Image',
	name: 'twoUpCardBlockCardImage',
	type: 'object',
	options: {
		collapsed: false,
		columns: 1,
	},
	icon: getIcon('Image'),
	fields: [
		{
			title: 'Image',
			name: 'img_twoUpCardBlockCardImage',
			type: 'img_twoUpCardBlockCardImage',
		},
		{
			title: 'Show Full Image?',
			name: 'showFullImage',
			type: 'boolean',
			initialValue: false,
		},
	],
	preview: {
		select: {
			media: 'img_twoUpCardBlockCardImage',
		},
		prepare: x => {
			const infer = {
				name: 'Image',
				singletonTitle: null,
				icon: getIcon('Image'),
				fallback: {},
			};
			const title = resolveValue('title', twoUpCardBlockCardImage.preview.select, x);
			const subtitle = resolveValue('subtitle', twoUpCardBlockCardImage.preview.select, x);
			const media = resolveValue('media', twoUpCardBlockCardImage.preview.select, x);
			return handleReplacements(
				{ title: infer.singletonTitle || title || infer.name, subtitle: subtitle || media?.alt, media: media || infer.icon },
				x,
				infer.fallback,
			);
		},
	},
};
