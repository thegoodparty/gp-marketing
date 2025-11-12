import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const editorialAssets = {
  title: 'Editorial Assets',
  name: 'editorialAssets',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('ImageCopy'),
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
      icon: getIcon('ImageCopy'),
      fallback: {},
    }
           const title = resolveValue("title", editorialAssets.preview.select, x);           const subtitle = resolveValue("subtitle", editorialAssets.preview.select, x);           const media = resolveValue("media", editorialAssets.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || media?.alt,             media: media || infer.icon           }, x, infer.fallback);         },
  },
}