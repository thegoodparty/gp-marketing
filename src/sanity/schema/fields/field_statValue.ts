
export const field_statValue = {
  name: 'field_statValue',
  title: 'Stat Value',
  description: 'The main callout of the stat, such as a percentage or a number.',
  options: {
    collapsible: false,
  },
  validation: (R) => R.custom(async (_, ctx) => typeof ctx.type?.hidden === "function" && ctx.type.hidden(ctx) ? true : R["error"]("Max 10 Characters").max(10).validate(_, ctx).then((e) => e.length === 0 ? true : e[0].item?.message || "Invalid")),
  type: 'string',
}