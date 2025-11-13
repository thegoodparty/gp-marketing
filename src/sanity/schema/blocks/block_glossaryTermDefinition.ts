
export const block_glossaryTermDefinition = {
  name: 'block_glossaryTermDefinition',
  title: 'Glossary Term Definition',
  description: 'The definition for this glossary term.',
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