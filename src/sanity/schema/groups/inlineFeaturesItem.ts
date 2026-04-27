import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const inlineFeaturesItem = {
  title: 'Inline Features Item',
  name: 'inlineFeaturesItem',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Star'),
  fields: [
    {
      title: 'Feature',
      name: 'ref_inlineFeaturesItem',
      type: 'ref_inlineFeaturesItem',
    },
  ],
  preview: {
    select: {
      ref: 'ref_inlineFeaturesItem._ref',
      type: 'ref_inlineFeaturesItem._type',
      features: 'ref_inlineFeaturesItem.field_featureName',
    },
    prepare: x => {
const infer = {
      name: 'Inline Features Item',
      singletonTitle: null,
      icon: getIcon('Star'),
      fallback: {},
    }
           const vtype = x.type;           const title = resolveValue('title', inlineFeaturesItem.preview.select, x);           const subtitle = resolveValue('subtitle', inlineFeaturesItem.preview.select, x);           const media = resolveValue('media', inlineFeaturesItem.preview.select, x);           const restitle = vtype in x ? x[vtype] : title;           return handleReplacements({             title: infer.singletonTitle || restitle || infer.name,             subtitle: subtitle ? subtitle : infer.fallback['title'],             media: media || infer.icon           }, x, infer.fallback);         },
  },
}