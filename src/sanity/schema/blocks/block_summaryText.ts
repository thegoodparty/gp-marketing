
export const block_summaryText = {
  name: 'block_summaryText',
  title: 'Summary Text (Inline Links)',
  description: 'A paragraph of text with the ability to add text links.',
  options: {
    collapsible: false,
  },
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [],
      lists: [],
      of: [],
      marks: {
        decorators: [],
        annotations: [
          {
            type: 'inlineInternalLink',
            name: 'inlineInternalLink',
          },
          {
            type: 'inlineExternalLink',
            name: 'inlineExternalLink',
          },
          {
            type: 'inlineEmailLink',
            name: 'inlineEmailLink',
          },
        ],
      },
    },
  ],
}