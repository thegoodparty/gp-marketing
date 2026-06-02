import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const tagOverview = {
  title: 'Tag Overview',
  name: 'tagOverview',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Tag'),
  fields: [
    {
      title: 'Name',
      name: 'field_name',
      type: 'field_name',
    },
    {
      title: 'Slug',
      name: 'field_slug',
      type: 'field_slug',
    },
    {
      title: 'Page Subtitle',
      name: 'field_pageSubtitle',
      type: 'field_pageSubtitle',
    },
  ],
  preview: {
    select: {
      title: 'field_name',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Tag'),
      fallback: {},
    }
         const title = resolveValue('title', tagOverview.preview.select, x);         const subtitle = resolveValue('subtitle', tagOverview.preview.select, x);         const media = resolveValue('media', tagOverview.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}