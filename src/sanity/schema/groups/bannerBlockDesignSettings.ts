import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const bannerBlockDesignSettings = {
  title: 'Banner Block Design Settings',
  name: 'bannerBlockDesignSettings',
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
         const title = resolveValue('title', bannerBlockDesignSettings.preview.select, x);         const subtitle = resolveValue('subtitle', bannerBlockDesignSettings.preview.select, x);         const media = resolveValue('media', bannerBlockDesignSettings.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}