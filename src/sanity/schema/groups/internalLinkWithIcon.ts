import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const internalLinkWithIcon = {
  title: 'Internal Link With Icon',
  name: 'internalLinkWithIcon',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Link'),
  fields: [
    {
      title: 'Link Icon',
      name: 'field_linkIcon',
      type: 'field_linkIcon',
    },
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
        title: 'Internal Link With Icon',
      },
    }
         const title = resolveValue("title", internalLinkWithIcon.preview.select, x);         const subtitle = resolveValue("subtitle", internalLinkWithIcon.preview.select, x);         const media = resolveValue("media", internalLinkWithIcon.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}