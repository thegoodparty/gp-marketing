import type { Sections } from '~/PageSections';

import {
	isUsableHref,
	normalizeRawCtaToButton,
	resolveButtonHref,
	type RawCtaInput,
} from '~/lib/buttonTransformer';
import type { TokenMap } from '~/lib/resolveTokens';
import { resolveSectionText } from '~/lib/resolveSectionText';

import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveComponentColor } from '~/ui/_lib/resolveComponentColor';
import { CTACardBlock } from '~/ui/CTACardBlock';
import { stegaClean } from 'next-sanity';

type Props = Extract<Sections, { _type: 'component_ctaCardsBlock' }> & {
	tokens?: TokenMap;
};

export function resolveCtaCardHref(
	cta: unknown,
	labelFallback?: { label: string; href: string },
): string | undefined {
	const button = cta ? normalizeRawCtaToButton(cta as RawCtaInput, 'cta-card') : undefined;
	const href = button ? resolveButtonHref(button) : undefined;
	return isUsableHref(href) ? href : labelFallback?.href;
}

export function CTACardsBlockSection(section: Props) {
	const backgroundColor = section.ctaCardsBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.ctaCardsBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	const cardOneCta = section.ctaCardOne?.ctaActionWithShared;
	const cardTwoCta = section.ctaCardTwo?.ctaActionWithShared;
	const cardOneHref = resolveCtaCardHref(
		cardOneCta,
		section.ctaCardOne?.field_label === 'Candidates' ? { label: 'Candidates', href: '/candidates' } : undefined,
	);
	const cardTwoHref = resolveCtaCardHref(
		cardTwoCta,
		section.ctaCardTwo?.field_label === 'Upcoming elections'
			? { label: 'Upcoming elections', href: '/elections' }
			: undefined,
	);

	const cardOneTitle = section.ctaCardOne?.ctaActionWithShared?.text;
	const cardTwoTitle = section.ctaCardTwo?.ctaActionWithShared?.text;

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='CTA Cards Block'>
			<CTACardBlock
				backgroundColor={backgroundColor}
				card1={{
					color: resolveComponentColor(stegaClean(section.ctaCardOne?.field_componentColor6ColorsInverse), backgroundColor),
					href: cardOneHref,
					label: resolveSectionText(section.ctaCardOne?.field_label, section.tokens),
					title: resolveSectionText(cardOneTitle ?? undefined, section.tokens),
				}}
				card2={{
					color: resolveComponentColor(stegaClean(section.ctaCardTwo?.field_componentColor6ColorsInverse), backgroundColor),
					href: cardTwoHref,
					label: resolveSectionText(section.ctaCardTwo?.field_label, section.tokens),
					title: resolveSectionText(cardTwoTitle ?? undefined, section.tokens),
				}}
			/>
		</section>
	);
}
