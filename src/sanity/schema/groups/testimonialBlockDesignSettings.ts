import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const testimonialBlockDesignSettings = {
  title: 'Testimonial Block Design Settings',
  name: 'testimonialBlockDesignSettings',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('ColorPalette'),
  fields: [
    {
      title: 'Block Color',
      name: 'field_blockColorCreamMidnight',
      type: 'field_blockColorCreamMidnight',
    },
    {
      title: 'Max Number to Display',
      name: 'field_maxNumberToDisplay',
      type: 'field_maxNumberToDisplay',
    },
  ],
  preview: {
    select: {
      title: 'field_blockColorCreamMidnight',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('ColorPalette'),
      fallback: {},
    }
         const title = resolveValue("title", testimonialBlockDesignSettings.preview.select, x);         const subtitle = resolveValue("subtitle", testimonialBlockDesignSettings.preview.select, x);         const media = resolveValue("media", testimonialBlockDesignSettings.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}