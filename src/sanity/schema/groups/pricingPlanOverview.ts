import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const pricingPlanOverview = {
	title: 'Pricing Plan Overview',
	name: 'pricingPlanOverview',
	type: 'object',
	options: {
		collapsed: false,
		columns: 1,
	},
	icon: getIcon('CurrencyDollar'),
	fields: [
		{
			title: 'Name',
			name: 'field_pricingPlanName',
			type: 'field_pricingPlanName',
		},
		{
			title: 'Price',
			name: 'field_pricingPlanPrice',
			type: 'field_pricingPlanPrice',
		},
		{
			title: 'Billing Period',
			name: 'field_billingPeriod',
			type: 'field_billingPeriod',
		},
		{
			title: 'Hide GoodParty Heart Icon',
			name: 'hideGoodPartyHeartIcon',
			type: 'boolean',
		},
	],
	preview: {
		select: {
			title: 'field_pricingPlanName',
			_type: '_type',
		},
		prepare: x => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('CurrencyDollar'),
				fallback: {},
			};
			const title = resolveValue('title', pricingPlanOverview.preview.select, x);
			const subtitle = resolveValue('subtitle', pricingPlanOverview.preview.select, x);
			const media = resolveValue('media', pricingPlanOverview.preview.select, x);
			return handleReplacements(
				{
					title: infer.singletonTitle || title || undefined,
					subtitle: subtitle ? subtitle : infer.fallback['title'],
					media: media || infer.icon,
				},
				x,
				infer.fallback,
			);
		},
	},
};
