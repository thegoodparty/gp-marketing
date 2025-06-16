import { defineField, defineType } from 'sanity'

export const pricingPlan = defineType({
  name: 'pricingPlan',
  title: 'Pricing Plan',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Plan Name',
      type: 'string',
    }),
    defineField({
      name: 'price',
      title: 'Monthly Price (USD)',
      type: 'number',
      description: 'Numeric value, displayed as $price per month',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'string',
      description: 'Optional short descriptor displayed above the price',
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'string',
      options: {
        list: [
          { title: 'Dark (Brand Secondary)', value: 'brandSecondary' },
          { title: 'Lavender', value: 'lavender100' },
          { title: 'Bright Yellow', value: 'brightYellow300' },
        ],
        layout: 'radio',
      },
      initialValue: 'brandSecondary',
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'featureItem',
          fields: [
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
              description: 'Lucide icon name (defaults to "Check")',
            }),
            defineField({
              name: 'text',
              title: 'Text',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: 'text', subtitle: 'icon' },
          },
        },
      ],
      description: 'List of features with optional icons.',
    }),
    defineField({
      name: 'ctaButton',
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
          title: 'Icon',
          type: 'string',
          description: 'Lucide icon name (optional)',
        }),
        defineField({
          name: 'target',
          title: 'Link Target',
          type: 'string',
          options: {
            list: [
              { title: 'New Tab', value: '_blank' },
              { title: 'Same Tab', value: '_self' },
            ],
            layout: 'radio',
          },
          initialValue: '_blank',
        }),
      ],
      validation: (Rule) =>
        Rule.custom((btn) => {
          if (!btn) return true
          const { label, url } = btn
          if ((label && !url) || (!label && url)) {
            return 'Provide both label and URL or leave both blank'
          }
          return true
        }),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'price',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Untitled Plan',
        subtitle: subtitle ? `$${subtitle}/month` : 'Price not set',
      }
    },
  },
}) 