import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const navigationCollection = {
  title: 'Navigation Collection',
  name: 'navigationCollection',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('DataCollection'),
  fields: [
    {
      title: 'Internal Link',
      name: 'internalLink',
      type: 'internalLink',
    },
    {
      title: 'Navigation Groups',
      name: 'list_navigationGroups',
      type: 'list_navigationGroups',
    },
  ],
  preview: {
    select: {
      title: 'internalLink.field_linkText',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Link'),
      fallback: {
        previewTitle: 'internalLink.field_linkText',
        previewSubTitle: '*Navigation Collection',
        title: 'Navigation Collection',
      },
    }
         const title = resolveValue('title', navigationCollection.preview.select, x);         const subtitle = resolveValue('subtitle', navigationCollection.preview.select, x);         const media = resolveValue('media', navigationCollection.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}