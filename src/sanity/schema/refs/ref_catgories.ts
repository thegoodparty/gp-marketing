
export const ref_catgories = {
  name: 'ref_catgories',
  title: 'Catgories',
  description: 'Choose one related category',
  validation: (R) => R.custom(async (_, ctx) => typeof ctx.type?.hidden === 'function' && ctx.type.hidden(ctx) ? true : R['error']('Required').required().validate(_, ctx).then((e) => e.length === 0 ? true : e[0].item?.message || 'Invalid')),
  type: 'reference',
  to: [
    {
      type: 'categories',
    },
  ],
}