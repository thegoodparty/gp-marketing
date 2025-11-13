
export const list_topics = {
  name: 'list_topics',
  title: 'Topics',
  description: 'Choose one or more related topics.',
  options: {
    collapsible: false,
  },
  type: 'array',
  of: [
    {
      name: 'ref_topics',
      type: 'reference',
      to: {
        type: 'topics',
      },
      options: {
        filter: (ctx) => ({           filter: "!(_id in $existing)",           params: {             existing: ctx.parent.flatMap((i) => ("_ref" in i) ? i._ref : [])           }         }),
      },
    },
  ],
}