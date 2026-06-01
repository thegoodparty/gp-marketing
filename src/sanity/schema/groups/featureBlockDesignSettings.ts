import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const featureBlockDesignSettings = {
  title: 'Feature Block Design Settings',
  name: 'featureBlockDesignSettings',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('ColorPalette'),
  fields: [
    {
      title: 'Alignment',
      name: 'field_highlightedFeatureAlignmentRightLeft',
      type: 'field_highlightedFeatureAlignmentRightLeft',
    },
    {
      title: 'Icon Color',
      name: 'field_iconColor6Colors',
      type: 'field_iconColor6Colors',
    },
    {
      title: 'Block Color',
      name: 'field_blockColorCreamMidnight',
      type: 'field_blockColorCreamMidnight',
    },
  ],
  preview: {
    select: {
      title: 'field_highlightedFeatureAlignmentRightLeft',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('ColorPalette'),
      fallback: {},
    }
         const title = resolveValue('title', featureBlockDesignSettings.preview.select, x);         const subtitle = resolveValue('subtitle', featureBlockDesignSettings.preview.select, x);         const media = resolveValue('media', featureBlockDesignSettings.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}