
export const field_bannerText = {
  name: 'field_bannerText',
  title: 'Banner Text',
  description: 'A short piece of text, ideally no more than 72 characters. ',
  options: {
    collapsible: false,
  },
  validation: (R) => R.custom(async (_, ctx) => typeof ctx.type?.hidden === 'function' && ctx.type.hidden(ctx) ? true : R['error']('Max 155 Characters').max(155).validate(_, ctx).then((e) => e.length === 0 ? true : e[0].item?.message || 'Invalid')),
  type: 'text',
}