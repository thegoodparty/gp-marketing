import type { PricingPlan } from 'sanity.types';

import { transformButtons, type ButtonType } from '~/lib/buttonTransformer';

import { RichData } from '../RichData';
import type { PricingCardProps } from '../PricingCard';

import { resolveComponentColor } from './resolveComponentColor';

export function resolvePricingPlans(plans?: PricingPlan[]): PricingCardProps[] {
	return (
		plans?.map(plan => ({
			color: resolveComponentColor(plan.pricingPlanDesignSettings?.field_componentColor6ColorsMidnight),
			name: plan.pricingPlanOverview?.field_pricingPlanName,
			price: plan.pricingPlanOverview?.field_pricingPlanPrice,
			billingPeriod: plan.pricingPlanOverview?.field_billingPeriod,
			hideIcon: Boolean(plan.pricingPlanOverview?.hideGoodPartyHeartIcon),
			listTitle: plan.pricingPlanFeatures?.field_featureListTitle,
			list: plan.pricingPlanFeatures?.list_pricingPlanFeatureListItems?.map(item => (
				<RichData value={item.block_pricingPlanFeatureItemText} />
			)),
			button: transformButtons([plan.pricingPlanCta?.ctaActionWithShared as unknown as ButtonType])?.[0],
		})) ?? []
	);
}
