import type { Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';
import type { TokenMap } from '~/lib/resolveTokens';
import { resolveSectionText, resolveRichTextTokens } from '~/lib/resolveSectionText';

import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveComponentColor } from '~/ui/_lib/resolveComponentColor';
import { resolveCTASize } from '~/ui/_lib/resolveCTASize';
import { CTABlock } from '~/ui/CTABlock';
import { stegaClean } from 'next-sanity';
import { RichData } from '~/ui/RichData';

type Props = Extract<Sections, { _type: 'component_ctaBlock' }> & {
	tokens?: TokenMap;
	ctaOverride?: { primaryButtonHref?: string };
};

export function CTABlockSection(section: Props) {
	const backgroundColor = section.designSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.designSettings.field_blockColorCreamMidnight))
		: 'cream';

	return (
		<section data-section='CTA Block'>
			<CTABlock
				id={section._key}
				backgroundColor={backgroundColor}
				color={resolveComponentColor(stegaClean(section.designSettings?.field_componentColor6ColorsInverse), backgroundColor)}
				label={resolveSectionText(section['overview']?.field_label, section.tokens)}
				title={resolveSectionText(section['overview']?.field_title, section.tokens)}
				caption={resolveSectionText(section['overview']?.field_caption, section.tokens)}
				buttons={transformButtons([
					section.ctaOverride?.primaryButtonHref
						? {
								...(section['primaryCTA'] as object),
								link: { href: section.ctaOverride.primaryButtonHref },
							}
						: section['primaryCTA'],
					{ ...section['secondaryCTA'], hierarchy: 'Secondary' },
				])}
				size={resolveCTASize(stegaClean(section.designSettings?.field_ctaSizeNormalCondensed))}
				copy={<RichData value={resolveRichTextTokens(section['overview']?.block_summaryText, section.tokens)} />}
			/>
		</section>
	);
}
