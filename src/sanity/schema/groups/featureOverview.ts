import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const featureOverview = {
  title: 'Feature Overview',
  name: 'featureOverview',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Home'),
  fields: [
    {
      title: 'Feature Name',
      name: 'field_featureName',
      type: 'field_featureName',
    },
    {
      title: 'Feature Description',
      name: 'field_featureDescription',
      type: 'field_featureDescription',
    },
    {
      title: 'Icon',
      name: 'field_icon',
      type: 'field_icon',
    },
    {
      title: 'CTA',
      name: 'ctaActionWithShared',
      type: 'ctaActionWithShared',
    },
  ],
  preview: {
    select: {
      title: 'field_featureName',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Home'),
      fallback: {},
    }
         const title = resolveValue('title', featureOverview.preview.select, x);         const subtitle = resolveValue('subtitle', featureOverview.preview.select, x);         const media = resolveValue('media', featureOverview.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}