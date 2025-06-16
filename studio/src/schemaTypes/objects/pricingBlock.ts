import { defineField, defineType } from 'sanity'
import { ComponentIcon } from '@sanity/icons'

export const pricingBlock = defineType({
  name: 'pricingBlock',
  title: 'Pricing Block',
  type: 'object',
  icon: ComponentIcon,
  fields: [
    defineField({
      name: 'header',
      title: 'Header Section',
      type: 'blockHeader',
    }),
    defineField({
      name: 'layout',
      title: 'Layout Variant',
      type: 'string',
      options: {
        list: [
          { title: 'Three Column', value: 'threeColumn' },
          { title: 'Two Column', value: 'twoColumn' },
        ],
        layout: 'radio',
      },
      initialValue: 'threeColumn',
    }),
    defineField({
      name: 'plans',
      title: 'Pricing Plans',
      type: 'array',
      of: [{ type: 'pricingPlan' }],
      validation: (Rule) => Rule.min(2).max(3),
    }),
  ],
  preview: {
    select: {
      heading: 'header.heading',
      planCount: 'plans.length',
    },
    prepare({ heading, planCount }) {
      return {
        title: heading || 'Pricing Block',
        subtitle: `${planCount || 0} plan${planCount === 1 ? '' : 's'}`,
      }
    },
  },
}) 