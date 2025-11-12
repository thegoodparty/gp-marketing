import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const pricingPlanFeatures = {
  title: 'Pricing Plan Features',
  name: 'pricingPlanFeatures',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('ListChecked'),
  fields: [
    {
      title: 'Feature List Title',
      name: 'field_featureListTitle',
      type: 'field_featureListTitle',
    },
    {
      title: 'Features',
      name: 'list_pricingPlanFeatureListItems',
      type: 'list_pricingPlanFeatureListItems',
    },
  ],
  preview: {
    select: {
      title: 'field_featureListTitle',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('ListChecked'),
      fallback: {},
    }
         const title = resolveValue("title", pricingPlanFeatures.preview.select, x);         const subtitle = resolveValue("subtitle", pricingPlanFeatures.preview.select, x);         const media = resolveValue("media", pricingPlanFeatures.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}