import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const component_testimonialAutoScroll = {
  title: 'Testimonials Auto Scroll',
  name: 'component_testimonialAutoScroll',
  description: 'An infinite auto-scrolling marquee of testimonial quotes.',
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
      name: 'testimonialBlockDesignSettings',
      type: 'testimonialBlockDesignSettings',
      group: 'testimonialBlockDesignSettings',
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
          previewSubTitle: '*Testimonials Auto Scroll',
          title: 'Testimonials Auto Scroll',
        },
      }
      const title = resolveValue("title", component_testimonialAutoScroll.preview.select, x);
      const subtitle = resolveValue("subtitle", component_testimonialAutoScroll.preview.select, x);
      const media = resolveValue("media", component_testimonialAutoScroll.preview.select, x);
      return handleReplacements({
        title: infer.singletonTitle || title || undefined,
        subtitle: subtitle ? subtitle : infer.fallback["title"],
        media: media || infer.icon
      }, x, infer.fallback);
    },
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
      name: 'testimonialBlockDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
}
