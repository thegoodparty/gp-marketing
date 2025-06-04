import { defineField, defineType } from 'sanity'
import { ComponentIcon } from '@sanity/icons'

export const valueProposition = defineType({
  name: 'valueProposition',
  title: 'Value Proposition',
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
              name: 'columnType',
              title: 'Column Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Content', value: 'content' },
                  { title: 'Image', value: 'image' },
                  { title: 'Testimonial', value: 'testimonial' },
                ],
                layout: 'radio',
              },
              initialValue: 'content',
              validation: (Rule) => Rule.required(),
            }),
            // Content column fields
            defineField({
              name: 'title',
              title: 'Column Title',
              type: 'string',
              hidden: ({ parent }) => parent?.columnType !== 'content',
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  const parent = context.parent as { columnType?: string }
                  if (parent?.columnType === 'content' && !value) {
                    return 'Title is required for content columns'
                  }
                  return true
                }),
            }),
            defineField({
              name: 'backgroundColor',
              title: 'Background Color',
              type: 'string',
              options: {
                list: [
                  { title: 'Red', value: '#FDCDCD' },
                  { title: 'Blue', value: '#D1E7FE' },
                  { title: 'Yellow', value: '#FFEEB7' },
                  { title: 'Lavender', value: '#F1E5FF' },
                  { title: 'Wax Flower', value: '#FFF1C9' },
                  { title: 'Green', value: '#CCEADD' },
                  { title: 'White', value: '#FFFFFF' },
                ],
                layout: 'radio',
              },
              initialValue: '#FDCDCD',
              hidden: ({ parent }) => parent?.columnType === 'image',
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  const parent = context.parent as { columnType?: string }
                  if (
                    (parent?.columnType === 'content' ||
                      parent?.columnType === 'testimonial') &&
                    !value
                  ) {
                    return 'Background color is required for content and testimonial columns'
                  }
                  return true
                }),
            }),
            defineField({
              name: 'items',
              title: 'List Items',
              type: 'array',
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  const parent = context.parent as { columnType?: string }
                  if (parent?.columnType === 'content') {
                    if (!value || value.length === 0) {
                      return 'At least one item is required for content columns'
                    }
                    if (value.length > 4) {
                      return 'Maximum 4 items allowed'
                    }
                  }
                  return true
                }),
              hidden: ({ parent }) => parent?.columnType !== 'content',
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
              hidden: ({ parent }) => parent?.columnType !== 'content',
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
            // Image column fields
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {
                hotspot: true,
              },
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alt Text',
                  type: 'string',
                  description: 'Descriptive text for accessibility',
                  validation: (Rule) => Rule.required(),
                }),
              ],
              hidden: ({ parent }) => parent?.columnType !== 'image',
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  const parent = context.parent as { columnType?: string }
                  if (parent?.columnType === 'image' && !value) {
                    return 'Image is required for image columns'
                  }
                  return true
                }),
            }),
            // Testimonial column fields
            defineField({
              name: 'quote',
              title: 'Quote Text',
              type: 'text',
              rows: 4,
              hidden: ({ parent }) => parent?.columnType !== 'testimonial',
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  const parent = context.parent as { columnType?: string }
                  if (parent?.columnType === 'testimonial' && !value) {
                    return 'Quote is required for testimonial columns'
                  }
                  return true
                }),
            }),
            defineField({
              name: 'authorName',
              title: 'Author Name',
              type: 'string',
              hidden: ({ parent }) => parent?.columnType !== 'testimonial',
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  const parent = context.parent as { columnType?: string }
                  if (parent?.columnType === 'testimonial' && !value) {
                    return 'Author name is required for testimonial columns'
                  }
                  return true
                }),
            }),
            defineField({
              name: 'authorTitle',
              title: 'Author Title',
              type: 'string',
              hidden: ({ parent }) => parent?.columnType !== 'testimonial',
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  const parent = context.parent as { columnType?: string }
                  if (parent?.columnType === 'testimonial' && !value) {
                    return 'Author title is required for testimonial columns'
                  }
                  return true
                }),
            }),
            defineField({
              name: 'authorImage',
              title: 'Author Image',
              type: 'image',
              options: {
                hotspot: true,
              },
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alt Text',
                  type: 'string',
                  description: 'Descriptive text for accessibility',
                  validation: (Rule) => Rule.required(),
                }),
              ],
              hidden: ({ parent }) => parent?.columnType !== 'testimonial',
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  const parent = context.parent as { columnType?: string }
                  if (parent?.columnType === 'testimonial' && !value) {
                    return 'Author image is required for testimonial columns'
                  }
                  return true
                }),
            }),
          ],
          preview: {
            select: {
              columnType: 'columnType',
              title: 'title',
              backgroundColor: 'backgroundColor',
              itemCount: 'items.length',
              image: 'image',
              quote: 'quote',
              authorName: 'authorName',
              authorImage: 'authorImage',
            },
            prepare({
              columnType,
              title,
              backgroundColor,
              itemCount,
              image,
              quote,
              authorName,
              authorImage,
            }) {
              if (columnType === 'image') {
                return {
                  title: 'Image Column',
                  subtitle: 'Image',
                  media: image,
                }
              }

              if (columnType === 'testimonial') {
                return {
                  title: 'Testimonial Column',
                  subtitle: authorName || 'Unnamed author',
                  media: authorImage,
                }
              }

              const colorName =
                backgroundColor === '#FDCDCD'
                  ? 'Red'
                  : backgroundColor === '#D1E7FE'
                    ? 'Blue'
                    : backgroundColor === '#FFEEB7'
                      ? 'Yellow'
                      : backgroundColor === '#F1E5FF'
                        ? 'Lavender'
                        : backgroundColor === '#FFF1C9'
                          ? 'Wax Flower'
                          : backgroundColor === '#CCEADD'
                            ? 'Green'
                            : backgroundColor === '#FFFFFF'
                              ? 'White'
                              : 'Unknown'

              return {
                title: title || 'Content Column',
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
      column1Type: 'columns.0.columnType',
      column1Title: 'columns.0.title',
      column1AuthorName: 'columns.0.authorName',
      column2Type: 'columns.1.columnType',
      column2Title: 'columns.1.title',
      column2AuthorName: 'columns.1.authorName',
    },
    prepare({
      column1Type,
      column1Title,
      column1AuthorName,
      column2Type,
      column2Title,
      column2AuthorName,
    }) {
      const getColumnLabel = (
        type: string,
        title?: string,
        authorName?: string,
      ) => {
        switch (type) {
          case 'image':
            return 'Image'
          case 'testimonial':
            return authorName ? `Testimonial (${authorName})` : 'Testimonial'
          default:
            return title || 'Content'
        }
      }

      const column1Label = getColumnLabel(
        column1Type,
        column1Title,
        column1AuthorName,
      )
      const column2Label = getColumnLabel(
        column2Type,
        column2Title,
        column2AuthorName,
      )

      return {
        title: 'Value Proposition',
        subtitle: `${column1Label} vs ${column2Label}`,
      }
    },
  },
})
