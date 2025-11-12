import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const quotesContentCollection = {
  title: 'Quotes Content Collection',
  name: 'quotesContentCollection',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Grid'),
  fields: [
    {
      title: 'Content Options',
      name: 'field_quotesContentOptions',
      type: 'field_quotesContentOptions',
    },
    {
      title: 'Quote Collection',
      name: 'ref_quoteCollection',
      type: 'ref_quoteCollection',
      hidden: function (ctx ) { return !['Collection'].includes(ctx.parent?.field_quotesContentOptions) },
    },
    {
      title: 'Choose Quotes',
      name: 'list_chooseQuotes',
      type: 'list_chooseQuotes',
      hidden: function (ctx ) { return !['Manual'].includes(ctx.parent?.field_quotesContentOptions) },
    },
  ],
  preview: {
    select: {
      title: 'field_quotesContentOptions',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Grid'),
      fallback: {},
    }
         const title = resolveValue("title", quotesContentCollection.preview.select, x);         const subtitle = resolveValue("subtitle", quotesContentCollection.preview.select, x);         const media = resolveValue("media", quotesContentCollection.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}