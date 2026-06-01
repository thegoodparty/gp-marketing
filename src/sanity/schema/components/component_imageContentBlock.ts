import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const component_imageContentBlock = {
  title: 'Image Content Block',
  name: 'component_imageContentBlock',
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
      name: 'imageContentBlockItems',
      type: 'imageContentBlockItems',
      group: 'imageContentBlockItems',
    },
    {
      title: 'Design Settings',
      name: 'imageContentBlockDesignSettings',
      type: 'imageContentBlockDesignSettings',
      group: 'imageContentBlockDesignSettings',
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
        previewSubTitle: '*Image Content Block',
        title: 'Image Content Block',
      },
    }
         const title = resolveValue('title', component_imageContentBlock.preview.select, x);         const subtitle = resolveValue('subtitle', component_imageContentBlock.preview.select, x);         const media = resolveValue('media', component_imageContentBlock.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Text',
      name: 'summaryInfo',
      icon: getIcon('TextFont'),
    },
    {
      title: 'Content',
      name: 'imageContentBlockItems',
      icon: getIcon('Grid'),
    },
    {
      title: 'Design Settings',
      name: 'imageContentBlockDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
}