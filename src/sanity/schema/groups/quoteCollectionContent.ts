import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const quoteCollectionContent = {
  title: 'Quote Collection Content',
  name: 'quoteCollectionContent',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('TableOfContents'),
  fields: [
    {
      title: 'Choose Quotes',
      name: 'list_chooseQuotes',
      type: 'list_chooseQuotes',
    },
  ],
  preview: {
    select: {
      list: 'list_chooseQuotes',
    },
    prepare: x => {
const infer = {
      name: 'Choose Quotes',
      singletonTitle: null,
      icon: getIcon('TableOfContents'),
      fallback: {},
    }
           const title = resolveValue('title', quoteCollectionContent.preview.select, x);           const subtitle = resolveValue('subtitle', quoteCollectionContent.preview.select, x);           const media = resolveValue('media', quoteCollectionContent.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || x.list?.length && x.list.length === 1 ? '1 item' : x.list?.length > 0 ? `${x.list.length} items` : 'No items',             media: media || infer.icon           }, x, infer.fallback);         },
  },
}