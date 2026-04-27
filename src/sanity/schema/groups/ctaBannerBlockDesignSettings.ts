import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const ctaBannerBlockDesignSettings = {
  title: 'CTA Banner Block Design Settings',
  name: 'ctaBannerBlockDesignSettings',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('ColorPalette'),
  fields: [
    {
      title: 'Color',
      name: 'field_componentColor6ColorsInverse',
      type: 'field_componentColor6ColorsInverse',
    },
    {
      title: 'Block Color',
      name: 'field_blockColorCreamMidnight',
      type: 'field_blockColorCreamMidnight',
    },
  ],
  preview: {
    select: {
      title: 'field_componentColor6ColorsInverse',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('ColorPalette'),
      fallback: {},
    }
         const title = resolveValue('title', ctaBannerBlockDesignSettings.preview.select, x);         const subtitle = resolveValue('subtitle', ctaBannerBlockDesignSettings.preview.select, x);         const media = resolveValue('media', ctaBannerBlockDesignSettings.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}