
export const block_editorialContentSections = {
  name: 'block_editorialContentSections',
  title: 'Editorial Content Sections',
  description: 'Sections of content for editorial purposes.',
  options: {
    collapsible: false,
  },
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [
        {
          title: 'Normal',
          value: 'normal',
        },
        {
          title: 'H1',
          value: 'h1',
        },
        {
          title: 'H2',
          value: 'h2',
        },
        {
          title: 'H3',
          value: 'h3',
        },
        {
          title: 'H4',
          value: 'h4',
        },
        {
          title: 'H5',
          value: 'h5',
        },
        {
          title: 'H6',
          value: 'h6',
        },
        {
          title: 'Quote',
          value: 'blockquote',
        },
      ],
      lists: [
        {
          title: 'Bullet',
          value: 'bullet',
        },
        {
          title: 'Numbered',
          value: 'number',
        },
      ],
      of: [],
      marks: {
        decorators: [
          {
            title: 'Strong',
            value: 'strong',
          },
          {
            title: 'Emphasis',
            value: 'em',
          },
        ],
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
    {
      type: 'imageContentSection',
      title: 'Image',
    },
    {
      type: 'videoSection',
      title: 'Video',
    },
    {
      type: 'inlineQuoteSection',
      title: 'Quote',
    },
    {
      type: 'callout',
      title: 'Callout',
    },
    {
      type: 'tableGroup',
      title: 'Table',
    },
    {
      type: 'ctaSection',
      title: 'CTA',
    },
    {
      type: 'faqs',
      title: 'FAQs',
    },
    {
      type: 'imageCta',
      title: 'Image CTA',
    },
  ],
}