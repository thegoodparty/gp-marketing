
export const list_buttons = {
  name: 'list_buttons',
  title: 'Buttons',
  description: 'A clickable element for user interaction.',
  options: {
    collapsible: false,
  },
  validation: (R) => R.custom(async (_, ctx) => typeof ctx.type?.hidden === "function" && ctx.type.hidden(ctx) ? true : R["error"]("Maximum of 2").max(2).validate(_, ctx).then((e) => e.length === 0 ? true : e[0].item?.message || "Invalid")),
  type: 'array',
  of: [
    {
      title: 'Button',
      type: 'button',
    },
  ],
}