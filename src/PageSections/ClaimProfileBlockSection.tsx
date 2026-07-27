import type { SectionOverrides, Sections } from '~/PageSections';
import { isButtonType, transformButton } from '~/lib/buttonTransformer';
import { ClaimProfileBlock } from '~/ui/ClaimProfileBlock';
import { ClaimProfileModal } from '~/components/people/ClaimProfileModal';
import { stegaClean } from 'next-sanity';

type Props = Extract<Sections, { _type: 'component_claimProfileBlock' }> & {
	claimProfileOverride?: SectionOverrides['component_claimProfileBlock'];
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

export function ClaimProfileBlockSection({ claimProfileOverride, ...section }: Props) {
	const bgValue = stegaClean(section.claimProfileBlockDesignSettings?.field_blockColorCreamMidnight);
	const backgroundColor = resolveClaimProfileBlockBackgroundColor(bgValue);

	// Person profiles: render the interactive claim/notify modal so the "notify"
	// form posts the real personId to the claim-request endpoint. Falls through
	// to the static CMS banner for regular marketing pages.
	if (claimProfileOverride?.interactive && claimProfileOverride.personId) {
		return (
			<section data-section='Claim Profile Block'>
				<ClaimProfileModal
					personId={claimProfileOverride.personId}
					displayName={claimProfileOverride.displayName ?? 'this candidate'}
					persona={claimProfileOverride.persona ?? 'candidate'}
				/>
			</section>
		);
	}

	const ctaButton = section.ctaAction;
	const claimButton = ctaButton && isButtonType(ctaButton) ? transformButton(ctaButton) : undefined;
	const exampleCard = section.claimProfileBlockContent?.exampleCard;

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Claim Profile Block'>
			<ClaimProfileBlock
				layout={claimProfileOverride?.layout ?? 'card'}
				backgroundColor={backgroundColor}
				headline={section.claimProfileBlockContent?.field_headline}
				body={section.claimProfileBlockContent?.field_body}
				claimButton={
					claimButton ?? {
						buttonType: 'internal',
						href: '/',
						label: ctaButton?.text || 'View Claims',
					}
				}
				// Maps CMS exampleCard → CandidatesCardProps (no secondaryText on card UI)
				exampleCard={
					claimProfileOverride?.layout === 'banner'
						? undefined
						: {
								name: claimProfileOverride?.candidateName ?? exampleCard?.field_name ?? 'Firstname Lastname',
								partyAffiliation: resolveExampleCardPartyAffiliation(claimProfileOverride?.partyAffiliation, exampleCard),
								href: '#',
								isGoodPartyCandidate: exampleCard?.field_showBadge ?? true,
							}
				}
			/>
		</section>
	);
}
