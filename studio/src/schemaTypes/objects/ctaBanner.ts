import { defineField, defineType } from 'sanity'
import { BulbOutlineIcon } from '@sanity/icons'
import {
  BUTTON_VARIANT_OPTIONS,
  BACKGROUND_THEME_OPTIONS,
  ICON_CONTAINER_COLOR_OPTIONS,
  TEXT_COLOR_OPTIONS,
} from '../../lib/shared-constants'

export const ctaBanner = defineType({
  name: 'ctaBanner',
  title: 'CTA Banner',
  type: 'object',
  icon: BulbOutlineIcon,
  fields: [
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Main headline text (bold, 48px desktop, 28px mobile).',
    }),
    defineField({
      name: 'body',
      title: 'Body Copy',
      type: 'text',
      description: 'Optional supporting text displayed below the headline.',
    }),
    defineField({
      name: 'outerBackground',
      title: 'Outer Background Theme',
      type: 'string',
      options: {
        list: BACKGROUND_THEME_OPTIONS,
        layout: 'radio',
      },
      initialValue: 'white',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'innerBackground',
      title: 'Inner Background Color',
      type: 'string',
      options: {
        list: ICON_CONTAINER_COLOR_OPTIONS,
        layout: 'radio',
      },
      initialValue: 'blue-200',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'textColor',
      title: 'Text Color',
      type: 'string',
      options: {
        list: TEXT_COLOR_OPTIONS,
        layout: 'radio',
      },
      initialValue: 'white',
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Optional background image for the inner card (will cover entire card).',
    }),
    defineField({
      name: 'cta',
      title: 'CTA Button',
      type: 'object',
      fields: [
        defineField({
          name: 'label',
          title: 'Button Label',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'url',
          title: 'Button URL',
          type: 'link',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'icon',
          title: 'Button Icon',
          type: 'string',
          description: 'Lucide icon name (e.g., "ArrowRight").',
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
      ],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'headline',
    },
    prepare({ title }) {
      return {
        title: title || 'CTA Banner',
      }
    },
  },
}) 