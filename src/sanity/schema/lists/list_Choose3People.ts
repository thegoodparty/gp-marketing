
export const list_Choose3People = {
  name: 'list_Choose3People',
  title: 'Choose 3 People',
  description: "Choose 3 people you'd like to display.",
  options: {
    collapsible: false,
  },
  validation: (R) => R.custom(async (_, ctx) => typeof ctx.type?.hidden === "function" && ctx.type.hidden(ctx) ? true : R["error"]("Max 3").max(3).validate(_, ctx).then((e) => e.length === 0 ? true : e[0].item?.message || "Invalid")),
  type: 'array',
  of: [
    {
      name: 'ref_person',
      type: 'reference',
      to: {
        type: 'person',
      },
      options: {
        filter: (ctx) => ({           filter: "!(_id in $existing)",           params: {             existing: ctx.parent.flatMap((i) => ("_ref" in i) ? i._ref : [])           }         }),
      },
    },
  ],
}