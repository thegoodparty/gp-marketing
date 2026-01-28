import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const component_locationFactsBlock = {
  title: 'Location Facts Block',
  name: 'component_locationFactsBlock',
  type: 'object',
  icon: getIcon('BarChart'),
  fields: [
    {
      title: 'Header',
      name: 'locationFactsBlockHeader',
      type: 'summaryInfo',
      group: 'locationFactsBlockHeader',
    },
    {
      title: 'Fact Cards',
      name: 'locationFactsBlockCards',
      type: 'object',
      group: 'locationFactsBlockCards',
      fields: [
        {
          title: 'Facts to Display',
          name: 'list_factTypes',
          type: 'array',
          of: [
            {
              type: 'string',
              options: {
                list: [
                  { title: 'Largest City', value: 'largest-city' },
                  { title: 'Population', value: 'population' },
                  { title: 'Density', value: 'density' },
                  { title: 'Median Income', value: 'median-income' },
                  { title: 'Unemployment Rate', value: 'unemployment-rate' },
                  { title: 'Average Home Value', value: 'average-home-value' },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      title: 'Design Settings',
      name: 'locationFactsBlockDesignSettings',
      type: 'object',
      group: 'locationFactsBlockDesignSettings',
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
      title: 'locationFactsBlockHeader.field_title',
      _type: '_type',
    },
    prepare: (x: any) => {
      const infer = {
        singletonTitle: null,
        icon: getIcon('BarChart'),
        fallback: {
          previewTitle: 'locationFactsBlockHeader.field_title',
          previewSubTitle: '*Location Facts Block',
          title: 'Location Facts Block',
        },
      };
      const title = resolveValue("title", component_locationFactsBlock.preview.select, x);
      const subtitle = resolveValue("subtitle", component_locationFactsBlock.preview.select, x);
      const media = resolveValue("media", component_locationFactsBlock.preview.select, x);
      return handleReplacements({
        title: infer.singletonTitle || title || undefined,
        subtitle: subtitle ? subtitle : infer.fallback["title"],
        media: media || infer.icon
      }, x, infer.fallback);
    },
  },
  groups: [
    {
      title: 'Header',
      name: 'locationFactsBlockHeader',
      icon: getIcon('TextFont'),
    },
    {
      title: 'Fact Cards',
      name: 'locationFactsBlockCards',
      icon: getIcon('BarChart'),
    },
    {
      title: 'Design Settings',
      name: 'locationFactsBlockDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
};
