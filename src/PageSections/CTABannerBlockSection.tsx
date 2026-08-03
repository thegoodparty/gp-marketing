import type { Sections, SectionOverrides } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';
import type { TokenMap } from '~/lib/resolveTokens';
import { resolveSectionText, resolveRichTextTokens } from '~/lib/resolveSectionText';

import { resolveComponentColor } from '~/ui/_lib/resolveComponentColor';
import { CTABannerBlock } from '~/ui/CTABannerBlock';
import { RichData } from '~/ui/RichData';
import { Text } from '~/ui/Text';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { stegaClean } from 'next-sanity';

type Props = Extract<Sections, { _type: 'component_ctaBannerBlock' }> & {
	tokens?: TokenMap;
	ctaOverride?: SectionOverrides['component_ctaBannerBlock'];
};

export function CTABannerBlockSection(section: Props) {
	const { ctaOverride } = section;
	const backgroundColor = section.ctaBannerBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.ctaBannerBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	const title = ctaOverride?.title ?? resolveSectionText(section.title, section.tokens);
	// An explicit override copy is plain text; otherwise render the CMS rich text.
	const copy = ctaOverride?.copy ? (
		<Text styleType='body-1'>{ctaOverride.copy}</Text>
	) : (
		<RichData value={resolveRichTextTokens(section.block_summaryText, section.tokens)} />
	);

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='CTA Banner Block'>
			<CTABannerBlock
				backgroundColor={backgroundColor}
				color={resolveComponentColor(stegaClean(section.ctaBannerBlockDesignSettings?.field_componentColor6ColorsInverse), backgroundColor)}
				title={title}
				copy={copy}
				button={ctaOverride?.button ?? transformButtons([section['primaryCTA']])?.[0]}
				align={ctaOverride?.align}
				preserveButtonStyle={ctaOverride?.preserveButtonStyle}
				contentColumnAlign={ctaOverride?.contentColumnAlign}
			/>
		</section>
	);
}
