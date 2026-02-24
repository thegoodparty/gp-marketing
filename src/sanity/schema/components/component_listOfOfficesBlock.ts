import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const component_listOfOfficesBlock = {
	title: 'List of Offices Block',
	name: 'component_listOfOfficesBlock',
	type: 'object',
	icon: getIcon('Building'),
	fields: [
		{
			title: 'Heading',
			name: 'field_heading',
			type: 'string',
			description: 'Optional heading text above the card (defaults to "List of Offices")',
		},
		{
			title: 'Headline',
			name: 'field_headline',
			type: 'string',
			description: 'Headline text inside the card',
		},
		{
			title: 'Default Year',
			name: 'field_defaultYear',
			type: 'number',
			description: 'Default year to display (defaults to current year + 1)',
			initialValue: new Date().getFullYear() + 1,
		},
		{
			title: 'Available Years',
			name: 'field_availableYears',
			type: 'array',
			description: 'Years available in the dropdown selector',
			of: [{ type: 'number' }],
			initialValue: [
				new Date().getFullYear() - 4,
				new Date().getFullYear() - 3,
				new Date().getFullYear() - 2,
				new Date().getFullYear() - 1,
				new Date().getFullYear(),
				new Date().getFullYear() + 1,
			],
		},
		{
			title: 'Offices',
			name: 'list_offices',
			type: 'list_officeItems',
			description: 'List of office positions to display',
		},
		{
			title: 'Design Settings',
			name: 'listOfOfficesBlockDesignSettings',
			type: 'object',
			fields: [
				{
					title: 'Background Color',
					name: 'field_blockColorCreamMidnight',
					type: 'string',
					options: {
						list: [
							{ title: 'Cream', value: 'cream' },
							{ title: 'Midnight', value: 'midnight' },
						],
					},
					initialValue: 'cream',
				},
			],
			group: 'listOfOfficesBlockDesignSettings',
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
			heading: 'field_heading',
			headline: 'field_headline',
			_type: '_type',
		},
		prepare: (x: Record<string, unknown>) => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Building'),
				fallback: {
					previewTitle: 'field_headline',
					previewSubTitle: '*List of Offices Block',
					title: 'List of Offices Block',
				},
			};
			const title = resolveValue('headline', component_listOfOfficesBlock.preview.select, x) || resolveValue('heading', component_listOfOfficesBlock.preview.select, x);
			const subtitle = resolveValue('subtitle', component_listOfOfficesBlock.preview.select, x);
			const media = resolveValue('media', component_listOfOfficesBlock.preview.select, x);
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
			title: 'Content',
			name: 'content',
			icon: getIcon('TextFont'),
			default: true,
		},
		{
			title: 'Design Settings',
			name: 'listOfOfficesBlockDesignSettings',
			icon: getIcon('ColorPalette'),
		},
		{
			title: 'Settings',
			name: 'componentSettings',
			icon: getIcon('Settings'),
		},
	],
};
