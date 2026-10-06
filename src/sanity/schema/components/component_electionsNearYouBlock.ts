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
			initialValue: "Enter your city to see every race on your ballot and discover independent candidates who've pledged to put voters first.",
		},
		{
			title: 'Button Label',
			name: 'field_buttonLabel',
			type: 'string',
			initialValue: 'Search',
		},
		{
			title: 'Layout',
			name: 'field_layoutVariant',
			type: 'string',
			description: 'Contained sits inside the page as a rounded card. Full Width runs edge to edge with no card.',
			options: {
				list: [
					{ title: 'Contained', value: 'contained' },
					{ title: 'Full Width', value: 'fullWidth' },
				],
			},
			initialValue: 'contained',
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
			description: 'Shows the photo row and stat line beneath the search box. Needs both the text and the three people below.',
			initialValue: false,
		},
		{
			title: 'Social Proof Text',
			name: 'field_socialProofText',
			type: 'string',
			description: 'Only shown when Show Social Proof is on.',
			initialValue: '13,000+ independents won with GoodParty.org',
			hidden: (x: any) => !x.parent?.field_showSocialProof,
		},
		{
			title: 'Social Proof People',
			name: 'list_Choose3People',
			type: 'list_Choose3People',
			description: 'The three photos shown beside the social proof text. Only shown when Show Social Proof is on.',
			hidden: (x: any) => !x.parent?.field_showSocialProof,
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
