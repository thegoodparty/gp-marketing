import { transformButtons } from '~/lib/buttonTransformer';
import { resolveAuthor } from '~/ui/_lib/resolveAuthor';
import type { Sections } from '~/PageSections';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { Carousel } from '~/ui/Carousel';
import { RichData } from '~/ui/RichData';
import { stegaClean } from 'next-sanity';

export function CarouselBlockSection(section: Extract<Sections, { _type: 'component_carouselBlock' }>) {
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
					title: section.summaryInfo?.field_title,
					label: section.summaryInfo?.field_label,
					caption: section.summaryInfo?.field_caption,
					copy: <RichData value={section.summaryInfo?.block_summaryText} />,
					buttons: transformButtons(section.summaryInfo?.list_buttons),
					layout: 'left',
					backgroundColor,
				}}
			/>
		</section>
	);
}
