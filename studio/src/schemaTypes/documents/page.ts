import { defineField, defineType } from 'sanity'
import { DocumentIcon } from '@sanity/icons'

/**
 * Page schema.  Define and edit the fields for the 'page' content type.
 * Learn more: https://www.sanity.io/docs/schema-types
 */

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      validation: (Rule) => Rule.required(),
      options: {
        source: 'name',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'string',
    }),
    defineField({
      name: 'pageBuilder',
      title: 'Page builder',
      type: 'array',
      of: [
        { type: 'pageHero' },
        { type: 'heroBlock' },
        { type: 'valueProposition' },
        { type: 'testimonialBlock' },
        { type: 'featureModules' },
        { type: 'ctaCardBlock' },
        { type: 'faqBlock' },
        { type: 'callToAction' },
        { type: 'infoSection' },
        { type: 'stepperBlock' },
        { type: 'pricingBlock' },
        { type: 'candidatesBanner' },
        { type: 'ctaBanner' },
        { type: 'carouselBlock' },
        { type: 'embedBlock' },
        { type: 'embedFullWidthBlock' },
      ],
      options: {
        insertMenu: {
          // Configure the "Add Item" menu to display a thumbnail preview of the content type. https://www.sanity.io/docs/array-type#efb1fe03459d
          views: [
            {
              name: 'grid',
              previewImageUrl: (schemaTypeName) =>
                `/static/page-builder-thumbnails/${schemaTypeName}.webp`,
            },
          ],
        },
      },
    }),
  ],
})
