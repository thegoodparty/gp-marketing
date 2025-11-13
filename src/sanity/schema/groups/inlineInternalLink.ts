import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const inlineInternalLink = {
  title: 'Inline Internal Link',
  name: 'inlineInternalLink',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Link'),
  fields: [
    {
      title: 'Internal Link',
      name: 'field_internalLink',
      type: 'field_internalLink',
    },
  ],
  preview: {
    select: {
      title: 'field_internalLink',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Link'),
      fallback: {},
    }
         const title = resolveValue("title", inlineInternalLink.preview.select, x);         const subtitle = resolveValue("subtitle", inlineInternalLink.preview.select, x);         const media = resolveValue("media", inlineInternalLink.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}