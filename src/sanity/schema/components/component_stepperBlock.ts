import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const component_stepperBlock = {
  title: 'Stepper Block',
  name: 'component_stepperBlock',
  type: 'object',
  icon: getIcon('WatsonHealthStackedScrolling_1'),
  fields: [
    {
      title: 'Text',
      name: 'summaryInfo',
      type: 'summaryInfo',
      group: 'summaryInfo',
    },
    {
      title: 'Cards',
      name: 'stepperBlockItems',
      type: 'stepperBlockItems',
      group: 'stepperBlockItems',
    },
    {
      title: 'Design Settings',
      name: 'stepperBlockDesignSettings',
      type: 'stepperBlockDesignSettings',
      group: 'stepperBlockDesignSettings',
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
        previewSubTitle: '*Stepper Block',
        title: 'Stepper Block',
      },
    }
         const title = resolveValue('title', component_stepperBlock.preview.select, x);         const subtitle = resolveValue('subtitle', component_stepperBlock.preview.select, x);         const media = resolveValue('media', component_stepperBlock.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Text',
      name: 'summaryInfo',
      icon: getIcon('TextFont'),
    },
    {
      title: 'Cards',
      name: 'stepperBlockItems',
      icon: getIcon('WatsonHealthStackedScrolling_1'),
    },
    {
      title: 'Design Settings',
      name: 'stepperBlockDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
}