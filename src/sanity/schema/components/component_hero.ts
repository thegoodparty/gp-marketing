import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const component_hero = {
  title: 'Hero',
  name: 'component_hero',
  description: 'A page header with a large headline and media.',
  type: 'object',
  icon: getIcon('OpenPanelFilledBottom'),
  fields: [
    {
      title: 'Text',
      name: 'summaryInfo',
      type: 'summaryInfo',
      group: 'summaryInfo',
    },
    {
      title: 'Image',
      name: 'heroImage',
      type: 'heroImage',
      group: 'heroImage',
    },
    {
      title: 'Design Settings',
      name: 'heroDesignSettings',
      type: 'heroDesignSettings',
      group: 'heroDesignSettings',
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
      media: 'heroImage.img_image',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('TextFont'),
      fallback: {
        previewTitle: 'summaryInfo.field_title',
        previewSubTitle: '*Hero',
        previewMedia: 'heroImage.img_image',
        title: 'Hero',
      },
    }
         const title = resolveValue('title', component_hero.preview.select, x);         const subtitle = resolveValue('subtitle', component_hero.preview.select, x);         const media = resolveValue('media', component_hero.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Text',
      name: 'summaryInfo',
      icon: getIcon('TextFont'),
    },
    {
      title: 'Image',
      name: 'heroImage',
      icon: getIcon('Image'),
    },
    {
      title: 'Design Settings',
      name: 'heroDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
}