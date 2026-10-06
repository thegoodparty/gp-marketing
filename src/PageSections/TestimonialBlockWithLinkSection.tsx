import { stegaClean } from 'next-sanity';

import type { SectionOverrides, Sections } from '~/PageSections';

import { normalizeRawCtaToButton, transformButton, transformButtons, type RawCtaInput } from '~/lib/buttonTransformer';
import { pickItemsForState } from '~/lib/nearestStates';
import type { TokenMap } from '~/lib/resolveTokens';
import { resolveSectionText, resolveRichTextTokens } from '~/lib/resolveSectionText';
import { resolveAuthor } from '~/ui/_lib/resolveAuthor';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';

import { RichData } from '~/ui/RichData';
import { TestimonialBlockWithLink } from '~/ui/TestimonialBlockWithLink';

type Props = Extract<Sections, { _type: 'component_testimonialBlockWithLink' }> & {
	tokens?: TokenMap;
	pageState?: SectionOverrides['component_testimonialBlockWithLink'];
};

const DEFAULT_STATE_CARD_COUNT = 3;

export function TestimonialBlockWithLinkSection(props: Props) {
	const { pageState, ...section } = props;
	const backgroundColor = section.testimonialBlockWithLinkDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(section.testimonialBlockWithLinkDesignSettings.field_blockColorCreamMidnight)
		: 'cream';

	const allQuotes = section.quotesContentCollection?.quotes;
	if (!allQuotes || allQuotes.length === 0) return null;

	const maxToDisplay = section.testimonialBlockWithLinkDesignSettings?.field_maxNumberToDisplay;
	const hasMax = typeof maxToDisplay === 'number' && maxToDisplay > 0;
	const filterByState = section.testimonialBlockWithLinkDesignSettings?.field_filterQuotesByPageState === true;

	// With the toggle on, the page's state picks and orders the quotes: its own
	// first, then the nearest states', then quotes with no state. The toggle
	// never reaches outside the editor's chosen collection, and a page with no
	// state (the Voter Hub) shows the collection as is.
	const ordered =
		filterByState && pageState?.stateName
			? pickItemsForState(
					allQuotes,
					row => (row.quote?.field_quoteState ? stegaClean(row.quote.field_quoteState) : undefined),
					pageState.stateName,
					hasMax ? maxToDisplay : DEFAULT_STATE_CARD_COUNT,
				)
			: allQuotes;
	const quotes = hasMax ? ordered.slice(0, maxToDisplay) : ordered;

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
