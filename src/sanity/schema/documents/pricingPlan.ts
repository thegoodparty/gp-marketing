import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const pricingPlan = {
  title: 'Pricing Plans',
  name: 'pricingPlan',
  type: 'document',
  icon: getIcon('CurrencyDollar'),
  fields: [
    {
      title: 'Overview',
      name: 'pricingPlanOverview',
      type: 'pricingPlanOverview',
      group: 'pricingPlanOverview',
    },
    {
      title: 'Features',
      name: 'pricingPlanFeatures',
      type: 'pricingPlanFeatures',
      group: 'pricingPlanFeatures',
    },
    {
      title: 'CTA',
      name: 'pricingPlanCta',
      type: 'pricingPlanCta',
      group: 'pricingPlanCta',
    },
    {
      title: 'Design Settings',
      name: 'pricingPlanDesignSettings',
      type: 'pricingPlanDesignSettings',
      group: 'pricingPlanDesignSettings',
    },
  ],
  preview: {
    select: {
      title: 'pricingPlanOverview.field_pricingPlanName',
      _type: '_type',
      subtitle: 'pricingPlanOverview.field_pricingPlanPrice',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('CurrencyDollar'),
      fallback: {
        previewTitle: 'pricingPlanOverview.field_pricingPlanName',
        previewSubTitle: 'pricingPlanOverview.field_pricingPlanPrice',
        title: 'Pricing Plans',
      },
    }
         const title = resolveValue('title', pricingPlan.preview.select, x);         const subtitle = resolveValue('subtitle', pricingPlan.preview.select, x);         const media = resolveValue('media', pricingPlan.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Overview',
      name: 'pricingPlanOverview',
      icon: getIcon('CurrencyDollar'),
    },
    {
      title: 'Features',
      name: 'pricingPlanFeatures',
      icon: getIcon('ListChecked'),
    },
    {
      title: 'CTA',
      name: 'pricingPlanCta',
      icon: getIcon('Rocket'),
    },
    {
      title: 'Design Settings',
      name: 'pricingPlanDesignSettings',
      icon: getIcon('ColorPalette'),
    },
  ],
  options: {
    channels: {},
    single: false,
  },
}