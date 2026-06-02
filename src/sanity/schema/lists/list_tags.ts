
export const list_tags = {
  name: 'list_tags',
  title: 'Tags',
  description: 'Tags create a method for categorising and curating this content.',
  options: {
    collapsible: false,
  },
  type: 'array',
  of: [
    {
      name: 'ref_categories',
      type: 'reference',
      to: {
        type: 'categories',
      },
      options: {
        filter: (ctx) => ({           filter: '!(_id in $existing)',           params: {             existing: ctx.parent.flatMap((i) => ('_ref' in i) ? i._ref : [])           }         }),
      },
    },
    {
      name: 'ref_topics',
      type: 'reference',
      to: {
        type: 'topics',
      },
      options: {
        filter: (ctx) => ({           filter: '!(_id in $existing)',           params: {             existing: ctx.parent.flatMap((i) => ('_ref' in i) ? i._ref : [])           }         }),
      },
    },
  ],
}