import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const newsletterBlockDesignSettings = {
  title: 'Newsletter Block Design Settings',
  name: 'newsletterBlockDesignSettings',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('ColorPalette'),
  fields: [
    {
      title: 'Color',
      name: 'field_componentColor6Colors',
      type: 'field_componentColor6Colors',
    },
  ],
  preview: {
    select: {
      title: 'field_componentColor6Colors',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('ColorPalette'),
      fallback: {},
    }
         const title = resolveValue('title', newsletterBlockDesignSettings.preview.select, x);         const subtitle = resolveValue('subtitle', newsletterBlockDesignSettings.preview.select, x);         const media = resolveValue('media', newsletterBlockDesignSettings.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}