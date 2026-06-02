import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const articleDesignSettings = {
  title: 'Article Design Settings',
  name: 'articleDesignSettings',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('ColorPalette'),
  fields: [
    {
      title: 'Hero Color',
      name: 'field_articleHeroColor',
      type: 'field_articleHeroColor',
    },
  ],
  preview: {
    select: {
      title: 'field_articleHeroColor',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('ColorPalette'),
      fallback: {},
    }
         const title = resolveValue('title', articleDesignSettings.preview.select, x);         const subtitle = resolveValue('subtitle', articleDesignSettings.preview.select, x);         const media = resolveValue('media', articleDesignSettings.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}