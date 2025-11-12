
export const list_valuePropositionCardItems = {
  name: 'list_valuePropositionCardItems',
  title: 'Value Proposition Card Items',
  description: 'Create items to display as a list. Max 3.',
  options: {
    collapsible: false,
  },
  validation: (R) => R.custom(async (_, ctx) => typeof ctx.type?.hidden === "function" && ctx.type.hidden(ctx) ? true : R["error"]().max(3).validate(_, ctx).then((e) => e.length === 0 ? true : e[0].item?.message || "Invalid")),
  type: 'array',
  of: [
    {
      title: 'List Item',
      type: 'iconTextListItem',
    },
  ],
}