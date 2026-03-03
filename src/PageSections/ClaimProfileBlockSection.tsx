import type { Sections } from '~/PageSections';
import { ClaimProfileBlock } from '~/ui/ClaimProfileBlock';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveCTALink } from '~/ui/_lib/resolveCTALink';
import { stegaClean } from 'next-sanity';
import type { ButtonType } from '~/lib/buttonTransformer';

export function ClaimProfileBlockSection(
	section: Extract<Sections, { _type: 'component_claimProfileBlock' }>,
) {
	const backgroundColor = section.claimProfileBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.claimProfileBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	const ctaButton = section.ctaAction;
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
			claimButton={{
				buttonType: 'internal',
				href: resolveCTALink(ctaButton as unknown as ButtonType),
				label: ctaButton?.text || 'View Claims',
			}}
				exampleCard={{
					name: exampleCard?.field_name || 'Firstname Lastname',
					partyAffiliation: exampleCard?.field_partyAffiliation,
					secondaryText: exampleCard?.field_secondaryText,
					showBadge: exampleCard?.field_showBadge ?? true,
				}}
			/>
		</section>
	);
}
