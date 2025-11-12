import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const ctaAssets = {
  title: 'CTA Assets',
  name: 'ctaAssets',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Image'),
  fields: [
    {
      title: 'Featured Image',
      name: 'img_featuredImage',
      type: 'img_featuredImage',
    },
  ],
  preview: {
    select: {
      media: 'img_featuredImage',
    },
    prepare: x => {
const infer = {
      name: 'Featured Image',
      singletonTitle: null,
      icon: getIcon('Image'),
      fallback: {},
    }
           const title = resolveValue("title", ctaAssets.preview.select, x);           const subtitle = resolveValue("subtitle", ctaAssets.preview.select, x);           const media = resolveValue("media", ctaAssets.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || media?.alt,             media: media || infer.icon           }, x, infer.fallback);         },
  },
}