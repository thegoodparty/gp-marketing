import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const component_testimonialBlockWithLink = {
  title: 'Testimonial Block With Link',
  name: 'component_testimonialBlockWithLink',
  description: 'A carousel of testimonials, each with a result and a link to the full story.',
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
      name: 'testimonialBlockWithLinkDesignSettings',
      type: 'testimonialBlockWithLinkDesignSettings',
      group: 'testimonialBlockWithLinkDesignSettings',
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
        previewSubTitle: '*Testimonial Block With Link',
        title: 'Testimonial Block With Link',
      },
    }
         const title = resolveValue('title', component_testimonialBlockWithLink.preview.select, x);         const subtitle = resolveValue('subtitle', component_testimonialBlockWithLink.preview.select, x);         const media = resolveValue('media', component_testimonialBlockWithLink.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
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
      name: 'testimonialBlockWithLinkDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
}
