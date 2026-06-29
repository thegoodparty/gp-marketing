import type { Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';
import type { TokenMap } from '~/lib/resolveTokens';
import { resolveSectionText } from '~/lib/resolveSectionText';
import { resolveTwoUpCardBlockCardType } from '~/ui/_lib/resolveTwoUpCardBlockCardType';
import { resolveComponentColor } from '~/ui/_lib/resolveComponentColor';

import { TwoUpCardBlock, type TwoUpCardBlockCardProps } from '~/ui/TwoUpCardBlock';
import { stegaClean } from 'next-sanity';
import { RichData } from '~/ui/RichData';
import type { SanityImage } from '~/ui/types';
import { resolveTestimonials } from '~/ui/_lib/resolveTestimonials';
import { resolveBg } from '~/ui/_lib/resolveBg';

type Props = Extract<Sections, { _type: 'component_twoUpCardBlock' }> & {
	tokens?: TokenMap;
};

export function TwoUpCardBlockSection(section: Props) {
	const backgroundColor = section.twoUpCardBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.twoUpCardBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';
	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Two Up Card Block'>
			<TwoUpCardBlock
				backgroundColor={backgroundColor}
				card1={resolveTwoUpCardBlockCard(section.twoUpCardBlockOne, section.tokens)}
				card2={resolveTwoUpCardBlockCard(section.twoUpCardBlockTwo, section.tokens)}
			/>
		</section>
	);
}

function resolveTwoUpCardBlockCard(
	card: Extract<Sections, { _type: 'component_twoUpCardBlock' }>['twoUpCardBlockOne' | 'twoUpCardBlockTwo'],
	tokens?: TokenMap,
): TwoUpCardBlockCardProps | undefined {
	if (!card) return undefined;
	if (!card.field_twoUpCardBlockCardType) return undefined;

	const cardType = resolveTwoUpCardBlockCardType(stegaClean(card.field_twoUpCardBlockCardType));

	switch (cardType) {
		case 'value-prop':
			return {
				title: resolveSectionText(card.valuePropositionCard?.field_title, tokens) ?? '',
				type: 'value-prop',
				color: card.valuePropositionCard?.field_componentColor6ColorsInverse
					? resolveComponentColor(stegaClean(card.valuePropositionCard.field_componentColor6ColorsInverse))
					: undefined,
				list: card.valuePropositionCard?.list_valuePropositionCardItems?.map(item => {
					return {
						title: <RichData value={item.block_summaryText} />,
						icon: item.field_icon,
					};
				}),
				button: transformButtons([card?.valuePropositionCard?.button as any])?.[0],
			};
		case 'testimonial':
			const testimonials = card.ref_quoteReference ? resolveTestimonials({ quotes: [card.ref_quoteReference] })?.[0] : undefined;
			return testimonials ? { ...testimonials, type: 'testimonial' } : undefined;
		case 'image':
			return card.twoUpCardBlockCardImage?.img_twoUpCardBlockCardImage
				? {
						type: 'image',
						image: card.twoUpCardBlockCardImage.img_twoUpCardBlockCardImage as unknown as SanityImage,
						showFullImage: card.twoUpCardBlockCardImage.showFullImage,
					}
				: undefined;
		default:
			return undefined;
	}
}
