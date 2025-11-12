import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const faqs = {
  title: 'FAQs',
  name: 'faqs',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('QuestionAnswering'),
  fields: [
    {
      title: 'FAQs',
      name: 'list_faQs',
      type: 'list_faQs',
    },
  ],
  preview: {
    select: {
      list: 'list_faQs',
    },
    prepare: x => {
const infer = {
      name: 'FAQs',
      singletonTitle: null,
      icon: getIcon('QuestionAnswering'),
      fallback: {},
    }
           const title = resolveValue("title", faqs.preview.select, x);           const subtitle = resolveValue("subtitle", faqs.preview.select, x);           const media = resolveValue("media", faqs.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || x.list?.length && x.list.length === 1 ? "1 item" : x.list?.length > 0 ? `${x.list.length} items` : "No items",             media: media || infer.icon           }, x, infer.fallback);         },
  },
}