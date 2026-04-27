import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const stepperBlockItem = {
  title: 'Stepper Block Item',
  name: 'stepperBlockItem',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  description: 'A single card with text and image.',
  fields: [
    {
      title: 'Text',
      name: 'summaryInfo',
      type: 'summaryInfo',
    },
    {
      title: 'Media',
      name: 'stepperBlockItemMedia',
      type: 'stepperBlockItemMedia',
    },
    {
      title: 'Design Settings',
      name: 'stepperBlockItemDesignSettings',
      type: 'stepperBlockItemDesignSettings',
    },
  ],
  preview: {
    select: {
      title: 'field_label',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('TextFont'),
      fallback: {},
    }
         const title = resolveValue('title', stepperBlockItem.preview.select, x);         const subtitle = resolveValue('subtitle', stepperBlockItem.preview.select, x);         const media = resolveValue('media', stepperBlockItem.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}