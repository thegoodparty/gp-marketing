import type { Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';
import type { TokenMap } from '~/lib/resolveTokens';
import { resolveSectionText, resolveRichTextTokens } from '~/lib/resolveSectionText';

import { resolveComponentColor } from '~/ui/_lib/resolveComponentColor';
import { CTABannerBlock } from '~/ui/CTABannerBlock';
import { RichData } from '~/ui/RichData';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { stegaClean } from 'next-sanity';

type Props = Extract<Sections, { _type: 'component_ctaBannerBlock' }> & {
	tokens?: TokenMap;
};

export function CTABannerBlockSection(section: Props) {
	const backgroundColor = section.ctaBannerBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.ctaBannerBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='CTA Banner Block'>
			<CTABannerBlock
				backgroundColor={backgroundColor}
				color={resolveComponentColor(stegaClean(section.ctaBannerBlockDesignSettings?.field_componentColor6ColorsInverse), backgroundColor)}
				title={resolveSectionText(section.title, section.tokens)}
				copy={<RichData value={resolveRichTextTokens(section.block_summaryText, section.tokens)} />}
				button={transformButtons([section['primaryCTA']])?.[0]}
			/>
		</section>
	);
}
