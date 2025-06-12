import { defineType, defineField, defineArrayMember } from 'sanity'
import { ComponentIcon } from '@sanity/icons'
import { BACKGROUND_THEME_OPTIONS } from '../../lib/shared-constants'

export const stepperBlock = defineType({
  name: 'stepperBlock',
  title: 'Stepper Block',
  type: 'object',
  icon: ComponentIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'options', title: 'Options' },
  ],
  fields: [
    defineField({
      name: 'backgroundMode',
      title: 'Background Mode',
      type: 'string',
      group: 'options',
      options: {
        list: BACKGROUND_THEME_OPTIONS,
        layout: 'radio',
      },
      initialValue: 'creme',
    }),
    defineField({
      name: 'animateOnScroll',
      title: 'Animate On Scroll',
      type: 'boolean',
      group: 'options',
      initialValue: true,
    }),
    defineField({
      name: 'blockHeader',
      title: 'Header Section',
      type: 'blockHeader',
      group: 'content',
    }),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      of: [defineArrayMember({ type: 'stepperStep' })],
      validation: (rule) => rule.min(1).max(3).error('Provide 1 to 3 steps'),
      group: 'content',
    }),
  ],
  preview: {
    select: {
      title: 'blockHeader.heading',
      stepCount: 'steps.length',
    },
    prepare({ title, stepCount }) {
      return {
        title: title || 'Stepper Block',
        subtitle: `${stepCount || 0} step${stepCount === 1 ? '' : 's'}`,
      }
    },
  },
})
