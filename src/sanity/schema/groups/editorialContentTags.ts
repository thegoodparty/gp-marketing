import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const editorialContentTags = {
  title: 'Editorial Content Tags',
  name: 'editorialContentTags',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Tag'),
  fields: [
    {
      title: 'Catgories',
      name: 'ref_catgories',
      type: 'ref_catgories',
    },
    {
      title: 'Topics',
      name: 'list_topics',
      type: 'list_topics',
    },
  ],
  preview: {
    select: {
      ref: 'ref_catgories._ref',
      type: 'ref_catgories._type',
      categories: 'ref_catgories.field_name',
    },
    prepare: x => {
const infer = {
      name: 'Catgories',
      singletonTitle: null,
      icon: getIcon('Tag'),
      fallback: {},
    }
           const vtype = x.type;           const title = resolveValue('title', editorialContentTags.preview.select, x);           const subtitle = resolveValue('subtitle', editorialContentTags.preview.select, x);           const media = resolveValue('media', editorialContentTags.preview.select, x);           const restitle = vtype in x ? x[vtype] : title;           return handleReplacements({             title: infer.singletonTitle || restitle || infer.name,             subtitle: subtitle ? subtitle : infer.fallback['title'],             media: media || infer.icon           }, x, infer.fallback);         },
  },
}