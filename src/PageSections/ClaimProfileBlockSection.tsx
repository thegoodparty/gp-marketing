import type { SectionOverrides, Sections } from '~/PageSections';
import { normalizeRawCtaToButton, type RawCtaInput, transformButton } from '~/lib/buttonTransformer';
import type { TokenMap } from '~/lib/resolveTokens';
import { resolveSectionText } from '~/lib/resolveSectionText';
import { ClaimProfileBlock } from '~/ui/ClaimProfileBlock';
import { Container } from '~/ui/Container';
import { stegaClean } from 'next-sanity';

type Props = Extract<Sections, { _type: 'component_claimProfileBlock' }> & {
	claimProfileOverride?: SectionOverrides['component_claimProfileBlock'];
	tokens?: TokenMap;
};

export function resolveExampleCardPartyAffiliation(
	override?: string,
	exampleCard?: { field_partyAffiliation?: string; field_secondaryText?: string },
): string {
	return override ?? exampleCard?.field_partyAffiliation ?? '';
}

export function resolveClaimProfileBlockBackgroundColor(bgValue: ReturnType<typeof stegaClean<string | undefined>>): 'cream' | 'midnight' {
	if (bgValue === 'midnight' || bgValue === 'MidnightDark') {
		return 'midnight';
	}
	return 'cream';
}

type ClaimProfileContent = Extract<Sections, { _type: 'component_claimProfileBlock' }>['claimProfileBlockContent'];

export function resolveClaimProfileBlockText(
	content: ClaimProfileContent,
	tokens?: TokenMap,
): { headline?: string; body?: string } {
	return {
		headline: resolveSectionText(content?.field_headline, tokens),
		body: resolveSectionText(content?.field_body, tokens),
	};
}

export function ClaimProfileBlockSection({ claimProfileOverride, tokens, ...section }: Props) {
	const bgValue = stegaClean(section.claimProfileBlockDesignSettings?.field_blockColorCreamMidnight);
	const backgroundColor = resolveClaimProfileBlockBackgroundColor(bgValue);

	const ctaButton = section.ctaAction;
	// Normalized so a section that skipped the page query (the code-default
	// template, written with schema field names) reads the same as a projected one.
	const normalizedButton = ctaButton ? normalizeRawCtaToButton(ctaButton as RawCtaInput, section._key) : undefined;
	const transformedButton = normalizedButton ? transformButton(normalizedButton) : undefined;
	const claimButton =
		transformedButton && claimProfileOverride?.formId ? { ...transformedButton, formId: claimProfileOverride.formId } : transformedButton;
	const exampleCard = section.claimProfileBlockContent?.exampleCard;
	const { headline, body } = resolveClaimProfileBlockText(section.claimProfileBlockContent, tokens);
	const layout = claimProfileOverride?.layout ?? 'card';

	const block = (
		<ClaimProfileBlock
			layout={layout}
			backgroundColor={backgroundColor}
			headline={headline}
			body={body}
			claimButton={
				claimButton ??
				// A person profile's claim always means sign-up, so its fallback keeps the
				// destination and the conversion id when the Studio button is unusable.
				(claimProfileOverride?.formId
					? {
							buttonType: 'signup',
							label: normalizedButton?.text || ctaButton?.text || 'Claim this profile',
							formId: claimProfileOverride.formId,
						}
					: {
							buttonType: 'internal',
							href: '/',
							label: normalizedButton?.text || ctaButton?.text || 'View Claims',
						})
			}
			// Maps CMS exampleCard → CandidatesCardProps (no secondaryText on card UI)
			exampleCard={
				layout === 'banner' || claimProfileOverride?.hideExampleCard
					? undefined
					: {
							name: claimProfileOverride?.candidateName ?? exampleCard?.field_name ?? 'Firstname Lastname',
							partyAffiliation: resolveExampleCardPartyAffiliation(claimProfileOverride?.partyAffiliation, exampleCard),
							href: '#',
							isGoodPartyCandidate: exampleCard?.field_showBadge ?? true,
						}
			}
		/>
	);

	// The card has its own border and rounded corners, so it needs the page gutter
	// around it; the banner is edge to edge by design.
	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Claim Profile Block'>
			{layout === 'card' ? (
				<Container size='xl' className='py-(--container-padding)'>
					{block}
				</Container>
			) : (
				block
			)}
		</section>
	);
}
