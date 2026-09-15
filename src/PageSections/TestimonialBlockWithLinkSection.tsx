import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';

import { normalizeRawCtaToButton, transformButton, transformButtons, type RawCtaInput } from '~/lib/buttonTransformer';
import type { TokenMap } from '~/lib/resolveTokens';
import { resolveSectionText, resolveRichTextTokens } from '~/lib/resolveSectionText';
import { resolveAuthor } from '~/ui/_lib/resolveAuthor';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';

import { RichData } from '~/ui/RichData';
import { TestimonialBlockWithLink } from '~/ui/TestimonialBlockWithLink';

type Props = Extract<Sections, { _type: 'component_testimonialBlockWithLink' }> & {
	tokens?: TokenMap;
};

export function TestimonialBlockWithLinkSection(section: Props) {
	const backgroundColor = section.testimonialBlockWithLinkDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(section.testimonialBlockWithLinkDesignSettings.field_blockColorCreamMidnight)
		: 'cream';

	const quotes = section.quotesContentCollection?.quotes;
	if (!quotes || quotes.length === 0) return null;

	const cards = quotes.map((row, index) => {
		const rawLink = row.quote?.button;
		const normalized = rawLink ? normalizeRawCtaToButton(rawLink as RawCtaInput, `story-link-${index}`) : undefined;

		return {
			author: resolveAuthor(row.quote?.ref_quoteBy),
			copy: row.quote?.field_quote ?? undefined,
			result: row.quote?.field_quoteResult ?? undefined,
			link: normalized ? transformButton(normalized) : undefined,
		};
	});

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Testimonial Block With Link'>
			<TestimonialBlockWithLink
				backgroundColor={backgroundColor === 'midnight' ? 'midnight' : 'cream'}
				cards={cards}
				header={{
					title: resolveSectionText(section.summaryInfo?.field_title, section.tokens),
					label: resolveSectionText(section.summaryInfo?.field_label, section.tokens),
					caption: resolveSectionText(section.summaryInfo?.field_caption, section.tokens),
					copy: <RichData value={resolveRichTextTokens(section.summaryInfo?.block_summaryText, section.tokens)} />,
					buttons: transformButtons(section.summaryInfo?.list_buttons),
					layout: 'left',
					backgroundColor: backgroundColor === 'midnight' ? 'midnight' : 'cream',
					textSize: resolveTextSize(section.summaryInfo?.field_textSize),
				}}
			/>
		</section>
	);
}
