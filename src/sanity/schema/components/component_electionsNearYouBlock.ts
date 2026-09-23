import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const component_electionsNearYouBlock = {
	title: 'Elections Near You Block',
	name: 'component_electionsNearYouBlock',
	description: 'City/county search banner for finding nearby elections. Search behavior ships in a follow-up task.',
	type: 'object',
	icon: getIcon('Development'),
	fields: [
		{
			title: 'Heading',
			name: 'field_heading',
			type: 'string',
			initialValue: 'Find more elections near you',
		},
		{
			title: 'Body',
			name: 'field_body',
			type: 'text',
			rows: 4,
			initialValue: 'Find upcoming elections in your city or county.',
		},
		{
			title: 'Button Label',
			name: 'field_buttonLabel',
			type: 'string',
			initialValue: 'Search',
		},
		{
			title: 'Background Variant',
			name: 'field_backgroundVariant',
			type: 'string',
			options: {
				list: [
					{ title: 'Cream', value: 'cream' },
					{ title: 'Midnight', value: 'midnight' },
				],
			},
			initialValue: 'midnight',
		},
		{
			title: 'Show Social Proof',
			name: 'field_showSocialProof',
			type: 'boolean',
			description: 'Pending confirmation from marketing before enabling.',
			initialValue: false,
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
			title: 'field_heading',
		},
		prepare: (x: any) => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Development'),
				fallback: {
					title: 'Elections Near You Block',
				},
			};
			const title = resolveValue('title', component_electionsNearYouBlock.preview.select, x);
			const subtitle = resolveValue('subtitle', component_electionsNearYouBlock.preview.select, x);
			const media = resolveValue('media', component_electionsNearYouBlock.preview.select, x);
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
			title: 'Settings',
			name: 'componentSettings',
			icon: getIcon('Settings'),
		},
	],
};
