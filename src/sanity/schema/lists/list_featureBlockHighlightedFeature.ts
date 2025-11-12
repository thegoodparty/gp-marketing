
export const list_featureBlockHighlightedFeature = {
  name: 'list_featureBlockHighlightedFeature',
  title: 'Feature Block Highlighted Feature',
  description: 'Choose a feature to showcase with an image (1 max). Leave blank if no highlighted feature should be displayed.',
  options: {
    collapsible: false,
  },
  validation: (R) => R.custom(async (_, ctx) => typeof ctx.type?.hidden === "function" && ctx.type.hidden(ctx) ? true : R["error"]("Max 1").max(1).validate(_, ctx).then((e) => e.length === 0 ? true : e[0].item?.message || "Invalid")),
  type: 'array',
  of: [
    {
      title: 'Highlighted Feature',
      type: 'highlightedFeature',
    },
  ],
}