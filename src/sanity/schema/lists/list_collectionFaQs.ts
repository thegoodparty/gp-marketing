
export const list_collectionFaQs = {
  name: 'list_collectionFaQs',
  title: 'Collection FAQs',
  description: 'Choose the FAQs you wish to display in this collection.',
  options: {
    collapsible: false,
  },
  validation: (R) => R.custom(async (_, ctx) => typeof ctx.type?.hidden === 'function' && ctx.type.hidden(ctx) ? true : R['error']('Select at least one').min(1).validate(_, ctx).then((e) => e.length === 0 ? true : e[0].item?.message || 'Invalid')),
  type: 'array',
  of: [
    {
      name: 'ref_faq',
      type: 'reference',
      to: {
        type: 'faq',
      },
      options: {
        filter: (ctx) => ({           filter: '!(_id in $existing)',           params: {             existing: ctx.parent.flatMap((i) => ('_ref' in i) ? i._ref : [])           }         }),
      },
    },
  ],
}