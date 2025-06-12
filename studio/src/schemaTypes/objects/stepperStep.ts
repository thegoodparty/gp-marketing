import { defineType, defineField, defineArrayMember } from 'sanity'
import { ComponentIcon } from '@sanity/icons'
import { ICON_CONTAINER_COLOR_OPTIONS } from '../../lib/shared-constants'

export const stepperStep = defineType({
  name: 'stepperStep',
  title: 'Stepper – Step',
  type: 'object',
  icon: ComponentIcon,
  fields: [
    defineField({
      name: 'cardHeader',
      type: 'blockHeader',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: { hotspot: true },
      // Always visible, image required
      validation: (rule) => rule.required().error('Image is required'),
    }),
    defineField({
      name: 'items',
      title: 'List Items',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'item',
          fields: [
            defineField({
              name: 'icon',
              type: 'string',
              title: 'Icon',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'title',
              type: 'string',
              title: 'Title',
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: 'body', type: 'text', title: 'Body', rows: 2 }),
          ],
        }),
      ],
      validation: (Rule) => Rule.max(8),
    }),
    defineField({
      name: 'iconContainerColor',
      title: 'Icon Container Color',
      type: 'string',
      options: {
        list: ICON_CONTAINER_COLOR_OPTIONS,
        layout: 'radio',
      },
      initialValue: ICON_CONTAINER_COLOR_OPTIONS[0].value,
    }),
  ],
  preview: {
    select: {
      title: 'cardHeader.heading',
    },
    prepare(selection) {
      return {
        title: selection.title || 'Stepper Step',
      }
    },
  },
})
