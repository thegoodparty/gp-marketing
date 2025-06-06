import { defineField, defineType } from 'sanity'
import { ComponentIcon } from '@sanity/icons'

const BUTTON_VARIANT_OPTIONS = [
  { title: 'Default', value: 'default' },
  { title: 'Secondary', value: 'secondary' },
  { title: 'Destructive', value: 'destructive' },
  { title: 'Outline', value: 'outline' },
  { title: 'Ghost', value: 'ghost' },
  { title: 'White Ghost', value: 'whiteGhost' },
  { title: 'White Outline', value: 'whiteOutline' },
]

export const testimonialBlock = defineType({
  name: 'testimonialBlock',
  title: 'Testimonial Block',
  type: 'object',
  icon: ComponentIcon,
  fields: [
    defineField({
      name: 'header',
      title: 'Header Section',
      type: 'object',
      fields: [
        defineField({
          name: 'overline',
          title: 'Overline',
          type: 'string',
          description: 'Optional text above the main heading',
        }),
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'subhead',
          title: 'Subhead',
          type: 'text',
          rows: 2,
          description: 'Optional descriptive text below the heading',
        }),
        defineField({
          name: 'primaryButton',
          title: 'Primary Button',
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
              name: 'variant',
              title: 'Button Variant',
              type: 'string',
              options: {
                list: BUTTON_VARIANT_OPTIONS,
                layout: 'dropdown',
              },
              initialValue: 'default',
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
        defineField({
          name: 'secondaryButton',
          title: 'Secondary Button',
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
              name: 'variant',
              title: 'Button Variant',
              type: 'string',
              options: {
                list: BUTTON_VARIANT_OPTIONS,
                layout: 'dropdown',
              },
              initialValue: 'secondary',
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
              if (!button) return true 
              const { label, url } = button
              if ((label && !url) || (!label && url)) {
                return 'Both label and URL are required if button is provided'
              }
              return true
            }),
        }),
      ],
    }),
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      validation: (Rule) => Rule.min(3).max(12),
      of: [
        {
          type: 'object',
          name: 'testimonial',
          title: 'Testimonial',
          fields: [
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
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'quote',
              title: 'Quote Text',
              type: 'text',
              rows: 4,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'authorName',
              title: 'Author Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'authorTitle',
              title: 'Author Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
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
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              quote: 'quote',
              authorName: 'authorName',
              authorTitle: 'authorTitle',
              backgroundColor: 'backgroundColor',
              authorImage: 'authorImage',
            },
            prepare({ quote, authorName, authorTitle, backgroundColor, authorImage }) {
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

              const truncatedQuote = quote
                ? quote.length > 60
                  ? quote.substring(0, 60) + '...'
                  : quote
                : 'No quote'

              return {
                title: authorName || 'Unnamed author',
                subtitle: `${colorName} • ${truncatedQuote}`,
                media: authorImage,
              }
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      heading: 'header.heading',
      testimonialCount: 'testimonials.length',
      firstAuthor: 'testimonials.0.authorName',
    },
    prepare({ heading, testimonialCount, firstAuthor }) {
      return {
        title: 'Testimonial Block',
        subtitle: heading
          ? `"${heading}" • ${testimonialCount || 0} testimonials`
          : `${testimonialCount || 0} testimonials`,
      }
    },
  },
}) 