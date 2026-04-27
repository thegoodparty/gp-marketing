import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const generalContentTags = {
  title: 'General Content Tags',
  name: 'generalContentTags',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Tag'),
  fields: [
    {
      title: 'Tags',
      name: 'list_tags',
      type: 'list_tags',
    },
  ],
  preview: {
    select: {
      list: 'list_tags',
    },
    prepare: x => {
const infer = {
      name: 'Tags',
      singletonTitle: null,
      icon: getIcon('Tag'),
      fallback: {},
    }
           const title = resolveValue('title', generalContentTags.preview.select, x);           const subtitle = resolveValue('subtitle', generalContentTags.preview.select, x);           const media = resolveValue('media', generalContentTags.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || x.list?.length && x.list.length === 1 ? '1 item' : x.list?.length > 0 ? `${x.list.length} items` : 'No items',             media: media || infer.icon           }, x, infer.fallback);         },
  },
}