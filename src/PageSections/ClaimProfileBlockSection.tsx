import type { SectionOverrides, Sections } from '~/PageSections';
import { isButtonType, transformButton } from '~/lib/buttonTransformer';
import { ClaimProfileBlock } from '~/ui/ClaimProfileBlock';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { stegaClean } from 'next-sanity';

type Props = Extract<Sections, { _type: 'component_claimProfileBlock' }> & {
	claimProfileOverride?: SectionOverrides['component_claimProfileBlock'];
};

export function ClaimProfileBlockSection({ claimProfileOverride, ...section }: Props) {
	const backgroundColor = section.claimProfileBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.claimProfileBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	const ctaButton = section.ctaAction;
	const claimButton =
		ctaButton && isButtonType(ctaButton)
			? transformButton(ctaButton)
			: undefined;
	const exampleCard = section.claimProfileBlockContent?.exampleCard;

	return (
		<section
			id={stegaClean(section.componentSettings?.field_anchorId)}
			data-section='Claim Profile Block'
		>
			<ClaimProfileBlock
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
				exampleCard={{
					name: claimProfileOverride?.candidateName ?? exampleCard?.field_name ?? 'Firstname Lastname',
					partyAffiliation: claimProfileOverride?.partyAffiliation ?? exampleCard?.field_partyAffiliation,
					secondaryText: exampleCard?.field_secondaryText,
					showBadge: exampleCard?.field_showBadge ?? true,
				}}
			/>
		</section>
	);
}
