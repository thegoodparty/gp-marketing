import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const component_clickToCallBlock = {
	title: 'Click to Call Block',
	name: 'component_clickToCallBlock',
	type: 'object',
	icon: getIcon('Phone'),
	fields: [
		{
			title: 'Pre-framing copy',
			name: 'field_preframingText',
			type: 'text',
			description: 'Two sentences above the phone input.',
			rows: 4,
			validation: (Rule: any) => Rule.required(),
		},
		{
			title: 'Input prompt',
			name: 'field_inputPrompt',
			type: 'text',
			description:
				'Instruction above the phone field. Use [phone] and [time] placeholders for outbound number and response window.',
			rows: 3,
			validation: (Rule: any) => Rule.required(),
		},
		{
			title: 'Button label',
			name: 'field_buttonText',
			type: 'string',
			initialValue: 'Talk through my race',
			validation: (Rule: any) => Rule.required(),
		},
		{
			title: 'Microcopy',
			name: 'field_microcopy',
			type: 'text',
			description: 'Disclaimer below the button.',
			rows: 3,
			validation: (Rule: any) => Rule.required(),
		},
		{
			title: 'Outbound phone number (display)',
			name: 'field_phoneNumber',
			type: 'string',
			description: 'Shown to visitors (e.g. 555-555-5555). Substituted into [phone] in the input prompt.',
			validation: (Rule: any) => Rule.required(),
		},
		{
			title: 'Response time window',
			name: 'field_responseTime',
			type: 'string',
			description: 'e.g. "2 minutes". Substituted into [time] in the input prompt.',
			validation: (Rule: any) => Rule.required(),
		},
		{
			title: 'Design Settings',
			name: 'ctaBlockDesignSettings',
			type: 'ctaBlockDesignSettings',
			group: 'ctaBlockDesignSettings',
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
			title: 'field_buttonText',
			subtitle: 'field_phoneNumber',
		},
		prepare: (x: any) => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Phone'),
				fallback: {
					title: 'Click to Call Block',
				},
			};
			const title = resolveValue('title', component_clickToCallBlock.preview.select, x);
			const subtitle = resolveValue('subtitle', component_clickToCallBlock.preview.select, x);
			const media = resolveValue('media', component_clickToCallBlock.preview.select, x);
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
			title: 'Design Settings',
			name: 'ctaBlockDesignSettings',
			icon: getIcon('ColorPalette'),
		},
		{
			title: 'Settings',
			name: 'componentSettings',
			icon: getIcon('Settings'),
		},
	],
};
