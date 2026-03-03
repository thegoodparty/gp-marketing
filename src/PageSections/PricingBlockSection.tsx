import { stegaClean } from 'next-sanity';
import type { PricingPlan } from 'sanity.types';

import type { Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';

import { PricingBlock } from '~/ui/PricingBlock';
import { RichData } from '~/ui/RichData';
import { resolvePricingPlans } from '~/ui/_lib/resolvePricingPlans';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';

export function PricingBlockSection(section: Extract<Sections, { _type: 'component_pricingBlock' }>) {
	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Pricing Block'>
			<PricingBlock
				header={{
					label: section.summaryInfo?.field_label,
					title: section.summaryInfo?.field_title,
					copy: <RichData value={section.summaryInfo?.block_summaryText} />,
					caption: section.summaryInfo?.field_caption,
					buttons: transformButtons(section.summaryInfo?.list_buttons),
					textSize: resolveTextSize(section.summaryInfo?.field_textSize),
				}}
				items={resolvePricingPlans(section.plans?.list_pricingPlans as unknown as PricingPlan[])}
			/>
		</section>
	);
}
