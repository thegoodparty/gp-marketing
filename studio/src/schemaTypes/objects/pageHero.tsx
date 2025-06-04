import { defineField, defineType } from 'sanity'

export const pageHero = defineType({
  name: 'pageHero',
  title: 'Hero',
  type: 'object',
  fields: [
    defineField({
      name: 'color',
      title: 'Color Scheme',
      type: 'string',
      options: {
        list: [
          { title: 'Dark', value: 'dark' },
          { title: 'Light', value: 'light' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
      description:
        'Choose between a dark or light color scheme for the hero section.',
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'heading',
      title: 'Heading (H1)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading (H2 or subtitle)',
      type: 'blockContent',
      description: 'Rich text for subheading (supports HTML content).',
    }),
    defineField({
      name: 'mainCta',
      title: 'Main CTA',
      type: 'object',
      fields: [
        {
          name: 'label',
          title: 'Label',
          type: 'string',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'url',
          title: 'URL',
          type: 'url',
          validation: (Rule) => Rule.required(),
        },
      ],
    }),
    defineField({
      name: 'secondaryCta',
      title: 'Secondary CTA',
      type: 'object',
      fields: [
        { name: 'label', title: 'Label', type: 'string' },
        { name: 'url', title: 'URL', type: 'url' },
      ],
    }),
  ],
})
