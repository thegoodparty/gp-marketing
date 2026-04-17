import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const component_blogTopicTagsBlock = {
  title: 'Blog Topic Tags Block',
  name: 'component_blogTopicTagsBlock',
  type: 'object',
  icon: getIcon('TagGroup'),
  fields: [
    {
      title: 'Overview',
      name: 'blogTopicTagsBlockOverview',
      type: 'blogTopicTagsBlockOverview',
      group: 'blogTopicTagsBlockOverview',
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
      title: 'blogTopicTagsBlockOverview.field_topicsHeadingOverride',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Home'),
      fallback: {
        previewTitle: 'blogTopicTagsBlockOverview.field_topicsHeadingOverride',
        previewSubTitle: '*Blog Topic Tags Block',
        title: 'Blog Topic Tags Block',
      },
    }
         const title = resolveValue('title', component_blogTopicTagsBlock.preview.select, x);         const subtitle = resolveValue('subtitle', component_blogTopicTagsBlock.preview.select, x);         const media = resolveValue('media', component_blogTopicTagsBlock.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Overview',
      name: 'blogTopicTagsBlockOverview',
      icon: getIcon('Home'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
}