
export const list_pricingPlanFeatureListItems = {
  name: 'list_pricingPlanFeatureListItems',
  title: 'Pricing Plan Feature List Items',
  description: 'The list of features that will appear on this pricing plan.',
  options: {
    collapsible: false,
  },
  type: 'array',
  of: [
    {
      title: 'Feature',
      type: 'pricingPlanFeatureListItem',
    },
  ],
}