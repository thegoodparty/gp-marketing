
export const block_answer = {
  name: 'block_answer',
  title: 'Answer',
  description: 'Provides answers to frequently asked questions.',
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
    {
      type: 'button',
      title: 'Button',
    },
  ],
}