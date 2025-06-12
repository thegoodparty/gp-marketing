import {defineType, defineField, defineArrayMember} from 'sanity'
import {HelpCircleIcon} from '@sanity/icons'

export const faqBlock = defineType({
  name: 'faqBlock',
  title: 'FAQ Block',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
      validation: (Rule) => Rule.required().error('Heading is required'),
    }),
    defineField({
      name: 'subhead',
      type: 'string',
      description: 'Optional descriptive text shown beneath the heading',
    }),
    defineField({
      name: 'button',
      type: 'object',
      description: 'Optional sidebar CTA button',
      fields: [
        defineField({
          name: 'label',
          type: 'string',
          validation: (Rule) => Rule.required().error('Button label is required'),
        }),
        defineField({
          name: 'url',
          type: 'url',
          validation: (Rule) =>
            Rule.required()
              .uri({ allowRelative: true })
              .error('Valid URL required'),
        }),
        defineField({
          name: 'icon',
          type: 'string',
          description: 'Lucide icon name (e.g., User, Mail, HelpCircle)',
        }),
      ],
    }),
    defineField({
      name: 'items',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'question',
              type: 'string',
              validation: (Rule) =>
                Rule.required().warning('Keep questions concise'),
            }),
            defineField({
              name: 'answer',
              type: 'text',
              rows: 4,
              validation: (Rule) =>
                Rule.required().warning('Aim for brief, clear answers'),
            }),
          ],
        }),
      ],
      validation: (Rule) =>
        Rule.min(1).error('At least one FAQ item is required'),
    }),
  ],
  preview: {
    select: { title: 'heading', itemCount: 'items.length' },
    prepare({ title, itemCount }) {
      return {
        title: title || 'Untitled FAQ Block',
        subtitle: `${itemCount || 0} items`,
      }
    },
  },
}) 