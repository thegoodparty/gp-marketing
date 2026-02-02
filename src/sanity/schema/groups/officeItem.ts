import { getIcon } from '../../utils/getIcon.tsx';

export const officeItem = {
	name: 'officeItem',
	title: 'Office Item',
	type: 'object',
	fields: [
		{
			title: 'Type',
			name: 'field_type',
			type: 'string',
			description: 'Office type (e.g., STATE, COUNTY, CITY)',
			options: {
				list: [
					{ title: 'State', value: 'STATE' },
					{ title: 'County', value: 'COUNTY' },
					{ title: 'City', value: 'CITY' },
				],
			},
			initialValue: 'STATE',
			validation: (R: any) => R.required(),
		},
		{
			title: 'Position',
			name: 'field_position',
			type: 'string',
			description: 'Name of the office position',
			validation: (R: any) => R.required(),
		},
		{
			title: 'Next Election Date',
			name: 'field_nextElectionDate',
			type: 'date',
			description: 'Date of the next election',
			validation: (R: any) => R.required(),
		},
		{
			title: 'Link',
			name: 'field_href',
			type: 'string',
			description: 'Optional link to office detail page',
		},
	],
	preview: {
		select: {
			type: 'field_type',
			position: 'field_position',
			date: 'field_nextElectionDate',
		},
		prepare: ({ type, position, date }: { type?: string; position?: string; date?: string }) => {
			return {
				title: position || 'Untitled Office',
				subtitle: `${type || 'Unknown'} • ${date ? new Date(date).toLocaleDateString() : 'No date'}`,
				media: getIcon('Building'),
			};
		},
	},
};
