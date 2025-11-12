import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const plans = {
  title: 'Plans',
  name: 'plans',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('CurrencyDollar'),
  fields: [
    {
      title: 'Pricing Plans',
      name: 'list_pricingPlans',
      type: 'list_pricingPlans',
    },
  ],
  preview: {
    select: {
      list: 'list_pricingPlans',
    },
    prepare: x => {
const infer = {
      name: 'Pricing Plans',
      singletonTitle: null,
      icon: getIcon('CurrencyDollar'),
      fallback: {},
    }
           const title = resolveValue("title", plans.preview.select, x);           const subtitle = resolveValue("subtitle", plans.preview.select, x);           const media = resolveValue("media", plans.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || x.list?.length && x.list.length === 1 ? "1 item" : x.list?.length > 0 ? `${x.list.length} items` : "No items",             media: media || infer.icon           }, x, infer.fallback);         },
  },
}