import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const component_comparisonBlock = {
  title: 'Comparison Block',
  name: 'component_comparisonBlock',
  type: 'object',
  icon: getIcon('Compare'),
  fields: [
    {
      title: 'Text',
      name: 'summaryInfo',
      type: 'summaryInfo',
      group: 'summaryInfo',
    },
    {
      title: 'Table One',
      name: 'comparisonBlockTableOne',
      type: 'comparisonBlockTableOne',
      group: 'comparisonBlockTableOne',
    },
    {
      title: 'Table Two',
      name: 'comparisonBlockTableTwo',
      type: 'comparisonBlockTableTwo',
      group: 'comparisonBlockTableTwo',
    },
    {
      title: 'Design Settings',
      name: 'comparisonBlockDesignSettings',
      type: 'comparisonBlockDesignSettings',
      group: 'comparisonBlockDesignSettings',
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
      title: 'summaryInfo.field_title',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('TextFont'),
      fallback: {
        previewTitle: 'summaryInfo.field_title',
        previewSubTitle: '*Comparison Block',
        title: 'Comparison Block',
      },
    }
         const title = resolveValue('title', component_comparisonBlock.preview.select, x);         const subtitle = resolveValue('subtitle', component_comparisonBlock.preview.select, x);         const media = resolveValue('media', component_comparisonBlock.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Text',
      name: 'summaryInfo',
      icon: getIcon('TextFont'),
    },
    {
      title: 'Table One',
      name: 'comparisonBlockTableOne',
      icon: getIcon('ListBulleted'),
    },
    {
      title: 'Table Two',
      name: 'comparisonBlockTableTwo',
      icon: getIcon('ListBulleted'),
    },
    {
      title: 'Design Settings',
      name: 'comparisonBlockDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
}