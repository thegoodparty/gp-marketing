
export const list_iconContentItems = {
  name: 'list_iconContentItems',
  title: 'Icon Content Items',
  description: 'A snippet of content with an icon. Max 12.',
  options: {
    collapsible: false,
  },
  validation: [(R) => R.custom(async (_, ctx) => typeof ctx.type?.hidden === "function" && ctx.type.hidden(ctx) ? true : R["error"]("Min 2").min(2).validate(_, ctx).then((e) => e.length === 0 ? true : e[0].item?.message || "Invalid")), (R) => R.custom(async (_, ctx) => typeof ctx.type?.hidden === "function" && ctx.type.hidden(ctx) ? true : R["error"]("Max 12").max(12).validate(_, ctx).then((e) => e.length === 0 ? true : e[0].item?.message || "Invalid"))],
  type: 'array',
  of: [
    {
      title: 'Icon Block Item',
      type: 'iconBlockItem',
    },
  ],
}