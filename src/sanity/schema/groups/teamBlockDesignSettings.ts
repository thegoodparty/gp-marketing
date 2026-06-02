import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const teamBlockDesignSettings = {
  title: 'Team Block Design Settings',
  name: 'teamBlockDesignSettings',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('ColorPalette'),
  fields: [
    {
      title: 'Column Layout',
      name: 'field_columnLayout34Columns',
      type: 'field_columnLayout34Columns',
    },
    {
      title: 'Block Color',
      name: 'field_blockColorCreamMidnight',
      type: 'field_blockColorCreamMidnight',
    },
  ],
  preview: {
    select: {
      title: 'field_columnLayout34Columns',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('ColorPalette'),
      fallback: {},
    }
         const title = resolveValue('title', teamBlockDesignSettings.preview.select, x);         const subtitle = resolveValue('subtitle', teamBlockDesignSettings.preview.select, x);         const media = resolveValue('media', teamBlockDesignSettings.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}