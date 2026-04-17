import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const people = {
  title: 'People',
  name: 'people',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('UserMultiple'),
  fields: [
    {
      title: 'People',
      name: 'list_people',
      type: 'list_people',
    },
  ],
  preview: {
    select: {
      list: 'list_people',
    },
    prepare: x => {
const infer = {
      name: 'People',
      singletonTitle: null,
      icon: getIcon('UserMultiple'),
      fallback: {},
    }
           const title = resolveValue('title', people.preview.select, x);           const subtitle = resolveValue('subtitle', people.preview.select, x);           const media = resolveValue('media', people.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || x.list?.length && x.list.length === 1 ? '1 item' : x.list?.length > 0 ? `${x.list.length} items` : 'No items',             media: media || infer.icon           }, x, infer.fallback);         },
  },
}