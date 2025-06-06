import { defineField, defineType } from 'sanity'
import { ComponentIcon } from '@sanity/icons'

const ICON_CONTAINER_COLOR_OPTIONS = [
  { title: 'Red', value: 'red-200' },
  { title: 'Blue', value: 'blue-200' },
  { title: 'Bright Yellow', value: 'brightYellow-200' },
  { title: 'Orange', value: 'orange-200' },
  { title: 'Lavender', value: 'lavender-200' },
  { title: 'Wax Flower', value: 'waxFlower-200' },
  { title: 'Halo Green', value: 'haloGreen-200' },
]

const LINK_TARGET_OPTIONS = [
  { title: 'New Tab', value: '_blank' },
  { title: 'Same Tab', value: '_self' },
]

export const ctaCardBlock = defineType({
  name: 'ctaCardBlock',
  title: 'CTA Card Block',
  type: 'object',
  icon: ComponentIcon,
  fields: [
    defineField({
      name: 'cards',
      title: 'CTA Cards',
      type: 'array',
      validation: (Rule) => Rule.min(2).max(2),
      of: [
        {
          type: 'object',
          name: 'ctaCard',
          title: 'CTA Card',
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
              name: 'backgroundColor',
              title: 'Background Color',
              type: 'string',
              options: {
                list: ICON_CONTAINER_COLOR_OPTIONS,
                layout: 'radio',
              },
              initialValue: 'blue-200',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'Link URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'linkTarget',
              title: 'Link Target',
              type: 'string',
              options: {
                list: LINK_TARGET_OPTIONS,
                layout: 'radio',
              },
              initialValue: '_blank',
            }),
            defineField({
              name: 'icon',
              title: 'Arrow Icon',
              type: 'string',
              description: 'Lucide icon name (e.g., "ArrowRight", "ArrowUpRight", "ExternalLink")',
              initialValue: 'ArrowRight',
            }),
          ],
          preview: {
            select: {
              heading: 'heading',
              overline: 'overline',
              backgroundColor: 'backgroundColor',
              url: 'url',
            },
            prepare({ heading, overline, backgroundColor, url }) {
              const colorName = ICON_CONTAINER_COLOR_OPTIONS.find(
                option => option.value === backgroundColor
              )?.title || 'Unknown'

              const title = heading || 'Untitled Card'
              const subtitle = overline 
                ? `${colorName} • ${overline}` 
                : `${colorName} • ${url}`

              return {
                title,
                subtitle,
              }
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      cardCount: 'cards.length',
      firstHeading: 'cards.0.heading',
      secondHeading: 'cards.1.heading',
    },
    prepare({ cardCount, firstHeading, secondHeading }) {
      const title = 'CTA Card Block'
      const subtitle = cardCount === 2
        ? `"${firstHeading || 'Untitled'}" + "${secondHeading || 'Untitled'}"`
        : `${cardCount || 0} cards`

      return {
        title,
        subtitle,
      }
    },
  },
}) 