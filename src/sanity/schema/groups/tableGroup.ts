import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const tableGroup = {
  title: 'Table',
  name: 'tableGroup',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Table'),
  fields: [
    {
      title: 'Table',
      name: 'field_table',
      type: 'field_table',
    },
  ],
  preview: {
    select: {
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Table'),
      fallback: {
        previewTitle: '*Table',
        previewSubTitle: '*Table Block',
        title: 'Table',
      },
    }
         const title = resolveValue('title', tableGroup.preview.select, x);         const subtitle = resolveValue('subtitle', tableGroup.preview.select, x);         const media = resolveValue('media', tableGroup.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}