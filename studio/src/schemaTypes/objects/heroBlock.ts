import { defineField, defineType } from 'sanity'
import { PlayIcon } from '@sanity/icons'
import { 
  BACKGROUND_THEME_OPTIONS
} from '../../lib/shared-constants'

export const heroBlock = defineType({
  name: 'heroBlock',
  title: 'Hero Block',
  type: 'object',
  icon: PlayIcon,
  fields: [
    // Header Section
    defineField({
      name: 'header',
      title: 'Header Content',
      type: 'blockHeader',
      validation: (Rule) => Rule.required(),
    }),

    // Header Alignment
    defineField({
      name: 'headerAlignment',
      title: 'Header Alignment',
      type: 'string',
      options: {
        list: [
          { title: 'Left', value: 'left' },
          { title: 'Center', value: 'center' },
          { title: 'Right', value: 'right' },
        ],
        layout: 'radio',
      },
      initialValue: 'center',
    }),

    // Background Theme
    defineField({
      name: 'backgroundTheme',
      title: 'Background Theme',
      type: 'string',
      options: {
        list: BACKGROUND_THEME_OPTIONS,
        layout: 'radio',
      },
      initialValue: 'white',
    }),

    // Layout Variant
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Header Only', value: 'headerOnly' },
          { title: 'Two Column - Image Left', value: 'twoColumnImageLeft' },
          { title: 'Two Column - Image Right', value: 'twoColumnImageRight' },
          { title: 'Image Full Width', value: 'imageFullWidth' },
          { title: 'Image Contained', value: 'imageContained' },
        ],
        layout: 'radio',
      },
      initialValue: 'headerOnly',
    }),

    // Image (conditional)
    defineField({
      name: 'image',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.layout === 'headerOnly',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { layout?: string }
          if (parent?.layout && parent.layout !== 'headerOnly' && !value) {
            return 'Image is required for this layout variant'
          }
          return true
        }),
    }),

    // Image Containment (conditional)
    defineField({
      name: 'imageContained',
      title: 'Contained Image',
      type: 'boolean',
      description: 'Add 80px padding around the image',
      hidden: ({ parent }) => 
        !parent?.layout || 
        !['twoColumnImageLeft', 'twoColumnImageRight'].includes(parent.layout),
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      heading: 'header.heading',
      layout: 'layout',
      backgroundTheme: 'backgroundTheme',
      image: 'image',
    },
    prepare({ heading, layout, backgroundTheme, image }) {
      return {
        title: heading || 'Hero Block',
        subtitle: `${layout} • ${backgroundTheme} background`,
        media: image,
      }
    },
  },
}) 