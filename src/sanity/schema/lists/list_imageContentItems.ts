
export const list_imageContentItems = {
  name: 'list_imageContentItems',
  title: 'Image Content Items',
  description: 'A snippet of content with an image. Min 2. Max 6.',
  options: {
    collapsible: false,
  },
  validation: [(R) => R.custom(async (_, ctx) => typeof ctx.type?.hidden === "function" && ctx.type.hidden(ctx) ? true : R["error"]("Min 2").min(2).validate(_, ctx).then((e) => e.length === 0 ? true : e[0].item?.message || "Invalid")), (R) => R.custom(async (_, ctx) => typeof ctx.type?.hidden === "function" && ctx.type.hidden(ctx) ? true : R["error"]("Max 6").max(6).validate(_, ctx).then((e) => e.length === 0 ? true : e[0].item?.message || "Invalid"))],
  type: 'array',
  of: [
    {
      title: 'Image Block Item',
      type: 'imageBlockItem',
    },
  ],
}