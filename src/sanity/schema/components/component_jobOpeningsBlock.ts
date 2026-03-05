import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const component_jobOpeningsBlock = {
	title: 'Job Openings Block',
	name: 'component_jobOpeningsBlock',
	type: 'object',
	icon: getIcon('ListChecked'),
	fields: [
		{
			title: 'Text',
			name: 'summaryInfo',
			type: 'summaryInfo',
			group: 'summaryInfo',
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
				icon: getIcon('ListChecked'),
				fallback: {
					previewTitle: 'summaryInfo.field_title',
					previewSubTitle: '*Job Openings Block',
					title: 'Job Openings Block',
				},
			};
			const title = resolveValue('title', component_jobOpeningsBlock.preview.select, x);
			const subtitle = resolveValue('subtitle', component_jobOpeningsBlock.preview.select, x);
			const media = resolveValue('media', component_jobOpeningsBlock.preview.select, x);
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
			title: 'Settings',
			name: 'componentSettings',
			icon: getIcon('Settings'),
		},
	],
};
