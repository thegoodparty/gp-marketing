import { defineField, defineType } from 'sanity'
import { ComponentIcon } from '@sanity/icons'
import {
  BUTTON_VARIANT_OPTIONS,
  BACKGROUND_THEME_OPTIONS,
  ICON_CONTAINER_COLOR_OPTIONS,
} from '../../lib/shared-constants'

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
      name: 'headerAlignment',
      title: 'Header Alignment',
      type: 'string',
      options: {
        list: [
          { title: 'Centered', value: 'center' },
          { title: 'Left Aligned', value: 'left' },
        ],
        layout: 'radio',
      },
      initialValue: 'center',
      description: 'Choose how to align the header content',
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
              name: 'image',
              title: 'Image',
              type: 'image',
              description: 'Optional image to display below the text content',
              options: {
                hotspot: true,
              },
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alt Text',
                  type: 'string',
                  description: 'Important for accessibility and SEO',
                }),
                defineField({
                  name: 'caption',
                  title: 'Caption',
                  type: 'string',
                  description: 'Optional caption text below the image',
                }),
              ],
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
