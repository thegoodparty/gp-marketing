import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const component_carouselBlock = {
  title: 'Carousel Block',
  name: 'component_carouselBlock',
  description: 'A rotating set of testimonials.',
  type: 'object',
  icon: getIcon('Quotes'),
  fields: [
    {
      title: 'Text',
      name: 'summaryInfo',
      type: 'summaryInfo',
      group: 'summaryInfo',
    },
    {
      title: 'Content',
      name: 'quotesContentCollection',
      type: 'quotesContentCollection',
      group: 'quotesContentCollection',
    },
    {
      title: 'Design Settings',
      name: 'carouselBlockDesignSettings',
      type: 'carouselBlockDesignSettings',
      group: 'carouselBlockDesignSettings',
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
        previewSubTitle: '*Carousel Block',
        title: 'Carousel Block',
      },
    }
         const title = resolveValue('title', component_carouselBlock.preview.select, x);         const subtitle = resolveValue('subtitle', component_carouselBlock.preview.select, x);         const media = resolveValue('media', component_carouselBlock.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Text',
      name: 'summaryInfo',
      icon: getIcon('TextFont'),
    },
    {
      title: 'Content',
      name: 'quotesContentCollection',
      icon: getIcon('Grid'),
    },
    {
      title: 'Design Settings',
      name: 'carouselBlockDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
}