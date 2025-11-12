import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const externalLink = {
  title: 'External Link',
  name: 'externalLink',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Launch'),
  fields: [
    {
      title: 'Link Text',
      name: 'field_linkText',
      type: 'field_linkText',
    },
    {
      title: 'External Link',
      name: 'field_externalLink',
      type: 'field_externalLink',
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
      icon: getIcon('Launch'),
      fallback: {
        previewTitle: 'field_linkText',
        previewSubTitle: '*External Link',
        title: 'External Link',
      },
    }
         const title = resolveValue("title", externalLink.preview.select, x);         const subtitle = resolveValue("subtitle", externalLink.preview.select, x);         const media = resolveValue("media", externalLink.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}