import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const component_statsBlock = {
  title: 'Stats Block',
  name: 'component_statsBlock',
  type: 'object',
  icon: getIcon('ArrayNumbers'),
  fields: [
    {
      title: 'Text',
      name: 'summaryInfo',
      type: 'summaryInfo',
      group: 'summaryInfo',
    },
    {
      title: 'Stats',
      name: 'stats',
      type: 'stats',
      group: 'stats',
    },
    {
      title: 'Design Settings',
      name: 'statsBlockDesignSettings',
      type: 'statsBlockDesignSettings',
      group: 'statsBlockDesignSettings',
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
        previewSubTitle: '*Stats Block',
        title: 'Stats Block',
      },
    }
         const title = resolveValue('title', component_statsBlock.preview.select, x);         const subtitle = resolveValue('subtitle', component_statsBlock.preview.select, x);         const media = resolveValue('media', component_statsBlock.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Text',
      name: 'summaryInfo',
      icon: getIcon('TextFont'),
    },
    {
      title: 'Stats',
      name: 'stats',
      icon: getIcon('CharacterWholeNumber'),
    },
    {
      title: 'Design Settings',
      name: 'statsBlockDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
}