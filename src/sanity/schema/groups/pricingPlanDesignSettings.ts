import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const pricingPlanDesignSettings = {
  title: 'Pricing Plan Design Settings',
  name: 'pricingPlanDesignSettings',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('ColorPalette'),
  fields: [
    {
      title: 'Color',
      name: 'field_componentColor6ColorsMidnight',
      type: 'field_componentColor6ColorsMidnight',
    },
  ],
  preview: {
    select: {
      title: 'field_componentColor6ColorsMidnight',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('ColorPalette'),
      fallback: {},
    }
         const title = resolveValue('title', pricingPlanDesignSettings.preview.select, x);         const subtitle = resolveValue('subtitle', pricingPlanDesignSettings.preview.select, x);         const media = resolveValue('media', pricingPlanDesignSettings.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}