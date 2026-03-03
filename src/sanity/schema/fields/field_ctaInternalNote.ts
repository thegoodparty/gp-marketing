
export const field_ctaInternalNote = {
  name: 'field_ctaInternalNote',
  title: 'CTA Note (Internal)',
  description: 'A brief internal note used for explaining the purpose and usage of the CTA to other Content Admins.',
  options: {
    collapsible: false,
  },
  validation: (R) => R.custom(async (_, ctx) => typeof ctx.type?.hidden === "function" && ctx.type.hidden(ctx) ? true : R["error"]().max(155).validate(_, ctx).then((e) => e.length === 0 ? true : e[0].item?.message || "Invalid")),
  type: 'text',
}