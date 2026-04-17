
export const list_tabbedImageItems = {
  name: 'list_tabbedImageItems',
  title: 'Tabbed Image Items',
  description: 'A snippet of content with an image. Max 4.',
  options: {
    collapsible: false,
  },
  validation: [(R) => R.custom(async (_, ctx) => typeof ctx.type?.hidden === 'function' && ctx.type.hidden(ctx) ? true : R['error']('Min 2').min(2).validate(_, ctx).then((e) => e.length === 0 ? true : e[0].item?.message || 'Invalid')), (R) => R.custom(async (_, ctx) => typeof ctx.type?.hidden === 'function' && ctx.type.hidden(ctx) ? true : R['error']('Max 4').max(4).validate(_, ctx).then((e) => e.length === 0 ? true : e[0].item?.message || 'Invalid'))],
  type: 'array',
  of: [
    {
      title: 'Tabbed Image Item',
      type: 'tabbedImageItem',
    },
  ],
}