export const list_pledgeCards = {
	name: 'list_pledgeCards',
	title: 'Pledge Cards',
	description: 'A list of pledge cards with icon, title, content, and button. Max 4.',
	options: {
		collapsible: false,
	},
	validation: [
		R =>
			R.custom(async (_, ctx) =>
				typeof ctx.type?.hidden === 'function' && ctx.type.hidden(ctx)
					? true
					: R['error']('Max 4')
							.max(4)
							.validate(_, ctx)
							.then(e => (e.length === 0 ? true : e[0].item?.message || 'Invalid')),
			),
	],
	type: 'array',
	of: [
		{
			title: 'Pledge Card Item',
			type: 'pledgeCardItem',
		},
	],
};
