
export const ref_quoteBy = {
  name: 'ref_quoteBy',
  title: 'Quote By',
  description: 'Indicates the author of the quote.',
  type: 'reference',
  to: [
    {
      type: 'person',
    },
    {
      type: 'organisation',
    },
  ],
}