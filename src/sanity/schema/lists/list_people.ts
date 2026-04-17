
export const list_people = {
  name: 'list_people',
  title: 'People',
  description: "Choose the people you'd like to display.",
  options: {
    collapsible: false,
  },
  type: 'array',
  of: [
    {
      name: 'ref_person',
      type: 'reference',
      to: {
        type: 'person',
      },
      options: {
        filter: (ctx) => ({           filter: '!(_id in $existing)',           params: {             existing: ctx.parent.flatMap((i) => ('_ref' in i) ? i._ref : [])           }         }),
      },
    },
  ],
}