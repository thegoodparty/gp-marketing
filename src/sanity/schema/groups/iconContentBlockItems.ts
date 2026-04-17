import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const iconContentBlockItems = {
  title: 'Icon Content Block Items',
  name: 'iconContentBlockItems',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Grid'),
  fields: [
    {
      title: 'Icon Content Items',
      name: 'list_iconContentItems',
      type: 'list_iconContentItems',
    },
  ],
  preview: {
    select: {
      list: 'list_iconContentItems',
    },
    prepare: x => {
const infer = {
      name: 'Icon Content Items',
      singletonTitle: null,
      icon: getIcon('Grid'),
      fallback: {},
    }
           const title = resolveValue('title', iconContentBlockItems.preview.select, x);           const subtitle = resolveValue('subtitle', iconContentBlockItems.preview.select, x);           const media = resolveValue('media', iconContentBlockItems.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || x.list?.length && x.list.length === 1 ? '1 item' : x.list?.length > 0 ? `${x.list.length} items` : 'No items',             media: media || infer.icon           }, x, infer.fallback);         },
  },
}