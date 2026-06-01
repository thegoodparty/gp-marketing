
export const list_chooseQuotes = {
  name: 'list_chooseQuotes',
  title: 'Choose Quotes',
  description: 'Choose the quotes you wish to display.',
  options: {
    collapsible: false,
  },
  validation: (R) => R.custom(async (_, ctx) => typeof ctx.type?.hidden === 'function' && ctx.type.hidden(ctx) ? true : R['error']('Select at least one').min(1).validate(_, ctx).then((e) => e.length === 0 ? true : e[0].item?.message || 'Invalid')),
  type: 'array',
  of: [
    {
      name: 'ref_quotes',
      type: 'reference',
      to: {
        type: 'quotes',
      },
      options: {
        filter: (ctx) => ({           filter: '!(_id in $existing)',           params: {             existing: ctx.parent.flatMap((i) => ('_ref' in i) ? i._ref : [])           }         }),
      },
    },
  ],
}