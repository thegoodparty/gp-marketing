import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const stepperBlockItemDesignSettings = {
  title: 'Stepper Block Item Design Settings',
  name: 'stepperBlockItemDesignSettings',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('ColorPalette'),
  fields: [
    {
      title: 'Alignment',
      name: 'field_mediaAlignmentRightLeft',
      type: 'field_mediaAlignmentRightLeft',
    },
  ],
  preview: {
    select: {
      title: 'field_mediaAlignmentRightLeft',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('ColorPalette'),
      fallback: {},
    }
         const title = resolveValue('title', stepperBlockItemDesignSettings.preview.select, x);         const subtitle = resolveValue('subtitle', stepperBlockItemDesignSettings.preview.select, x);         const media = resolveValue('media', stepperBlockItemDesignSettings.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}