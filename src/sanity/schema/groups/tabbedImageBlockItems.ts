import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const tabbedImageBlockItems = {
  title: 'Tabbed Image Block Items',
  name: 'tabbedImageBlockItems',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Grid'),
  fields: [
    {
      title: 'Tabbed Image Items',
      name: 'list_tabbedImageItems',
      type: 'list_tabbedImageItems',
    },
  ],
  preview: {
    select: {
      list: 'list_tabbedImageItems',
    },
    prepare: x => {
const infer = {
      name: 'Tabbed Image Items',
      singletonTitle: null,
      icon: getIcon('Grid'),
      fallback: {},
    }
           const title = resolveValue('title', tabbedImageBlockItems.preview.select, x);           const subtitle = resolveValue('subtitle', tabbedImageBlockItems.preview.select, x);           const media = resolveValue('media', tabbedImageBlockItems.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || x.list?.length && x.list.length === 1 ? '1 item' : x.list?.length > 0 ? `${x.list.length} items` : 'No items',             media: media || infer.icon           }, x, infer.fallback);         },
  },
}