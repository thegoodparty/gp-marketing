import type { Rule } from 'sanity';
import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const component_featuredCitiesBlock = {
  title: 'Featured Cities Block',
  name: 'component_featuredCitiesBlock',
  type: 'object',
  icon: getIcon('MapPin'),
  fields: [
    {
      title: 'Header',
      name: 'featuredCitiesBlockHeader',
      type: 'summaryInfo',
      group: 'featuredCitiesBlockHeader',
    },
    {
      title: 'Location Cards',
      name: 'featuredCitiesBlockCards',
      type: 'object',
      group: 'featuredCitiesBlockCards',
      fields: [
        {
          title: 'Cities',
          name: 'list_locationCards',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  title: 'City Name',
                  name: 'field_cityName',
                  type: 'string',
                  validation: (R: Rule) => R.required(),
                },
                {
                  title: 'State Abbreviation',
                  name: 'field_stateAbbreviation',
                  type: 'string',
                  description: '2-letter state code (e.g., TN, TX, FL)',
                  validation: (R: Rule) => R.required().length(2).uppercase(),
                },
                {
                  title: 'Link',
                  name: 'field_href',
                  type: 'url',
                  validation: (R: Rule) => R.required().uri({
                    allowRelative: true,
                  }),
                },
              ],
              preview: {
                select: {
                  cityName: 'field_cityName',
                  state: 'field_stateAbbreviation',
                },
                prepare: ({cityName, state}: {cityName?: string; state?: string}) => ({
                  title: `${cityName || 'City'}, ${state || 'ST'}`,
                }),
              },
            },
          ],
        },
      ],
    },
    {
      title: 'Design Settings',
      name: 'featuredCitiesBlockDesignSettings',
      type: 'object',
      group: 'featuredCitiesBlockDesignSettings',
      fields: [
        {
          title: 'Background Color',
          name: 'field_blockColorCreamMidnight',
          type: 'string',
          options: {
            list: [
              { title: 'Cream', value: 'Cream' },
              { title: 'Midnight', value: 'MidnightDark' },
            ],
          },
          initialValue: 'Cream',
        },
      ],
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      type: 'componentSettings',
      group: 'componentSettings',
    },
  ],
  preview: {
    select: {
      title: 'featuredCitiesBlockHeader.field_title',
      _type: '_type',
    },
    prepare: (x: Record<string, unknown>) => {
      const infer = {
        singletonTitle: null,
        icon: getIcon('MapPin'),
        fallback: {
          previewTitle: 'featuredCitiesBlockHeader.field_title',
          previewSubTitle: '*Featured Cities Block',
          title: 'Featured Cities Block',
        },
      };
      const title = resolveValue('title', component_featuredCitiesBlock.preview.select, x);
      const subtitle = resolveValue('subtitle', component_featuredCitiesBlock.preview.select, x);
      const media = resolveValue('media', component_featuredCitiesBlock.preview.select, x);
      return handleReplacements({
        title: infer.singletonTitle || title || undefined,
        subtitle: subtitle ? subtitle : infer.fallback['title'],
        media: media || infer.icon
      }, x, infer.fallback);
    },
  },
  groups: [
    {
      title: 'Header',
      name: 'featuredCitiesBlockHeader',
      icon: getIcon('TextFont'),
    },
    {
      title: 'Location Cards',
      name: 'featuredCitiesBlockCards',
      icon: getIcon('MapPin'),
    },
    {
      title: 'Design Settings',
      name: 'featuredCitiesBlockDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
};
