import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const imageContentSection = {
	title: 'Image',
	name: 'imageContentSection',
	type: 'object',
	options: {
		collapsed: false,
		columns: 1,
	},
	icon: getIcon('ImageCopy'),
	fields: [
		{
			title: 'Image',
			name: 'img_image',
			type: 'img_image',
		},
		{
			title: 'Caption',
			name: 'field_caption',
			type: 'field_caption',
		},
		{
			title: 'Display Inline',
			name: 'field_displayInline',
			type: 'field_displayInline',
		},
		{
			title: 'Alignment',
			name: 'field_inlineMediaAlignmentRightLeft',
			type: 'field_inlineMediaAlignmentRightLeft',
			hidden: function (ctx) {
				return ![true].includes(ctx.parent?.field_displayInline);
			},
		},
		{
			title: 'Aspect Ratio',
			name: 'field_aspectRatio',
			type: 'field_aspectRatio',
		},
	],
	preview: {
		select: {
			media: 'img_image',
		},
		prepare: x => {
			const infer = {
				name: 'Image',
				singletonTitle: null,
				icon: getIcon('ImageCopy'),
				fallback: {
					previewSubTitle: '*Image',
					title: 'Image',
				},
			};
			const title = resolveValue('title', imageContentSection.preview.select, x);
			const subtitle = resolveValue('subtitle', imageContentSection.preview.select, x);
			const media = resolveValue('media', imageContentSection.preview.select, x);
			return handleReplacements(
				{ title: infer.singletonTitle || title || infer.name, subtitle: subtitle || media?.alt, media: media || infer.icon },
				x,
				infer.fallback,
			);
		},
	},
};
