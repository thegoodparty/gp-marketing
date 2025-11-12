import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const imageBlockItem = {
  title: 'Image Block Item',
  name: 'imageBlockItem',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Checkbox'),
  fields: [
    {
      title: 'Image',
      name: 'img_image',
      type: 'img_image',
    },
    {
      title: 'Heading',
      name: 'field_title',
      type: 'field_title',
    },
    {
      title: 'Subtitle',
      name: 'field_subTitle',
      type: 'field_subTitle',
    },
    {
      title: 'Body Text',
      name: 'block_summaryText',
      type: 'block_summaryText',
    },
  ],
  preview: {
    select: {
      media: 'img_image',
      title: 'field_title',
      subtitle: 'block_summaryText.0.children.0.text',
    },
    prepare: x => {
const infer = {
      name: 'Image',
      singletonTitle: null,
      icon: getIcon('Checkbox'),
      fallback: {
        previewTitle: 'field_title',
        previewSubTitle: 'block_summaryText.0.children.0.text',
        previewMedia: 'img_image',
        title: 'Image Block Item',
      },
    }
           const title = resolveValue("title", imageBlockItem.preview.select, x);           const subtitle = resolveValue("subtitle", imageBlockItem.preview.select, x);           const media = resolveValue("media", imageBlockItem.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || media?.alt,             media: media || infer.icon           }, x, infer.fallback);         },
  },
}