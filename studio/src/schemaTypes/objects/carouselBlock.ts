import { defineField, defineType } from 'sanity'
import { ComponentIcon } from '@sanity/icons'
import {
  BUTTON_VARIANT_OPTIONS,
  BACKGROUND_COLOR_OPTIONS,
  BACKGROUND_THEME_OPTIONS,
} from '../shared/constants'

export const carouselBlock = defineType({
  name: 'carouselBlock',
  title: 'Carousel Block',
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
            defineField({ name: 'label', title: 'Button Label', type: 'string' }),
            defineField({ name: 'url', title: 'Button URL', type: 'url' }),
            defineField({
              name: 'variant',
              title: 'Button Variant',
              type: 'string',
              options: { list: [...BUTTON_VARIANT_OPTIONS], layout: 'dropdown' },
              initialValue: 'default',
            }),
            defineField({
              name: 'icon',
              title: 'Button Icon',
              type: 'string',
              description: 'Lucide icon name (e.g., "ArrowRight")',
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
        defineField({
          name: 'secondaryButton',
          title: 'Secondary Button',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Button Label', type: 'string' }),
            defineField({ name: 'url', title: 'Button URL', type: 'url' }),
            defineField({
              name: 'variant',
              title: 'Button Variant',
              type: 'string',
              options: { list: [...BUTTON_VARIANT_OPTIONS], layout: 'dropdown' },
              initialValue: 'secondary',
            }),
            defineField({
              name: 'icon',
              title: 'Button Icon',
              type: 'string',
              description: 'Lucide icon name (e.g., "ArrowRight")',
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
      hidden: ({ parent }) => parent?.variant === 'candidates',
      validation: (Rule) => Rule.min(1).max(20),
      of: [
        {
          type: 'object',
          name: 'slide',
          title: 'Slide',
          fields: [
            defineField({
              name: 'backgroundColor',
              title: 'Background Color',
              type: 'string',
              options: {
                list: [...BACKGROUND_COLOR_OPTIONS],
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
              options: { hotspot: true },
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alt Text',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                }),
              ],
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
    }),

    defineField({
      name: 'background',
      title: 'Background Color',
      type: 'string',
      options: {
        list: [...BACKGROUND_THEME_OPTIONS],
        layout: 'radio',
      },
      initialValue: 'dark',
    }),

    defineField({
      name: 'variant',
      title: 'Variant',
      type: 'string',
      options: {
        list: [
          { title: 'Testimonials', value: 'testimonials' },
          { title: 'Candidates', value: 'candidates' },
        ],
        layout: 'radio',
      },
      initialValue: 'testimonials',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'candidates',
      title: 'Candidates',
      type: 'array',
      hidden: ({ parent }) => parent?.variant !== 'candidates',
      validation: (Rule) => Rule.min(1).max(20),
      of: [
        {
          type: 'object',
          name: 'candidate',
          title: 'Candidate',
          fields: [
            defineField({
              name: 'backgroundColor',
              title: 'Background Color',
              type: 'string',
              options: { list: [...BACKGROUND_COLOR_OPTIONS], layout: 'radio' },
              initialValue: '#CCEADD',
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 4, validation: (Rule) => Rule.required() }),
            defineField({ name: 'candidateName', title: 'Candidate Name', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'candidateTitle', title: 'Candidate Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({
              name: 'candidateImage',
              title: 'Candidate Image',
              type: 'image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', title: 'Alt', type: 'string', validation: (Rule) => Rule.required() })],
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      heading: 'header.heading',
      slideCount: 'testimonials.length',
    },
    prepare({ heading, slideCount }) {
      return {
        title: heading || 'Carousel Block',
        subtitle: `${slideCount || 0} Testimonial${slideCount === 1 ? '' : 's'}`,
      }
    },
  },
}) 