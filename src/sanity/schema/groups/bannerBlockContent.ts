import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const bannerBlockContent = {
  title: 'Banner Block Content',
  name: 'bannerBlockContent',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('TextShortParagraph'),
  fields: [
    {
      title: 'Choose 3 People',
      name: 'list_Choose3People',
      type: 'list_Choose3People',
    },
    {
      title: 'Banner Text',
      name: 'field_bannerText',
      type: 'field_bannerText',
    },
  ],
  preview: {
    select: {
      list: 'list_Choose3People',
    },
    prepare: x => {
const infer = {
      name: 'Choose 3 People',
      singletonTitle: null,
      icon: getIcon('TextShortParagraph'),
      fallback: {},
    }
           const title = resolveValue('title', bannerBlockContent.preview.select, x);           const subtitle = resolveValue('subtitle', bannerBlockContent.preview.select, x);           const media = resolveValue('media', bannerBlockContent.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || x.list?.length && x.list.length === 1 ? '1 item' : x.list?.length > 0 ? `${x.list.length} items` : 'No items',             media: media || infer.icon           }, x, infer.fallback);         },
  },
}