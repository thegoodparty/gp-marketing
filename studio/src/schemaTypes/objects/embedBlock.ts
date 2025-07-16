import { defineField, defineType } from 'sanity'
import { CodeIcon } from '@sanity/icons'
import { BACKGROUND_THEME_OPTIONS, BackgroundTheme } from '../../../../nextjs-app/app/types/design-tokens'

export const embedBlock = defineType({
  name: 'embedBlock',
  title: 'Embed Block',
  type: 'object',
  icon: CodeIcon,
  fields: [
    defineField({
      name: 'embedCode',
      title: 'Embed HTML Code',
      type: 'text',
      description: 'Paste the raw HTML/embed code here (e.g., iframe, div + script). Ensure it\'s sanitized if from untrusted sources.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'outerBackground',
      title: 'Outer Background Theme',
      type: 'string',
      options: {
        list: [...BACKGROUND_THEME_OPTIONS],
        layout: 'radio',
      },
      initialValue: BackgroundTheme.WHITE,
    }),
    defineField({
      name: 'width',
      title: 'Inner Width',
      type: 'string',
      description: 'e.g., 100%, 500px',
      initialValue: '100%',
    }),
    defineField({
      name: 'height',
      title: 'Inner Height',
      type: 'string',
      description: 'e.g., 500px, auto',
      initialValue: 'auto',
    }),
  ],
  preview: {
    select: {
      embedCode: 'embedCode',
      outerBackground: 'outerBackground',
    },
    prepare({ embedCode, outerBackground }) {
      return {
        title: 'Embed Block',
        subtitle: `${outerBackground} background • ${embedCode?.slice(0, 50)}...`,
      }
    },
  },
}) 