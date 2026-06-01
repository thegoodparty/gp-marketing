import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const component_iconContentBlock = {
  title: 'Icon Content Block',
  name: 'component_iconContentBlock',
  type: 'object',
  icon: getIcon('Grid'),
  fields: [
    {
      title: 'Text',
      name: 'summaryInfo',
      type: 'summaryInfo',
      group: 'summaryInfo',
    },
    {
      title: 'Content',
      name: 'iconContentBlockItems',
      type: 'iconContentBlockItems',
      group: 'iconContentBlockItems',
    },
    {
      title: 'Design Settings',
      name: 'iconContentBlockDesignSettings',
      type: 'iconContentBlockDesignSettings',
      group: 'iconContentBlockDesignSettings',
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
        previewSubTitle: '*Icon Content Block',
        title: 'Icon Content Block',
      },
    }
         const title = resolveValue('title', component_iconContentBlock.preview.select, x);         const subtitle = resolveValue('subtitle', component_iconContentBlock.preview.select, x);         const media = resolveValue('media', component_iconContentBlock.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Text',
      name: 'summaryInfo',
      icon: getIcon('TextFont'),
    },
    {
      title: 'Content',
      name: 'iconContentBlockItems',
      icon: getIcon('Grid'),
    },
    {
      title: 'Design Settings',
      name: 'iconContentBlockDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
}