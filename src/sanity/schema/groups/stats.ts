import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const stats = {
  title: 'Stats',
  name: 'stats',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('CharacterWholeNumber'),
  fields: [
    {
      title: 'Stats',
      name: 'list_stats',
      type: 'list_stats',
    },
  ],
  preview: {
    select: {
      list: 'list_stats',
    },
    prepare: x => {
const infer = {
      name: 'Stats',
      singletonTitle: null,
      icon: getIcon('CharacterWholeNumber'),
      fallback: {},
    }
           const title = resolveValue('title', stats.preview.select, x);           const subtitle = resolveValue('subtitle', stats.preview.select, x);           const media = resolveValue('media', stats.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || x.list?.length && x.list.length === 1 ? '1 item' : x.list?.length > 0 ? `${x.list.length} items` : 'No items',             media: media || infer.icon           }, x, infer.fallback);         },
  },
}