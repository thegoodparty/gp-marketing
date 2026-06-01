import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';
import { transformButtons, normalizeRawCtaToButton } from '~/lib/buttonTransformer.tsx';
import { resolveBg } from '~/ui/_lib/resolveBg.ts';
import { resolveIconColor } from '~/ui/_lib/resolveComponentColor.tsx';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize.ts';

import { GoodPartyOrgPledge } from '~/ui/GoodPartyOrgPledge.tsx';
import { RichData } from '~/ui/RichData.tsx';

export function GoodPartyOrgPledgeSection(section: Extract<Sections, { _type: 'component_goodPartyOrgPledge' }>) {
	const backgroundColor = section.goodPartyOrgPledgeDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.goodPartyOrgPledgeDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	const resolvedIconColor = section.goodPartyOrgPledgeDesignSettings?.field_iconColor6ColorsWhiteMixed
		? resolveIconColor(stegaClean(section.goodPartyOrgPledgeDesignSettings.field_iconColor6ColorsWhiteMixed))
		: 'blue';
	const iconColor = resolvedIconColor === 'white' ? 'blue' : resolvedIconColor;

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='GoodParty.org Pledge'>
			<GoodPartyOrgPledge
				backgroundColor={backgroundColor}
				iconBg={iconColor}
				header={{
					title: section.summaryInfo?.field_title,
					label: section.summaryInfo?.field_label,
					caption: section.summaryInfo?.field_caption,
					copy: <RichData value={section.summaryInfo?.block_summaryText} />,
					buttons: transformButtons(section.summaryInfo?.list_buttons),
					textSize: resolveTextSize(section.summaryInfo?.field_textSize),
				}}
				pledgeCards={section.goodPartyOrgPledgeItems?.list_pledgeCards?.map(card => {
					const cta = card.ctaActionWithShared;
					const pledgeButton = cta
						? normalizeRawCtaToButton(cta, `${card._key ?? ''}-pledge-cta`)
						: undefined;

					return {
						icon: card.field_icon,
						title: card.field_title,
						content: <RichData value={card.block_summaryText} />,
						button: pledgeButton ? transformButtons([pledgeButton])?.[0] : undefined,
					};
				})}
			/>
		</section>
	);
}
