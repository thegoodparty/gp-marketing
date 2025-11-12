import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const tabbedImageItem = {
  title: 'Tabbed Image Item',
  name: 'tabbedImageItem',
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
      title: 'Summary Description',
      name: 'field_summaryDescription',
      type: 'field_summaryDescription',
    },
    {
      title: 'CTA',
      name: 'ctaActionWithShared',
      type: 'ctaActionWithShared',
    },
  ],
  preview: {
    select: {
      media: 'img_image',
      title: 'field_title',
      subtitle: 'field_summaryDescription',
    },
    prepare: x => {
const infer = {
      name: 'Image',
      singletonTitle: null,
      icon: getIcon('Checkbox'),
      fallback: {
        previewTitle: 'field_title',
        previewSubTitle: 'field_summaryDescription',
        previewMedia: 'img_image',
        title: 'Tabbed Image Item',
      },
    }
           const title = resolveValue("title", tabbedImageItem.preview.select, x);           const subtitle = resolveValue("subtitle", tabbedImageItem.preview.select, x);           const media = resolveValue("media", tabbedImageItem.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || media?.alt,             media: media || infer.icon           }, x, infer.fallback);         },
  },
}