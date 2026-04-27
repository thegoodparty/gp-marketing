
export const list_relatedArticles = {
  name: 'list_relatedArticles',
  title: 'Related Articles',
  description: 'By default, articles from the same category will be shown below the article to keep users engaged. Use this option to manually select specific articles to display in this space.',
  options: {
    collapsible: false,
  },
  validation: (R) => R.custom(async (_, ctx) => typeof ctx.type?.hidden === 'function' && ctx.type.hidden(ctx) ? true : R['error']('Max 3').max(3).validate(_, ctx).then((e) => e.length === 0 ? true : e[0].item?.message || 'Invalid')),
  type: 'array',
  of: [
    {
      name: 'ref_article',
      type: 'reference',
      to: {
        type: 'article',
      },
      options: {
        filter: (ctx) => ({           filter: '!(_id in $existing)',           params: {             existing: ctx.parent.flatMap((i) => ('_ref' in i) ? i._ref : [])           }         }),
      },
    },
  ],
}