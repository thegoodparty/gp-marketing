export const list_officeItems = {
	name: 'list_officeItems',
	title: 'Office Items',
	description: 'List of office positions to display',
	options: {
		collapsible: false,
	},
	type: 'array',
	of: [
		{
			title: 'Office Item',
			type: 'officeItem',
		},
	],
};
