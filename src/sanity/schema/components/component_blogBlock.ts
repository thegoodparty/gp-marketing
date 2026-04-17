import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const component_blogBlock = {
  title: 'Blog Block',
  name: 'component_blogBlock',
  description: 'A grid of articles.',
  type: 'object',
  icon: getIcon('Grid'),
  fields: [
    {
      title: 'Articles',
      name: 'blogBlockContent',
      type: 'blogBlockContent',
      group: 'blogBlockContent',
    },
    {
      title: 'Text Overrides',
      name: 'blogBlockSummaryInfo',
      type: 'blogBlockSummaryInfo',
      group: 'blogBlockSummaryInfo',
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      type: 'componentSettings',
      group: 'componentSettings',
    },
  ],
  preview: {
    select: {
      title: 'blogBlockContent.ref_selectATopic.tagOverview.field_name',
      _type: '_type',
      title1: 'blogBlockContent.ref_selectACategory.tagOverview.field_name',
      title2: 'blogBlockContent.field_blogBlockContentOptions',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Filter'),
      fallback: {
        previewTitle: 'blogBlockContent.ref_selectATopic.tagOverview.field_name|blogBlockContent.ref_selectACategory.tagOverview.field_name|blogBlockContent.field_blogBlockContentOptions',
        previewSubTitle: '*Blog Block',
        title: 'Blog Block',
      },
    }
         const title = resolveValue('title', component_blogBlock.preview.select, x);         const subtitle = resolveValue('subtitle', component_blogBlock.preview.select, x);         const media = resolveValue('media', component_blogBlock.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Articles',
      name: 'blogBlockContent',
      icon: getIcon('Filter'),
    },
    {
      title: 'Text Overrides',
      name: 'blogBlockSummaryInfo',
      icon: getIcon('TextFont'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
}