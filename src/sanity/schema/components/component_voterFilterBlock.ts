import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

const group = (key: string, title: string, icon: string, filters: [string, string[]][]) => ({
	_key: key,
	_type: 'voterFilterGroup',
	field_title: title,
	field_icon: icon,
	list_voterFilters: filters.map(([label, values], index) => ({
		_key: `${key}-${index}`,
		_type: 'voterFilter',
		field_label: label,
		list_values: values,
	})),
});

const defaultGroups = [
	group('voting', 'How they vote', 'vote', [
		['Voter likelihood', ['Super', 'Likely', 'Unreliable', 'Unlikely', 'Unknown']],
		['Political party', ['Democrat', 'Independent', 'Republican', 'Other']],
		['Ideology', ['Conservative', 'Moderate', 'Progressive', 'Unknown']],
		['Independent affinity', ['Open to independents']],
	]),
	group('people', 'Who they are', 'users', [
		['Age', ['18 to 24', '25 to 34', '35 to 49', '50 to 64', '65+', 'Unknown']],
		['Gender', ['Male', 'Female', 'Unknown']],
		['Ethnicity', ['African American', 'Asian', 'European', 'Hispanic', 'Other', 'Unknown']],
		['Language', ['English', 'Spanish', 'Other', 'Unknown']],
		['Level of education', ['None', 'High school diploma', 'Technical school', 'Some college', 'College degree', 'Graduate degree', 'Unknown']],
		['Veteran status', ['Yes', 'Unknown']],
	]),
	group('household', 'Their household', 'house', [
		['Marital status', ['Married', 'Likely married', 'Single', 'Likely single', 'Unknown']],
		['Children', ['Yes', 'No', 'Unknown']],
		['Homeownership', ['Homeowner', 'Renter', 'Unknown']],
		['Business owner', ['Yes', 'Unknown']],
		[
			'Household income',
			['Under $25k', '$25k to $35k', '$35k to $50k', '$50k to $75k', '$75k to $100k', '$100k to $125k', '$125k to $150k', '$150k to $200k', '$200k+', 'Unknown'],
		],
	]),
	group('reach', 'How to reach them', 'smartphone', [
		['Phone', ['Has any phone']],
		['Cell phone', ['Has cell phone']],
		['Landline', ['Has landline']],
		['Prior contacts made', ['0', '1', '2', '3', '4', '5+']],
		['Support status', ['Supporter', 'Non-supporter', 'Undecided', 'Refused', 'Support unknown']],
	]),
];

export const component_voterFilterBlock = {
	title: 'Voter Filter Block',
	name: 'component_voterFilterBlock',
	description:
		'A compact table of every filter in the Your Voters list builder, grouped by theme, with the values shown as chips. Prefilled with the current filter set; edit the groups to match the product.',
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
			name: 'voterFilterBlockContent',
			type: 'object',
			group: 'voterFilterBlockContent',
			options: { collapsed: false, columns: 1 },
			fields: [
				{
					title: 'Filter Groups',
					name: 'list_voterFilterGroups',
					description: 'Each group becomes one card. Each filter inside it is one row with its values as chips.',
					type: 'array',
					of: [
						{
							title: 'Filter Group',
							name: 'voterFilterGroup',
							type: 'object',
							icon: getIcon('Grid'),
							fields: [
								{ title: 'Group Title', name: 'field_title', type: 'string' },
								{ title: 'Icon', name: 'field_icon', type: 'field_icon' },
								{
									title: 'Filters',
									name: 'list_voterFilters',
									type: 'array',
									of: [
										{
											title: 'Filter',
											name: 'voterFilter',
											type: 'object',
											icon: getIcon('Checkbox'),
											fields: [
												{ title: 'Filter Name', name: 'field_label', type: 'string' },
												{
													title: 'Values',
													name: 'list_values',
													description: 'One chip per value, in the order shown in the product.',
													type: 'array',
													of: [{ type: 'string' }],
													options: { layout: 'tags' },
												},
											],
											preview: {
												select: { title: 'field_label', values: 'list_values' },
												prepare: (x: any) => ({ title: x.title, subtitle: (x.values ?? []).join(', ') }),
											},
										},
									],
								},
							],
							preview: {
								select: { title: 'field_title', filters: 'list_voterFilters' },
								prepare: (x: any) => ({ title: x.title, subtitle: `${(x.filters ?? []).length} filters` }),
							},
						},
					],
					initialValue: defaultGroups,
				},
			],
		},
		{
			title: 'Design Settings',
			name: 'voterFilterBlockDesignSettings',
			type: 'object',
			group: 'voterFilterBlockDesignSettings',
			options: { collapsed: false, columns: 1 },
			fields: [
				{
					title: 'Block Color',
					name: 'field_blockColorCreamMidnight',
					type: 'string',
					options: {
						list: [
							{ title: 'Cream', value: 'Cream' },
							{ title: 'Midnight', value: 'MidnightDark' },
						],
					},
					initialValue: 'Cream',
				},
			],
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
		prepare: (x: any) => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Grid'),
				fallback: {
					previewTitle: 'summaryInfo.field_title',
					previewSubTitle: '*Voter Filter Block',
					title: 'Voter Filter Block',
				},
			};
			const title = resolveValue('title', component_voterFilterBlock.preview.select, x);
			const subtitle = resolveValue('subtitle', component_voterFilterBlock.preview.select, x);
			const media = resolveValue('media', component_voterFilterBlock.preview.select, x);
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
			name: 'voterFilterBlockContent',
			icon: getIcon('Grid'),
		},
		{
			title: 'Design Settings',
			name: 'voterFilterBlockDesignSettings',
			icon: getIcon('ColorPalette'),
		},
		{
			title: 'Settings',
			name: 'componentSettings',
			icon: getIcon('Settings'),
		},
	],
};
