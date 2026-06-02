import {toPlainText} from '../../utils/toPlainText.ts';
import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const pricingPlanFeatureListItem = {
  title: 'Pricing Plan Feature List Item',
  name: 'pricingPlanFeatureListItem',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  description: 'A single feature that appears in a pricing card.',
  icon: getIcon('Checkmark'),
  fields: [
    {
      title: 'Feature Text',
      name: 'block_pricingPlanFeatureItemText',
      type: 'block_pricingPlanFeatureItemText',
    },
  ],
  preview: {
    select: {
      title: 'block_pricingPlanFeatureItemText',
    },
    prepare: x => {
const infer = {
      name: 'Pricing Plan Feature Item Text',
      singletonTitle: null,
      icon: getIcon('Checkmark'),
      fallback: {
        previewSubTitle: '*',
        title: 'Pricing Plan Feature List Item',
      },
    }
           const title = resolveValue('title', pricingPlanFeatureListItem.preview.select, x);           const subtitle = resolveValue('subtitle', pricingPlanFeatureListItem.preview.select, x);           const media = resolveValue('media', pricingPlanFeatureListItem.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || typeof title === 'string' ? title : Array.isArray(title) ? toPlainText(title) : infer.name,             subtitle: subtitle ? subtitle : infer.fallback['title'],             media: media || infer.icon           }, x, infer.fallback);         },
  },
}