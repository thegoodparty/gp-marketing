import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const heroImage = {
  title: 'Hero Image',
  name: 'heroImage',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Image'),
  fields: [
    {
      title: 'Image',
      name: 'img_image',
      type: 'img_image',
    },
    {
      title: 'Display Video',
      name: 'field_displayVideo',
      type: 'field_displayVideo',
    },
    {
      title: 'Video',
      name: 'autoplayVideo',
      type: 'autoplayVideo',
      hidden: function (ctx ) { return ![true].includes(ctx.parent?.field_displayVideo) },
    },
  ],
  preview: {
    select: {
      media: 'img_image',
    },
    prepare: x => {
const infer = {
      name: 'Image',
      singletonTitle: null,
      icon: getIcon('Image'),
      fallback: {},
    }
           const title = resolveValue("title", heroImage.preview.select, x);           const subtitle = resolveValue("subtitle", heroImage.preview.select, x);           const media = resolveValue("media", heroImage.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || media?.alt,             media: media || infer.icon           }, x, infer.fallback);         },
  },
}