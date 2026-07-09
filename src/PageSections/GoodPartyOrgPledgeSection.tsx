import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';
import { transformButtons, normalizeRawCtaToButton } from '~/lib/buttonTransformer.tsx';
import type { TokenMap } from '~/lib/resolveTokens';
import { resolveSectionText, resolveRichTextTokens } from '~/lib/resolveSectionText';
import { resolveBg } from '~/ui/_lib/resolveBg.ts';
import { resolveIconColor } from '~/ui/_lib/resolveComponentColor.tsx';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize.ts';

import { GoodPartyOrgPledge } from '~/ui/GoodPartyOrgPledge.tsx';
import { RichData } from '~/ui/RichData.tsx';

type Props = Extract<Sections, { _type: 'component_goodPartyOrgPledge' }> & {
	tokens?: TokenMap;
};

export function GoodPartyOrgPledgeSection({ tokens, ...section }: Props) {
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
					title: resolveSectionText(section.summaryInfo?.field_title, tokens),
					label: resolveSectionText(section.summaryInfo?.field_label, tokens),
					caption: resolveSectionText(section.summaryInfo?.field_caption, tokens),
					copy: (
						<RichData
							value={resolveRichTextTokens(section.summaryInfo?.block_summaryText, tokens)}
						/>
					),
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
						title: resolveSectionText(card.field_title, tokens),
						content: <RichData value={resolveRichTextTokens(card.block_summaryText, tokens)} />,
						button: pledgeButton ? transformButtons([pledgeButton])?.[0] : undefined,
					};
				})}
			/>
		</section>
	);
}
