import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const statsBlockDesignSettings = {
  title: 'Stats Block Design Settings',
  name: 'statsBlockDesignSettings',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('ColorPalette'),
  fields: [
    {
      title: 'Layout',
      name: 'field_layoutStackedSideBySide',
      type: 'field_layoutStackedSideBySide',
    },
    {
      title: 'Block Color',
      name: 'field_blockColorCreamMidnight',
      type: 'field_blockColorCreamMidnight',
    },
  ],
  preview: {
    select: {
      title: 'field_layoutStackedSideBySide',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('ColorPalette'),
      fallback: {},
    }
         const title = resolveValue('title', statsBlockDesignSettings.preview.select, x);         const subtitle = resolveValue('subtitle', statsBlockDesignSettings.preview.select, x);         const media = resolveValue('media', statsBlockDesignSettings.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}