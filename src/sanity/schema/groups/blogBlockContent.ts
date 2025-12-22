import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const blogBlockContent = {
	title: 'Blog Block Content',
	name: 'blogBlockContent',
	type: 'object',
	options: {
		collapsed: false,
		columns: 1,
	},
	icon: getIcon('Filter'),
	fields: [
		{
			title: 'Latest Articles By',
			name: 'field_blogBlockContentOptions',
			type: 'field_blogBlockContentOptions',
		},
		{
			title: 'Select a Topic',
			name: 'ref_selectATopic',
			type: 'ref_selectATopic',
			hidden: function (ctx) {
				return !['Latest by Topic'].includes(ctx.parent?.field_blogBlockContentOptions);
			},
		},
		{
			title: 'Select a Category',
			name: 'ref_selectACategory',
			type: 'ref_selectACategory',
			hidden: function (ctx) {
				return !['Latest by Category'].includes(ctx.parent?.field_blogBlockContentOptions);
			},
		},
	],
	preview: {
		select: {
			title: 'field_blogBlockContentOptions',
			_type: '_type',
		},
		prepare: x => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Filter'),
				fallback: {},
			};
			const title = resolveValue('title', blogBlockContent.preview.select, x);
			const subtitle = resolveValue('subtitle', blogBlockContent.preview.select, x);
			const media = resolveValue('media', blogBlockContent.preview.select, x);
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
