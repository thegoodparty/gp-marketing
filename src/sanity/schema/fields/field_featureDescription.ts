
export const field_featureDescription = {
  name: 'field_featureDescription',
  title: 'Feature Description',
  description: 'A short description of this feature, ideally no more that 155 characters.',
  options: {
    collapsible: false,
    search: {
      weight: 7,
    },
  },
  validation: (R) => R.custom(async (_, ctx) => typeof ctx.type?.hidden === "function" && ctx.type.hidden(ctx) ? true : R["error"]("Max 250 characters").max(250).validate(_, ctx).then((e) => e.length === 0 ? true : e[0].item?.message || "Invalid")),
  type: 'text',
}