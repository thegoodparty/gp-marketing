import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const faqCollectionContent = {
  title: 'FAQ Collection Content',
  name: 'faqCollectionContent',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('TableOfContents'),
  fields: [
    {
      title: 'Collection FAQs',
      name: 'list_collectionFaQs',
      type: 'list_collectionFaQs',
    },
  ],
  preview: {
    select: {
      list: 'list_collectionFaQs',
    },
    prepare: x => {
const infer = {
      name: 'Collection FAQs',
      singletonTitle: null,
      icon: getIcon('TableOfContents'),
      fallback: {},
    }
           const title = resolveValue("title", faqCollectionContent.preview.select, x);           const subtitle = resolveValue("subtitle", faqCollectionContent.preview.select, x);           const media = resolveValue("media", faqCollectionContent.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || x.list?.length && x.list.length === 1 ? "1 item" : x.list?.length > 0 ? `${x.list.length} items` : "No items",             media: media || infer.icon           }, x, infer.fallback);         },
  },
}