export const block_articleSummaryText = {
	name: 'block_articleSummaryText',
	title: 'Article Summary Text',
	description: 'Plain paragraphs. Bold and links are allowed.',
	options: {
		collapsible: false,
	},
	type: 'array',
	of: [
		{
			type: 'block',
			styles: [{ title: 'Normal', value: 'normal' }],
			lists: [],
			of: [],
			marks: {
				decorators: [{ title: 'Strong', value: 'strong' }],
				annotations: [
					{
						type: 'inlineInternalLink',
						name: 'inlineInternalLink',
					},
					{
						type: 'inlineExternalLink',
						name: 'inlineExternalLink',
					},
				],
			},
		},
	],
};
