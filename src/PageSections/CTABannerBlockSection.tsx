import type { Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';

import { resolveComponentColor } from '~/ui/_lib/resolveComponentColor';
import { CTABannerBlock } from '~/ui/CTABannerBlock';
import { RichData } from '~/ui/RichData';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { stegaClean } from 'next-sanity';

export function CTABannerBlockSection(section: Extract<Sections, { _type: 'component_ctaBannerBlock' }>) {
	const backgroundColor = section.ctaBannerBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.ctaBannerBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='CTA Banner Block'>
			<CTABannerBlock
				backgroundColor={backgroundColor}
				color={resolveComponentColor(stegaClean(section.ctaBannerBlockDesignSettings?.field_componentColor6ColorsInverse), backgroundColor)}
				title={section.title ?? undefined}
				copy={<RichData value={section.block_summaryText} />}
				button={transformButtons([section['primaryCTA']])?.[0]}
			/>
		</section>
	);
}
