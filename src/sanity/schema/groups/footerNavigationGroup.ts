import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const footerNavigationGroup = {
  title: 'Footer Navigation Group',
  name: 'footerNavigationGroup',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('CicsSystemGroup'),
  fields: [
    {
      title: 'Heading',
      name: 'field_title',
      type: 'field_title',
    },
    {
      title: 'Links',
      name: 'list_footerNavigationGroup',
      type: 'list_footerNavigationGroup',
    },
  ],
  preview: {
    select: {
      title: 'field_title',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('CicsSystemGroup'),
      fallback: {
        previewTitle: 'field_title',
        previewSubTitle: '*Navigation Group',
        title: 'Footer Navigation Group',
      },
    }
         const title = resolveValue('title', footerNavigationGroup.preview.select, x);         const subtitle = resolveValue('subtitle', footerNavigationGroup.preview.select, x);         const media = resolveValue('media', footerNavigationGroup.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}