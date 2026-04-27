import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const featuresBlockContent = {
  title: 'Features Block Content',
  name: 'featuresBlockContent',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Star'),
  fields: [
    {
      title: 'Highlighted Feature',
      name: 'list_featureBlockHighlightedFeature',
      type: 'list_featureBlockHighlightedFeature',
    },
    {
      title: 'Features',
      name: 'list_featureBlockFeatures',
      type: 'list_featureBlockFeatures',
    },
  ],
  preview: {
    select: {
      list: 'list_featureBlockHighlightedFeature',
    },
    prepare: x => {
const infer = {
      name: 'Feature Block Highlighted Feature',
      singletonTitle: null,
      icon: getIcon('Star'),
      fallback: {},
    }
           const title = resolveValue('title', featuresBlockContent.preview.select, x);           const subtitle = resolveValue('subtitle', featuresBlockContent.preview.select, x);           const media = resolveValue('media', featuresBlockContent.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || x.list?.length && x.list.length === 1 ? '1 item' : x.list?.length > 0 ? `${x.list.length} items` : 'No items',             media: media || infer.icon           }, x, infer.fallback);         },
  },
}