import { stegaClean } from 'next-sanity';

import type { SectionOverrides, Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';
import type { TokenMap } from '~/lib/resolveTokens';
import { resolveSectionText, resolveRichTextTokens } from '~/lib/resolveSectionText';

import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';

import { LocationFactsBlock } from '~/ui/LocationFactsBlock';
import { RichData } from '~/ui/RichData';

type Props = Extract<Sections, { _type: 'component_locationFactsBlock' }> & {
	factsOverride?: SectionOverrides['component_locationFactsBlock'];
	tokens?: TokenMap;
};

export function LocationFactsBlockSection(props: Props) {
	const { factsOverride, tokens, ...section } = props;

	if (factsOverride?.hidden) {
		return null;
	}

	const backgroundColor = section.locationFactsBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.locationFactsBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	const factsCards =
		factsOverride?.factsCards ??
		(section.locationFactsBlockCards?.list_factTypes ?? []).map(factType => {
			const cleanFactType = stegaClean(factType) ?? '';
			return {
				factType: cleanFactType,
				label: cleanFactType,
				value: 'N/A',
			};
		});

	if (!factsCards.length) {
		return null;
	}

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Location Facts Block'>
			<LocationFactsBlock
				backgroundColor={backgroundColor}
				header={{
					title:
						factsOverride?.headerTitle ??
						resolveSectionText(section.locationFactsBlockHeader?.field_title, tokens),
					label: resolveSectionText(section.locationFactsBlockHeader?.field_label, tokens),
					caption: resolveSectionText(section.locationFactsBlockHeader?.field_caption, tokens),
					copy: (
						<RichData
							value={resolveRichTextTokens(
								section.locationFactsBlockHeader?.block_summaryText,
								tokens,
							)}
						/>
					),
					backgroundColor,
					buttons: transformButtons(section.locationFactsBlockHeader?.list_buttons),
					textSize: resolveTextSize(section.locationFactsBlockHeader?.field_textSize),
				}}
				factsCards={factsCards}
			/>
		</section>
	);
}
