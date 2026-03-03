import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const ctaMessaging = {
  title: 'CTA Messaging',
  name: 'ctaMessaging',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  description: 'The supporting text to display to users for this CTA.',
  icon: getIcon('TextFont'),
  fields: [
    {
      title: 'Overline',
      name: 'field_label',
      type: 'field_label',
    },
    {
      title: 'Heading',
      name: 'field_title',
      type: 'field_title',
    },
    {
      title: 'Body Text',
      name: 'block_summaryText',
      type: 'block_summaryText',
    },
    {
      title: 'Caption',
      name: 'field_caption',
      type: 'field_caption',
    },
  ],
  preview: {
    select: {
      title: 'field_label',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('TextFont'),
      fallback: {},
    }
         const title = resolveValue("title", ctaMessaging.preview.select, x);         const subtitle = resolveValue("subtitle", ctaMessaging.preview.select, x);         const media = resolveValue("media", ctaMessaging.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}