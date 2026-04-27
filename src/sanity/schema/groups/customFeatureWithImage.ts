import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const customFeatureWithImage = {
  title: 'Custom Feature With Image',
  name: 'customFeatureWithImage',
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
      title: 'Feature Image',
      name: 'img_featureImage',
      type: 'img_featureImage',
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
      media: 'img_featureImage',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Home'),
      fallback: {
        previewTitle: 'field_featureName',
        previewSubTitle: 'field_featureDescription',
        previewMedia: 'img_featureImage',
        title: 'Custom Feature With Image',
      },
    }
         const title = resolveValue('title', customFeatureWithImage.preview.select, x);         const subtitle = resolveValue('subtitle', customFeatureWithImage.preview.select, x);         const media = resolveValue('media', customFeatureWithImage.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}