import { defineType, defineField } from 'sanity'
import { UsersIcon } from '@sanity/icons'

export const candidatesBanner = defineType({
  name: 'candidatesBanner',
  title: 'Candidates Banner',
  type: 'object',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Statistic or statement shown next to avatars (22px, bold).',
    }),
    defineField({
      name: 'profiles',
      title: 'Profile Photos',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      validation: (Rule) => Rule.min(3).max(10),
      description: 'Upload at least three candidate headshots (4:4).',
    }),
  ],
  preview: {
    select: {
      title: 'headline',
      media: 'profiles.0',
    },
    prepare({ title, media }) {
      return {
        title: title || 'Candidates Banner',
        media,
      }
    },
  },
}) 