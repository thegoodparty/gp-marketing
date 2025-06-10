import { defineField, defineType } from 'sanity'
import { BulbOutlineIcon } from '@sanity/icons'
import { 
  CTA_VARIANT_OPTIONS, 
  LIGHT_BACKGROUND_COLOR_OPTIONS,
  BUTTON_VARIANT_OPTIONS 
} from '../../lib/shared-constants'

/**
 * Call to action schema object with two variants: Text+Image and Centered content.
 * Supports dual CTAs, background colors, and conditional image field.
 */

export const callToAction = defineType({
  name: 'callToAction',
  title: 'Call to Action',
  type: 'object',
  icon: BulbOutlineIcon,
  fields: [
    // Variant Selection
    defineField({
      name: 'variant',
      title: 'Layout Variant',
      type: 'string',
      options: {
        list: CTA_VARIANT_OPTIONS,
        layout: 'radio',
      },
      initialValue: 'centered',
      validation: (Rule) => Rule.required(),
    }),

    // Background Color
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'string',
      options: {
        list: LIGHT_BACKGROUND_COLOR_OPTIONS,
        layout: 'radio',
      },
      initialValue: 'brightYellow-100',
      validation: (Rule) => Rule.required(),
    }),

    // Content Fields
    defineField({
      name: 'overline',
      title: 'Overline',
      type: 'string',
      description: 'Optional text above the main heading (.text-large, 18px)',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Main heading (48px for centered, 60px for text+image)',
    }),
    defineField({
      name: 'subhead',
      title: 'Subhead',
      type: 'text',
      description: 'Optional descriptive text (text-lead, 18px)',
    }),

    // Image (conditional on variant)
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.variant !== 'textImage',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { variant?: string }
          if (parent?.variant === 'textImage' && !value) {
            return 'Image is required for Text + Image variant'
          }
          return true
        }),
      description: '4:3 aspect ratio recommended',
    }),

    // Primary CTA
    defineField({
      name: 'primaryCta',
      title: 'Primary CTA',
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
          description: 'Lucide icon name (e.g., "ArrowRight", "Download")',
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

    // Secondary CTA (optional)
    defineField({
      name: 'secondaryCta',
      title: 'Secondary CTA',
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
          type: 'link',
        }),
        defineField({
          name: 'icon',
          title: 'Button Icon',
          type: 'string',
          description: 'Lucide icon name (e.g., "ArrowRight", "Download")',
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
      ],
      validation: (Rule) =>
        Rule.custom((button) => {
          if (!button) return true
          const { label, url } = button
          if ((label && !url) || (!label && url)) {
            return 'Both label and URL are required if secondary CTA is provided'
          }
          return true
        }),
    }),

    // Caption (for centered variant)
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      hidden: ({ parent }) => parent?.variant !== 'centered',
      description: 'Small text below buttons (centered variant only)',
    }),
  ],
  preview: {
    select: {
      title: 'heading',
      variant: 'variant',
      backgroundColor: 'backgroundColor',
    },
    prepare(selection) {
      const { title, variant, backgroundColor } = selection
      const variantLabel = variant === 'textImage' ? 'Text + Image' : 'Centered'
      
      return {
        title: title || 'Call to Action',
        subtitle: `${variantLabel} • ${backgroundColor}`,
      }
    },
  },
}) 