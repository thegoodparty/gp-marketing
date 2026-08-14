import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const component_caseStudiesBlock = {
	title: 'Case Studies Block',
	name: 'component_caseStudiesBlock',
	description: 'A grid of the most recent case studies.',
	type: 'object',
	icon: getIcon('Grid'),
	fields: [
		{
			title: 'Text',
			name: 'summaryInfo',
			type: 'summaryInfo',
			group: 'summaryInfo',
		},
		{
			title: 'Content',
			name: 'caseStudiesBlockContent',
			type: 'caseStudiesBlockContent',
			group: 'caseStudiesBlockContent',
		},
		{
			title: 'Settings',
			name: 'componentSettings',
			type: 'componentSettings',
			group: 'componentSettings',
		},
	],
	preview: {
		select: {
			title: 'summaryInfo.field_title',
			_type: '_type',
		},
		prepare: x => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Grid'),
				fallback: {
					previewTitle: 'summaryInfo.field_title',
					previewSubTitle: '*Case Studies Block',
					title: 'Case Studies Block',
				},
			};
			const title = resolveValue('title', component_caseStudiesBlock.preview.select, x);
			const subtitle = resolveValue('subtitle', component_caseStudiesBlock.preview.select, x);
			const media = resolveValue('media', component_caseStudiesBlock.preview.select, x);
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
	groups: [
		{
			title: 'Text',
			name: 'summaryInfo',
			icon: getIcon('TextFont'),
		},
		{
			title: 'Content',
			name: 'caseStudiesBlockContent',
			icon: getIcon('Filter'),
		},
		{
			title: 'Settings',
			name: 'componentSettings',
			icon: getIcon('Settings'),
		},
	],
};
