import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';

import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveFeaturesBlockItems } from '~/ui/_lib/resolveFeaturesBlockItems';
import { resolveHighlightedFeatureAlignment } from '~/ui/_lib/resolveHighlightedFeatureAlignment';
import { resolveIconBg } from '~/ui/_lib/resolveIconBg';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';

import { FeaturesBlock } from '~/ui/FeaturesBlock';
import { RichData } from '~/ui/RichData';

export function FeaturesBlockSection(section: Extract<Sections, { _type: 'component_featuresBlock' }>) {
	const backgroundColor = section.featureBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.featureBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Features Block'>
			<FeaturesBlock
				header={{
					title: section.summaryInfo?.field_title,
					label: section.summaryInfo?.field_label,
					caption: section.summaryInfo?.field_caption,
					copy: <RichData value={section.summaryInfo?.block_summaryText} />,
					backgroundColor,
					buttons: transformButtons(section.summaryInfo?.list_buttons),
					textSize: resolveTextSize(section.summaryInfo?.field_textSize),
				}}
				backgroundColor={backgroundColor}
				items={section.featuresBlockContent ? resolveFeaturesBlockItems(section.featuresBlockContent) : []}
				iconBg={
					section.featureBlockDesignSettings?.field_iconColor6Colors &&
					resolveIconBg(stegaClean(section.featureBlockDesignSettings.field_iconColor6Colors))
				}
				highlightedFeatureAlignment={
					section.featureBlockDesignSettings?.field_highlightedFeatureAlignmentRightLeft &&
					resolveHighlightedFeatureAlignment(stegaClean(section.featureBlockDesignSettings.field_highlightedFeatureAlignmentRightLeft))
				}
			/>
		</section>
	);
}
