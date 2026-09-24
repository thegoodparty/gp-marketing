import { stegaClean } from 'next-sanity';

import type { SectionOverrides, Sections } from '~/PageSections';

import { normalizeRawCtaToButton, transformButton, type RawCtaInput } from '~/lib/buttonTransformer';
import type { TokenMap } from '~/lib/resolveTokens';
import { resolveSectionText } from '~/lib/resolveSectionText';

import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveComponentColor } from '~/ui/_lib/resolveComponentColor';
import { ElectionPositionResourcesBlock, type ElectionPositionResourceCardProps } from '~/ui/ElectionPositionResourcesBlock';
import type { ComponentButtonProps } from '~/ui/Inputs/Button';

type Section = Extract<Sections, { _type: 'component_electionPositionResourcesBlock' }>;

type Props = Section & {
	resourcesOverride?: SectionOverrides['component_electionPositionResourcesBlock'];
	tokens?: TokenMap;
};

type RawCard = Section['guideCard'] | undefined;

const DEFAULT_GUIDE_BUTTON_TEXT = 'Read the guide';

function resolveEditorButton(card: RawCard, key: string, tokens?: TokenMap): ComponentButtonProps | undefined {
	const raw = card?.button;
	if (!raw) return undefined;
	const normalized = normalizeRawCtaToButton(raw as RawCtaInput, `resources-${key}`);
	const button = normalized ? transformButton(normalized) : undefined;
	if (!button) return undefined;
	const label = typeof button.label === 'string' ? resolveSectionText(button.label, tokens) : button.label;
	return { ...button, label };
}

/**
 * The guide card's link is the one thing on this block that is not editorial.
 * Position pages hand in the article for their office (see
 * `resolveHowToRunGuide`); that wins over whatever link the editor set, which
 * only covers pages that are not position pages. With neither there is no guide
 * to point at, so the card is left out rather than published as a dead button.
 */
export function resolveGuideButton(card: RawCard, guideHref: string | undefined, tokens?: TokenMap): ComponentButtonProps | undefined {
	const editorButton = resolveEditorButton(card, 'guide', tokens);
	if (!guideHref) return editorButton;

	const text = card?.button?.text ? resolveSectionText(card.button.text, tokens) : undefined;
	return {
		buttonType: 'internal',
		href: guideHref,
		label: text ?? editorButton?.label ?? DEFAULT_GUIDE_BUTTON_TEXT,
	};
}

function buildCard(
	card: RawCard,
	button: ComponentButtonProps | undefined,
	backgroundColor: 'cream' | 'midnight',
	tokens?: TokenMap,
): ElectionPositionResourceCardProps | undefined {
	const title = resolveSectionText(card?.field_title, tokens);
	if (!title) return undefined;
	return {
		label: resolveSectionText(card?.field_label, tokens),
		title,
		description: resolveSectionText(card?.field_description, tokens),
		icon: card?.field_icon ? stegaClean(card.field_icon) : undefined,
		color: resolveComponentColor(card?.field_componentColor6ColorsInverse ?? undefined, backgroundColor),
		button,
	};
}

export function ElectionPositionResourcesBlockSection(props: Props) {
	const { resourcesOverride, tokens, ...section } = props;

	if (resourcesOverride?.hidden) {
		return null;
	}

	const backgroundColor = section.electionPositionResourcesBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.electionPositionResourcesBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	const guideButton = resolveGuideButton(section.guideCard, resourcesOverride?.guideHref, tokens);
	const guideCard = guideButton ? buildCard(section.guideCard, guideButton, backgroundColor, tokens) : undefined;
	const ebookCard = buildCard(section.ebookCard, resolveEditorButton(section.ebookCard, 'ebook', tokens), backgroundColor, tokens);
	const supportCard = buildCard(section.supportCard, resolveEditorButton(section.supportCard, 'support', tokens), backgroundColor, tokens);

	const cards = [guideCard, ebookCard, supportCard].filter((card): card is ElectionPositionResourceCardProps => card !== undefined);

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Election Position Resources Block'>
			<ElectionPositionResourcesBlock backgroundColor={backgroundColor} cards={cards} />
		</section>
	);
}
