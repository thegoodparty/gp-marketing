
export const list_stepperBlockItems = {
  name: 'list_stepperBlockItems',
  title: 'Stepper Block Items',
  description: 'Add up to 5 cards, comprised of a text and an image.',
  options: {
    collapsible: false,
  },
  validation: (R) => R.custom(async (_, ctx) => typeof ctx.type?.hidden === "function" && ctx.type.hidden(ctx) ? true : R["error"]("Max 5 Cards").max(5).validate(_, ctx).then((e) => e.length === 0 ? true : e[0].item?.message || "Invalid")),
  type: 'array',
  of: [
    {
      title: 'Cards',
      type: 'stepperBlockItem',
    },
  ],
}