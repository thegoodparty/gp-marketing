
export const list_featureBlockFeatures = {
  name: 'list_featureBlockFeatures',
  title: 'Feature Block Features',
  description: "Choose the features you'd like to display",
  options: {
    collapsible: false,
  },
  validation: (R) => R.custom(async (_, ctx) => typeof ctx.type?.hidden === 'function' && ctx.type.hidden(ctx) ? true : R['error']('Max 9').max(9).validate(_, ctx).then((e) => e.length === 0 ? true : e[0].item?.message || 'Invalid')),
  type: 'array',
  of: [
    {
      title: 'Feature',
      type: 'featureBlockItem',
    },
  ],
}