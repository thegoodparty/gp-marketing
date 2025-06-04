import { defineField, defineType } from 'sanity'
import { ComponentIcon } from '@sanity/icons'

export const problemSection = defineType({
  name: 'problemSection',
  title: 'Problem Section',
  type: 'object',
  icon: ComponentIcon,
  fields: [
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'array',
      validation: (Rule) => Rule.min(2).max(2),
      of: [
        {
          type: 'object',
          name: 'column',
          title: 'Column',
          fields: [
            defineField({
              name: 'title',
              title: 'Column Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'backgroundColor',
              title: 'Background Color',
              type: 'string',
              options: {
                list: [
                  { title: 'Pink', value: '#FDCDCD' },
                  { title: 'Green', value: '#CCEADD' },
                ],
                layout: 'radio',
              },
              initialValue: '#FDCDCD',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'items',
              title: 'List Items',
              type: 'array',
              validation: (Rule) => Rule.min(1).max(4),
              of: [
                {
                  type: 'object',
                  name: 'listItem',
                  title: 'List Item',
                  fields: [
                    defineField({
                      name: 'icon',
                      title: 'Icon',
                      type: 'string',
                      description:
                        'Lucide icon name (e.g., "BarChart3", "Users", "TrendingUp")',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'text',
                      title: 'Text',
                      type: 'text',
                      rows: 2,
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'text',
                      subtitle: 'icon',
                    },
                    prepare({ title, subtitle }) {
                      return {
                        title: title || 'Untitled item',
                        subtitle: `Icon: ${subtitle || 'None'}`,
                      }
                    },
                  },
                },
              ],
            }),
            defineField({
              name: 'button',
              title: 'Call to Action Button',
              type: 'object',
              fields: [
                defineField({
                  name: 'label',
                  title: 'Button Label',
                  type: 'string',
                }),
                defineField({
                  name: 'url',
                  title: 'Button URL',
                  type: 'url',
                }),
                defineField({
                  name: 'icon',
                  title: 'Button Icon',
                  type: 'string',
                  description:
                    'Lucide icon name (e.g., "ArrowRight", "Download", "ExternalLink")',
                }),
              ],
              validation: (Rule) =>
                Rule.custom((button) => {
                  if (!button) return true // Button is optional
                  const { label, url } = button
                  if ((label && !url) || (!label && url)) {
                    return 'Both label and URL are required if button is provided'
                  }
                  return true
                }),
            }),
          ],
          preview: {
            select: {
              title: 'title',
              backgroundColor: 'backgroundColor',
              itemCount: 'items.length',
            },
            prepare({ title, backgroundColor, itemCount }) {
              const colorName = backgroundColor === '#FDCDCD' ? 'Pink' : 'Green'
              return {
                title: title || 'Untitled column',
                subtitle: `${colorName} • ${itemCount || 0} items`,
              }
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      column1: 'columns.0.title',
      column2: 'columns.1.title',
    },
    prepare({ column1, column2 }) {
      return {
        title: 'Problem Section',
        subtitle: `${column1 || 'Column 1'} vs ${column2 || 'Column 2'}`,
      }
    },
  },
})
