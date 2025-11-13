import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const featureAssets = {
  title: 'Feature Assets',
  name: 'featureAssets',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Image'),
  fields: [
    {
      title: 'Feature Image',
      name: 'img_featureImage',
      type: 'img_featureImage',
    },
  ],
  preview: {
    select: {
      media: 'img_featureImage',
    },
    prepare: x => {
const infer = {
      name: 'Feature Image',
      singletonTitle: null,
      icon: getIcon('Image'),
      fallback: {},
    }
           const title = resolveValue("title", featureAssets.preview.select, x);           const subtitle = resolveValue("subtitle", featureAssets.preview.select, x);           const media = resolveValue("media", featureAssets.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || media?.alt,             media: media || infer.icon           }, x, infer.fallback);         },
  },
}