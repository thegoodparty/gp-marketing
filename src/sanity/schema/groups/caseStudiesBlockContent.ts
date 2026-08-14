import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const caseStudiesBlockContent = {
	title: 'Case Studies Block Content',
	name: 'caseStudiesBlockContent',
	type: 'object',
	options: {
		collapsed: false,
		columns: 1,
	},
	icon: getIcon('Filter'),
	fields: [
		{
			title: 'Show See More Button',
			name: 'field_showSeeMoreButton',
			type: 'field_showSeeMoreButton',
		},
	],
	preview: {
		select: {
			title: 'field_showSeeMoreButton',
			_type: '_type',
		},
		prepare: x => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Filter'),
				fallback: {},
			};
			const title = resolveValue('title', caseStudiesBlockContent.preview.select, x);
			const subtitle = resolveValue('subtitle', caseStudiesBlockContent.preview.select, x);
			const media = resolveValue('media', caseStudiesBlockContent.preview.select, x);
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
