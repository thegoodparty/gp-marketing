import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const LIST_OF_OFFICES_DEFAULT_DESCRIPTION =
	'Explore offices coming up for election near you. Offices with this symbol [symbol] have candidates on the ballot who have ' +
	'taken the GoodParty.org Pledge to serve people first, independent of both major parties and big-money interests.';

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
			description:
				'Heading above the list. On an election template you can use a location token — [State], [County], [City] or [District] — ' +
				'which is replaced with the real place name on each page, e.g. "Local elections in [City]". ' +
				'Leave empty to use the heading the page works out for itself.',
		},
		{
			title: 'Description',
			name: 'listOfOfficesBlockDescription',
			type: 'object',
			group: 'content',
			options: { collapsed: false, columns: 1 },
			fields: [
				{
					title: 'Show Description',
					name: 'field_showDescription',
					type: 'boolean',
					initialValue: true,
					description: 'The paragraph under the heading that explains the Heart & Star badge next to the independents count.',
				},
				{
					title: 'Description Text',
					name: 'block_description',
					type: 'block_summaryText',
					description:
						`Defaults to: "${LIST_OF_OFFICES_DEFAULT_DESCRIPTION}" Type [symbol] where the Heart & Star badge should sit in the ` +
						'sentence. Location tokens work here too. Add a "Read the full pledge" link once the pledge page exists.',
				},
			],
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
			_type: '_type',
		},
		prepare: (x: Record<string, unknown>) => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Building'),
				fallback: {
					previewTitle: 'field_heading',
					previewSubTitle: '*List of Offices Block',
					title: 'List of Offices Block',
				},
			};
			const title = x['heading'];
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
