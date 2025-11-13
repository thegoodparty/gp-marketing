import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const imageContentBlockItems = {
  title: 'Image Content Block Items',
  name: 'imageContentBlockItems',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Grid'),
  fields: [
    {
      title: 'Image Content Items',
      name: 'list_imageContentItems',
      type: 'list_imageContentItems',
    },
  ],
  preview: {
    select: {
      list: 'list_imageContentItems',
    },
    prepare: x => {
const infer = {
      name: 'Image Content Items',
      singletonTitle: null,
      icon: getIcon('Grid'),
      fallback: {},
    }
           const title = resolveValue("title", imageContentBlockItems.preview.select, x);           const subtitle = resolveValue("subtitle", imageContentBlockItems.preview.select, x);           const media = resolveValue("media", imageContentBlockItems.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || x.list?.length && x.list.length === 1 ? "1 item" : x.list?.length > 0 ? `${x.list.length} items` : "No items",             media: media || infer.icon           }, x, infer.fallback);         },
  },
}