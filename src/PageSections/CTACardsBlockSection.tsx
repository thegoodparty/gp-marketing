import type { Sections } from '~/PageSections';

import { isButtonType, transformButton } from '~/lib/buttonTransformer';

import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveComponentColor } from '~/ui/_lib/resolveComponentColor';
import { CTACardBlock } from '~/ui/CTACardBlock';
import { stegaClean } from 'next-sanity';

export function CTACardsBlockSection(section: Extract<Sections, { _type: 'component_ctaCardsBlock' }>) {
	const backgroundColor = section.ctaCardsBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.ctaCardsBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	const cardOneCta = section.ctaCardOne?.ctaActionWithShared;
	const cardTwoCta = section.ctaCardTwo?.ctaActionWithShared;
	const cardOneHref =
		cardOneCta && isButtonType(cardOneCta) ? transformButton(cardOneCta)?.href : undefined;
	const cardTwoHref =
		cardTwoCta && isButtonType(cardTwoCta) ? transformButton(cardTwoCta)?.href : undefined;

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='CTA Cards Block'>
			<CTACardBlock
				backgroundColor={backgroundColor}
				card1={{
					color: resolveComponentColor(stegaClean(section.ctaCardOne?.field_componentColor6ColorsInverse), backgroundColor),
					href: cardOneHref,
					label: section.ctaCardOne?.field_label,
					title: section.ctaCardOne?.ctaActionWithShared?.text ?? undefined,
				}}
				card2={{
					color: resolveComponentColor(stegaClean(section.ctaCardTwo?.field_componentColor6ColorsInverse), backgroundColor),
					href: cardTwoHref,
					label: section.ctaCardTwo?.field_label,
					title: section.ctaCardTwo?.ctaActionWithShared?.text ?? undefined,
				}}
			/>
		</section>
	);
}
