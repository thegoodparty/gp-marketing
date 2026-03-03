import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const internalLink = {
  title: 'Internal Link',
  name: 'internalLink',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Link'),
  fields: [
    {
      title: 'Link Text',
      name: 'field_linkText',
      type: 'field_linkText',
    },
    {
      title: 'Internal Link',
      name: 'field_internalLink',
      type: 'field_internalLink',
    },
  ],
  preview: {
    select: {
      title: 'field_linkText',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Link'),
      fallback: {
        previewTitle: 'field_linkText',
        previewSubTitle: '*Internal Link',
        title: 'Internal Link',
      },
    }
         const title = resolveValue("title", internalLink.preview.select, x);         const subtitle = resolveValue("subtitle", internalLink.preview.select, x);         const media = resolveValue("media", internalLink.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}