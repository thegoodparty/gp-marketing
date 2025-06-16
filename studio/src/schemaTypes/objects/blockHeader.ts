import { defineField, defineType } from 'sanity'
import { TextIcon } from '@sanity/icons'
import { BUTTON_VARIANT_OPTIONS } from '../../lib/shared-constants'

export const blockHeader = defineType({
  name: 'blockHeader',
  title: 'Block Header',
  type: 'object',
  icon: TextIcon,
  fields: [
    defineField({ name: 'overline', type: 'string', title: 'Overline' }),
    defineField({
      name: 'heading',
      type: 'string',
      title: 'Heading',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'subhead', type: 'string', title: 'Subhead' }),
    defineField({
      name: 'primaryButton',
      title: 'Primary Button',
      type: 'object',
      fields: [
        defineField({ name: 'label', type: 'string', title: 'Label' }),
        defineField({
          name: 'url',
          type: 'link',
          title: 'URL',
          initialValue: { linkType: '' },
        }),
        defineField({
          name: 'variant',
          type: 'string',
          title: 'Variant',
          options: { list: BUTTON_VARIANT_OPTIONS, layout: 'dropdown' },
        }),
        defineField({ name: 'icon', type: 'string', title: 'Icon' }),
      ],
      validation: (Rule) =>
        Rule.custom((btn) => {
          if (!btn) return true
          const { label, url } = btn as any
          const urlEmpty = !url || Object.values(url).every((v) => !v)
          if (!label && urlEmpty) return true
          if (label && urlEmpty) return 'URL is required when label is provided'
          if (!label && !urlEmpty) return 'Label is required when URL is provided'
          return true
        }),
    }),
    defineField({
      name: 'secondaryButton',
      title: 'Secondary Button',
      type: 'object',
      fields: [
        defineField({ name: 'label', type: 'string', title: 'Label' }),
        defineField({
          name: 'url',
          type: 'link',
          title: 'URL',
          initialValue: { linkType: '' },
        }),
        defineField({
          name: 'variant',
          type: 'string',
          title: 'Variant',
          options: { list: BUTTON_VARIANT_OPTIONS, layout: 'dropdown' },
        }),
        defineField({ name: 'icon', type: 'string', title: 'Icon' }),
      ],
      validation: (Rule) =>
        Rule.custom((btn) => {
          if (!btn) return true
          const { label, url } = btn as any
          const urlEmpty = !url || Object.values(url).every((v) => !v)
          if (!label && urlEmpty) return true
          if (label && urlEmpty) return 'URL is required when label is provided'
          if (!label && !urlEmpty) return 'Label is required when URL is provided'
          return true
        }),
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare({ title }) {
      return {
        title: title || 'Block Header',
      }
    },
  },
})
