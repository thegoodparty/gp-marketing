import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const inlineExternalLink = {
  title: 'Inline External Link',
  name: 'inlineExternalLink',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Launch'),
  fields: [
    {
      title: 'External Link',
      name: 'field_externalLink',
      type: 'field_externalLink',
    },
  ],
  preview: {
    select: {
      title: 'field_externalLink',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Launch'),
      fallback: {},
    }
         const title = resolveValue("title", inlineExternalLink.preview.select, x);         const subtitle = resolveValue("subtitle", inlineExternalLink.preview.select, x);         const media = resolveValue("media", inlineExternalLink.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}