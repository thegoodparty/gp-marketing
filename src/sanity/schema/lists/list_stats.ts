
export const list_stats = {
  name: 'list_stats',
  title: 'Stats',
  description: 'Add 2 to 4 stats you wish to display.',
  options: {
    collapsible: false,
  },
  validation: [(R) => R.custom(async (_, ctx) => typeof ctx.type?.hidden === "function" && ctx.type.hidden(ctx) ? true : R["error"]("Max 4 stats").max(4).validate(_, ctx).then((e) => e.length === 0 ? true : e[0].item?.message || "Invalid")), (R) => R.custom(async (_, ctx) => typeof ctx.type?.hidden === "function" && ctx.type.hidden(ctx) ? true : R["error"]("Min 2 stats").min(2).validate(_, ctx).then((e) => e.length === 0 ? true : e[0].item?.message || "Invalid"))],
  type: 'array',
  of: [
    {
      title: 'Stat',
      type: 'stat',
    },
  ],
}