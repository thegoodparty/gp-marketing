import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const component_demoRequestBlock = {
	title: 'Demo Request Block',
	name: 'component_demoRequestBlock',
	description:
		'Three-step demo request form. Answers are checked by the demo qualifier service; candidates who pass see the sales calendar, everyone else is sent to the product tour.',
	type: 'object',
	icon: getIcon('Development'),
	fields: [
		{
			title: 'Heading',
			name: 'field_heading',
			type: 'string',
			initialValue: 'Running for local office? Request a demo of GoodParty.org',
		},
		{
			title: 'Body',
			name: 'field_body',
			type: 'text',
			rows: 4,
			initialValue:
				'Tell us a little about your race. If a live walkthrough is the right fit, you will pick a time on the next screen. If not, we will point you to the fastest way to see the product.',
		},
		{
			title: 'Talking Points',
			name: 'field_talkingPoints',
			description: 'Short list of what the demo covers, shown under the body copy.',
			type: 'array',
			of: [
				{
					type: 'object',
					name: 'talkingPoint',
					fields: [
						{ title: 'Title', name: 'field_title', type: 'string' },
						{ title: 'Copy', name: 'field_copy', type: 'text', rows: 2 },
					],
					preview: { select: { title: 'field_title', subtitle: 'field_copy' } },
				},
			],
		},
		{
			title: 'Qualifier API Endpoint',
			name: 'field_apiEndpoint',
			description: 'POST endpoint of the demo qualifier service. It decides calendar vs. product tour and writes the contact to HubSpot.',
			type: 'url',
			initialValue: 'https://demo-qualifier-production.up.railway.app/qualify',
			validation: (rule: any) => rule.uri({ scheme: ['https'] }),
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
			initialValue: 'cream',
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
					title: 'Demo Request Block',
				},
			};
			const title = resolveValue('title', component_demoRequestBlock.preview.select, x);
			const subtitle = resolveValue('subtitle', component_demoRequestBlock.preview.select, x);
			const media = resolveValue('media', component_demoRequestBlock.preview.select, x);
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
