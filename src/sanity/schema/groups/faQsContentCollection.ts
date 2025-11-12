import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const faQsContentCollection = {
  title: 'FAQs Content Collection',
  name: 'faQsContentCollection',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('TableOfContents'),
  fields: [
    {
      title: 'Content Options',
      name: 'field_faQsContentOptions',
      type: 'field_faQsContentOptions',
    },
    {
      title: 'FAQ Collection',
      name: 'ref_faqCollection',
      type: 'ref_faqCollection',
      hidden: function (ctx ) { return !['Collection'].includes(ctx.parent?.field_faQsContentOptions) },
    },
    {
      title: 'FAQs',
      name: 'list_faQs',
      type: 'list_faQs',
      hidden: function (ctx ) { return !['Manual'].includes(ctx.parent?.field_faQsContentOptions) },
    },
  ],
  preview: {
    select: {
      title: 'field_faQsContentOptions',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('TableOfContents'),
      fallback: {},
    }
         const title = resolveValue("title", faQsContentCollection.preview.select, x);         const subtitle = resolveValue("subtitle", faQsContentCollection.preview.select, x);         const media = resolveValue("media", faQsContentCollection.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}