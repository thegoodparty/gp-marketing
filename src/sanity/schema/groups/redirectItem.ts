import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const redirectItem = {
  title: 'Redirect Item',
  name: 'redirectItem',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('ArrowsHorizontal'),
  fields: [
    {
      title: 'From URL',
      name: 'field_fromUrl',
      type: 'field_fromUrl',
    },
    {
      title: 'To URL',
      name: 'field_toUrl',
      type: 'field_toUrl',
    },
    {
      title: 'Mark as Permanent (301)',
      name: 'field_permanentRedirect',
      type: 'field_permanentRedirect',
    },
    {
      title: 'Redirect Note',
      name: 'field_redirectNote',
      type: 'field_redirectNote',
    },
  ],
  preview: {
    select: {
      title: 'field_fromUrl',
      _type: '_type',
      subtitle: 'field_toUrl',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('ArrowsHorizontal'),
      fallback: {
        previewTitle: 'field_fromUrl',
        previewSubTitle: 'field_toUrl',
        title: 'Redirect Item',
      },
    }
         const title = resolveValue('title', redirectItem.preview.select, x);         const subtitle = resolveValue('subtitle', redirectItem.preview.select, x);         const media = resolveValue('media', redirectItem.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}