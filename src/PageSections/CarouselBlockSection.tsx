import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';
import type { TokenMap } from '~/lib/resolveTokens';
import { resolveSectionText, resolveRichTextTokens } from '~/lib/resolveSectionText';
import { resolveAuthor } from '~/ui/_lib/resolveAuthor';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';

import { Carousel } from '~/ui/Carousel';
import { RichData } from '~/ui/RichData';

type Props = Extract<Sections, { _type: 'component_carouselBlock' }> & {
	tokens?: TokenMap;
};

export function CarouselBlockSection(section: Props) {
	const backgroundColor = section.carouselBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(section.carouselBlockDesignSettings.field_blockColorCreamMidnight)
		: 'cream';

	if (!section.quotesContentCollection?.['quotes']) return null;

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Carousel Block'>
			<Carousel
				cards={section.quotesContentCollection?.['quotes']?.map(quote => ({
					copy: quote.quote?.field_quote,
					author: resolveAuthor(quote.quote?.ref_quoteBy),
				}))}
				backgroundColor={backgroundColor}
				header={{
					title: resolveSectionText(section.summaryInfo?.field_title, section.tokens),
					label: resolveSectionText(section.summaryInfo?.field_label, section.tokens),
					caption: resolveSectionText(section.summaryInfo?.field_caption, section.tokens),
					copy: (
						<RichData
							value={resolveRichTextTokens(section.summaryInfo?.block_summaryText, section.tokens)}
						/>
					),
					buttons: transformButtons(section.summaryInfo?.list_buttons),
					layout: 'left',
					backgroundColor,
					textSize: resolveTextSize(section.summaryInfo?.field_textSize),
				}}
			/>
		</section>
	);
}
