import { getIcon } from '../../utils/getIcon.tsx';

export const promoBanner = {
	title: 'Promo Banner',
	name: 'promoBanner',
	type: 'object',
	description:
		'A slim bar directly under the main navigation on every page. Turn it on here; the schedule and URL rules below decide when and where it shows.',
	options: {
		collapsed: false,
		columns: 1,
	},
	icon: getIcon('Notification'),
	fields: [
		{
			title: 'Show Banner',
			name: 'field_enabled',
			type: 'boolean',
			description: 'The banner only appears while this is on, the text is filled in, and the schedule below allows it.',
			initialValue: false,
		},
		{
			title: 'Banner Text',
			name: 'field_text',
			type: 'string',
			description: 'One line. On phones a long message is cut off with an ellipsis, so keep it short.',
			validation: R => R.max(120),
		},
		{
			title: 'Button',
			name: 'button',
			type: 'button',
			description: 'Optional. Leave the action empty for a text-only banner.',
		},
		{
			title: 'Color',
			name: 'field_color',
			type: 'string',
			options: {
				list: [
					{ title: 'Bright Yellow', value: 'BrightYellow' },
					{ title: 'Halo Green', value: 'HaloGreen' },
					{ title: 'Lavender', value: 'Lavender' },
					{ title: 'Waxflower', value: 'Waxflower' },
					{ title: 'Blue', value: 'Blue' },
					{ title: 'Red', value: 'Red' },
					{ title: 'Midnight', value: 'Midnight' },
				],
			},
			initialValue: 'BrightYellow',
		},
		{
			title: 'Count Down To',
			name: 'field_countdownTo',
			type: 'datetime',
			description: 'Optional. Shows a live countdown (days, hours, minutes, seconds) at the far left of the banner until this moment, then the countdown disappears.',
		},
		{
			title: 'Countdown Label',
			name: 'field_countdownLabel',
			type: 'string',
			description: 'Optional short words shown before the countdown, for example "Filing closes in".',
			validation: R => R.max(40),
		},
		{
			title: 'Start Showing At',
			name: 'field_startsAt',
			type: 'datetime',
			description: 'Leave empty to show as soon as this is published.',
		},
		{
			title: 'Stop Showing At',
			name: 'field_endsAt',
			type: 'datetime',
			description: 'Leave empty to keep showing until the banner is turned off.',
		},
		{
			title: 'Only Show On URLs Containing',
			name: 'list_includePaths',
			type: 'array',
			of: [{ type: 'string' }],
			description:
				'Leave empty to show on every page. Otherwise one fragment per line, matched against the page path: "/elections/" matches /elections and everything under it, "/" on its own means the homepage only. Capitalization does not matter.',
		},
		{
			title: 'Hide On URLs Containing',
			name: 'list_excludePaths',
			type: 'array',
			of: [{ type: 'string' }],
			description: 'Same matching as above. A page that matches both lists stays hidden.',
		},
	],
	preview: {
		select: {
			title: 'field_text',
			enabled: 'field_enabled',
		},
		prepare: ({ title, enabled }) => ({
			title: title || 'Promo Banner',
			subtitle: enabled ? 'On' : 'Off',
		}),
	},
};
