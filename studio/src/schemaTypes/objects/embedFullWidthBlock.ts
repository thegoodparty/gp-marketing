import { defineField, defineType } from 'sanity'
import { CodeIcon } from '@sanity/icons'
import { BACKGROUND_THEME_OPTIONS } from '../../../../nextjs-app/app/types/design-tokens'
import { EMBED_VARIANT_OPTIONS } from '../../../../nextjs-app/app/types/ui'

export const embedFullWidthBlock = defineType({
  name: 'embedFullWidthBlock',
  title: 'Embed Full Width Block',
  type: 'object',
  icon: CodeIcon,
  fields: [
    defineField({
      name: 'embedCode',
      title: 'Embed Code or Iframe Src',
      type: 'text',
      description: 'Paste full HTML or just the src URL for iframe.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'variant',
      title: 'Embed Variant',
      type: 'string',
      options: { list: [...EMBED_VARIANT_OPTIONS], layout: 'radio' },
      initialValue: 'contained',
    }),
    defineField({
      name: 'height',
      title: 'Height',
      type: 'string',
      description: 'e.g., 600px, 100vh, 400px',
      initialValue: '600px',
    }),
    defineField({
      name: 'outerBackground',
      title: 'Background Theme',
      type: 'string',
      options: { list: [...BACKGROUND_THEME_OPTIONS], layout: 'radio' },
      initialValue: 'white',
    }),
    defineField({
      name: 'mobileMessage',
      title: 'Mobile Fallback Message',
      type: 'string',
      initialValue: 'This content is best viewed on desktop.',
    }),
    defineField({
      name: 'mobileVideo',
      title: 'Mobile Fallback Video URL',
      type: 'url',
      description: 'Optional video to show on mobile instead of message.',
    }),
  ],
  preview: {
    select: { embedCode: 'embedCode', variant: 'variant' },
    prepare({ embedCode, variant }) {
      return { title: 'Embed Full Width', subtitle: `${variant} • ${embedCode?.slice(0, 50)}...` }
    },
  },
}) 