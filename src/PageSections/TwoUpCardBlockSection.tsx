import type { Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';
import { resolveTwoUpCardBlockCardType } from '~/ui/_lib/resolveTwoUpCardBlockCardType';
import { resolveComponentColor } from '~/ui/_lib/resolveComponentColor';

import { TwoUpCardBlock, type TwoUpCardBlockCardProps } from '~/ui/TwoUpCardBlock';
import { stegaClean } from 'next-sanity';
import { RichData } from '~/ui/RichData';
import type { SanityImage } from '~/ui/types';
import { resolveTestimonials } from '~/ui/_lib/resolveTestimonials';
import { resolveBg } from '~/ui/_lib/resolveBg';

export function TwoUpCardBlockSection(section: Extract<Sections, { _type: 'component_twoUpCardBlock' }>) {
	const backgroundColor = section.twoUpCardBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.twoUpCardBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';
	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Two Up Card Block'>
			<TwoUpCardBlock
				backgroundColor={backgroundColor}
				card1={resolveTwoUpCardBlockCard(section.twoUpCardBlockOne)}
				card2={resolveTwoUpCardBlockCard(section.twoUpCardBlockTwo)}
			/>
		</section>
	);
}

function resolveTwoUpCardBlockCard(
	card: Extract<Sections, { _type: 'component_twoUpCardBlock' }>['twoUpCardBlockOne' | 'twoUpCardBlockTwo'],
): TwoUpCardBlockCardProps | undefined {
	if (!card?.field_twoUpCardBlockCardType) return undefined;

	const cardType = resolveTwoUpCardBlockCardType(stegaClean(card.field_twoUpCardBlockCardType));

	switch (cardType) {
		case 'value-prop':
			return {
				title: card.valuePropositionCard?.field_title ?? '',
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
