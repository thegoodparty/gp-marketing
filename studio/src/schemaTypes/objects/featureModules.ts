import { defineField, defineType } from 'sanity'
import { ComponentIcon } from '@sanity/icons'

// Matches ButtonVariant enum in nextjs-app/app/types/design-tokens.ts
const BUTTON_VARIANT_OPTIONS = [
  { title: 'Default', value: 'default' },
  { title: 'Secondary', value: 'secondary' },
  { title: 'Destructive', value: 'destructive' },
  { title: 'Outline', value: 'outline' },
  { title: 'Ghost', value: 'ghost' },
  { title: 'White Ghost', value: 'whiteGhost' },
  { title: 'White Outline', value: 'whiteOutline' },
]

// Matches BackgroundTheme enum in nextjs-app/app/types/design-tokens.ts  
const BACKGROUND_THEME_OPTIONS = [
  { title: 'Dark', value: 'dark' },
  { title: 'Creme', value: 'creme' },
  { title: 'White', value: 'white' },
]

// Matches IconContainerColor enum in nextjs-app/app/types/design-tokens.ts
const ICON_CONTAINER_COLOR_OPTIONS = [
  { title: 'Red', value: 'red-200' },
  { title: 'Blue', value: 'blue-200' },
  { title: 'Bright Yellow', value: 'brightYellow-200' },
  { title: 'Orange', value: 'orange-200' },
  { title: 'Lavender', value: 'lavender-200' },
  { title: 'Wax Flower', value: 'waxFlower-200' },
  { title: 'Halo Green', value: 'haloGreen-200' },
]

export const featureModules = defineType({
  name: 'featureModules',
  title: 'Feature Modules',
  type: 'object',
  icon: ComponentIcon,
  fields: [
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'string',
      options: {
        list: BACKGROUND_THEME_OPTIONS,
        layout: 'radio',
      },
      initialValue: 'creme',
      validation: (Rule) => Rule.required(),
    }),
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
              initialValue: 'outline',
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
    }),
    defineField({
      name: 'features',
      title: 'Feature Cards',
      type: 'array',
      validation: (Rule) => Rule.min(3).max(9),
      of: [
        {
          type: 'object',
          name: 'featureCard',
          title: 'Feature Card',
          fields: [
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
              description:
                'Lucide icon name (e.g., "Sparkles", "Users", "Star")',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'iconContainerColor',
              title: 'Icon Container Color',
              type: 'string',
              options: {
                list: ICON_CONTAINER_COLOR_OPTIONS,
                layout: 'dropdown',
              },
              initialValue: 'blue-200',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'body',
              title: 'Body Text',
              type: 'text',
              rows: 3,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'button',
              title: 'CTA Button',
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
                    'Lucide icon name (defaults to ArrowUpRight if not specified)',
                  placeholder: 'ArrowUpRight',
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
              heading: 'heading',
              body: 'body',
              icon: 'icon',
              iconContainerColor: 'iconContainerColor',
            },
            prepare({ heading, body, icon, iconContainerColor }) {
              return {
                title: heading,
                subtitle: `${icon} • ${body?.substring(0, 50)}${
                  body?.length > 50 ? '...' : ''
                }`,
                media: ComponentIcon,
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
      backgroundColor: 'backgroundColor',
      featureCount: 'features.length',
      firstFeature: 'features.0.heading',
    },
    prepare({ heading, backgroundColor, featureCount, firstFeature }) {
      const bgLabel =
        backgroundColor === 'dark'
          ? 'Dark'
          : backgroundColor === 'creme'
            ? 'Creme'
            : 'White'

      return {
        title: heading || 'Feature Modules',
        subtitle: `${bgLabel} background • ${featureCount || 0} features${
          firstFeature ? ` • ${firstFeature}...` : ''
        }`,
        media: ComponentIcon,
      }
    },
  },
}) 