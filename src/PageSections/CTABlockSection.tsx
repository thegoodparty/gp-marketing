import type { Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';

import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveComponentColor } from '~/ui/_lib/resolveComponentColor';
import { resolveCTASize } from '~/ui/_lib/resolveCTASize';
import { CTABlock } from '~/ui/CTABlock';
import { stegaClean } from 'next-sanity';
import { RichData } from '~/ui/RichData';

export function CTABlockSection(section: Extract<Sections, { _type: 'component_ctaBlock' }>) {
	const backgroundColor = section.designSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.designSettings.field_blockColorCreamMidnight))
		: 'cream';

	return (
		<section data-section='CTA Block'>
			<CTABlock
				id={section._key}
				backgroundColor={backgroundColor}
				color={resolveComponentColor(stegaClean(section.designSettings?.field_componentColor6ColorsInverse), backgroundColor)}
				label={section['overview']?.field_label}
				title={section['overview']?.field_title}
				caption={section['overview']?.field_caption}
				buttons={transformButtons([section['primaryCTA'], { ...section['secondaryCTA'], hierarchy: 'Secondary' }])}
				size={resolveCTASize(stegaClean(section.designSettings?.field_ctaSizeNormalCondensed))}
				copy={<RichData value={section['overview']?.block_summaryText} />}
			/>
		</section>
	);
}
