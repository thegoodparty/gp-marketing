import {CogIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import * as demo from '../../lib/initialValues'

/**
 * Settings schema Singleton.  Singletons are single documents that are displayed not in a collection, handy for things like site settings and other global configurations.
 * Learn more: https://www.sanity.io/docs/create-a-link-to-a-single-edit-page-in-your-main-document-type-list
 */

export const settings = defineType({
  name: 'settings',
  title: 'Settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'navigation',
      title: 'Navigation',
      type: 'object',
      fields: [
        defineField({
          name: 'logo',
          title: 'Site Logo',
          type: 'image',
          description: 'The main logo for the site. Will be displayed in the header.',
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alternative text',
              type: 'string',
              initialValue: 'GoodParty.org',
              validation: (rule) => rule.required(),
            }),
          ],
        }),
        defineField({
          name: 'items',
          title: 'Navigation Items',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'category',
              title: 'Category',
              fields: [
                defineField({
                  name: 'title',
                  title: 'Category Title',
                  type: 'string',
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: 'links',
                  title: 'Links',
                  type: 'array',
                  of: [
                    defineArrayMember({
                      type: 'object',
                      fields: [
                        defineField({
                          name: 'title',
                          title: 'Link Title',
                          type: 'string',
                          validation: (rule) => rule.required(),
                        }),
                        defineField({
                          name: 'icon',
                          title: 'Link Icon',
                          type: 'string',
                          description: 'Enter the Material Design icon name (e.g., MdHome, MdSettings, MdLink). Must start with "Md". See https://react-icons.github.io/react-icons/icons?name=md for available icons.',
                          validation: (rule) => rule.custom((value) => {
                            if (!value) return true;
                            if (!value.startsWith('Md')) {
                              return 'Icon name must start with "Md" for Material Design icons';
                            }
                            return true;
                          }),
                        }),
                        defineField({
                          name: 'type',
                          title: 'Link Type',
                          type: 'string',
                          options: {
                            list: [
                              { title: 'Internal Page', value: 'internal' },
                              { title: 'External URL', value: 'external' },
                            ],
                          },
                          validation: (rule) => rule.required(),
                        }),
                        defineField({
                          name: 'page',
                          title: 'Internal Page',
                          type: 'reference',
                          to: [{ type: 'page' }],
                          hidden: ({ parent }) => parent?.type !== 'internal',
                        }),
                        defineField({
                          name: 'url',
                          title: 'External URL',
                          type: 'url',
                          hidden: ({ parent }) => parent?.type !== 'external',
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            defineArrayMember({
              type: 'object',
              name: 'link',
              title: 'Single Link',
              fields: [
                defineField({
                  name: 'title',
                  title: 'Link Title',
                  type: 'string',
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: 'icon',
                  title: 'Link Icon',
                  type: 'string',
                  description: 'Enter the Material Design icon name (e.g., MdHome, MdSettings, MdLink). Must start with "Md". See https://react-icons.github.io/react-icons/icons?name=md for available icons.',
                  validation: (rule) => rule.custom((value) => {
                    if (!value) return true;
                    if (!value.startsWith('Md')) {
                      return 'Icon name must start with "Md" for Material Design icons';
                    }
                    return true;
                  }),
                }),
                defineField({
                  name: 'type',
                  title: 'Link Type',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'Internal Page', value: 'internal' },
                      { title: 'External URL', value: 'external' },
                    ],
                  },
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: 'page',
                  title: 'Internal Page',
                  type: 'reference',
                  to: [{ type: 'page' }],
                  hidden: ({ parent }) => parent?.type !== 'internal',
                }),
                defineField({
                  name: 'url',
                  title: 'External URL',
                  type: 'url',
                  hidden: ({ parent }) => parent?.type !== 'external',
                }),
              ],
            }),
          ],
        }),
        defineField({
          name: 'rightSideCTA',
          title: 'Right Side CTA',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Button Text',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (rule) => rule.required(),
            }),
          ],
        }),
        defineField({
          name: 'rightSideSecondaryLink',
          title: 'Right Side Secondary Link',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Link Text',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (rule) => rule.required(),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'title',
      description: 'This field is the title of your blog.',
      title: 'Title',
      type: 'string',
      initialValue: demo.title,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      description: 'Used both for the <meta> description tag for SEO, and the blog subheader.',
      title: 'Description',
      type: 'array',
      initialValue: demo.description,
      of: [
        // Define a minified block content field for the description. https://www.sanity.io/docs/block-content
        defineArrayMember({
          type: 'block',
          options: {},
          styles: [],
          lists: [],
          marks: {
            decorators: [],
            annotations: [
              defineField({
                type: 'object',
                name: 'link',
                fields: [
                  {
                    type: 'string',
                    name: 'href',
                    title: 'URL',
                    validation: (rule) => rule.required(),
                  },
                ],
              }),
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image',
      type: 'image',
      description: 'Displayed on social cards and search engine results.',
      options: {
        hotspot: true,
        aiAssist: {
          imageDescriptionField: 'alt',
        },
      },
      fields: [
        defineField({
          name: 'alt',
          description: 'Important for accessibility and SEO.',
          title: 'Alternative text',
          type: 'string',
          validation: (rule) => {
            return rule.custom((alt, context) => {
              if ((context.document?.ogImage as any)?.asset?._ref && !alt) {
                return 'Required'
              }
              return true
            })
          },
        }),
        defineField({
          name: 'metadataBase',
          type: 'url',
          description: (
            <a
              href="https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase"
              rel="noreferrer noopener"
            >
              More information
            </a>
          ),
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Settings',
      }
    },
  },
})
