import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const stepperBlockItemMedia = {
	title: 'Stepper Block Item Media',
	name: 'stepperBlockItemMedia',
	type: 'object',
	options: {
		collapsed: false,
		columns: 1,
	},
	icon: getIcon('Image'),
	fields: [
		{
			title: 'Image',
			name: 'img_image',
			type: 'img_image',
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
			media: 'img_image',
		},
		prepare: x => {
			const infer = {
				name: 'Image',
				singletonTitle: null,
				icon: getIcon('Image'),
				fallback: {},
			};
			const title = resolveValue('title', stepperBlockItemMedia.preview.select, x);
			const subtitle = resolveValue('subtitle', stepperBlockItemMedia.preview.select, x);
			const media = resolveValue('media', stepperBlockItemMedia.preview.select, x);
			return handleReplacements(
				{ title: infer.singletonTitle || title || infer.name, subtitle: subtitle || media?.alt, media: media || infer.icon },
				x,
				infer.fallback,
			);
		},
	},
};
