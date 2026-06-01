import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const customFeature = {
  title: 'Custom Feature',
  name: 'customFeature',
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
      subtitle: 'field_featureDescription',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Home'),
      fallback: {
        previewTitle: 'field_featureName',
        previewSubTitle: 'field_featureDescription',
        title: 'Custom Feature',
      },
    }
         const title = resolveValue('title', customFeature.preview.select, x);         const subtitle = resolveValue('subtitle', customFeature.preview.select, x);         const media = resolveValue('media', customFeature.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}