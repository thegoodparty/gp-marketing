import type { Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';
import { resolveTwoUpCardBlockCardType } from '~/ui/_lib/resolveTwoUpCardBlockCardType';
import { resolveComponentColor } from '~/ui/_lib/resolveComponentColor';

import { TwoUpCardBlock } from '~/ui/TwoUpCardBlock';
import { stegaClean } from 'next-sanity';

export function TwoUpCardBlockSection(section: Extract<Sections, { _type: 'component_twoUpCardBlock' }>) {
	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Two Up Card Block'>
			<TwoUpCardBlock
				card1={
					section.twoUpCardBlockOne &&
					({
						title: section.twoUpCardBlockOne.valuePropositionCard?.field_title,
						type:
							section.twoUpCardBlockOne.field_twoUpCardBlockCardType &&
							resolveTwoUpCardBlockCardType(stegaClean(section.twoUpCardBlockOne.field_twoUpCardBlockCardType)),
						color:
							section.twoUpCardBlockOne.valuePropositionCard?.field_componentColor6ColorsInverse &&
							resolveComponentColor(stegaClean(section.twoUpCardBlockOne.valuePropositionCard.field_componentColor6ColorsInverse)),
						list: section.twoUpCardBlockOne.valuePropositionCard?.list_valuePropositionCardItems?.map(item => {
							return {
								title: item.block_summaryText,
								icon: item.field_icon,
							};
						}),
						button: transformButtons([section.twoUpCardBlockOne?.valuePropositionCard?.button as any])?.[0],
					} as any)
				}
				card2={
					section.twoUpCardBlockTwo &&
					({
						title: section.twoUpCardBlockTwo.valuePropositionCard?.field_title,
						type:
							section.twoUpCardBlockTwo.field_twoUpCardBlockCardType &&
							resolveTwoUpCardBlockCardType(stegaClean(section.twoUpCardBlockTwo.field_twoUpCardBlockCardType)),
						color:
							section.twoUpCardBlockTwo.valuePropositionCard?.field_componentColor6ColorsInverse &&
							resolveComponentColor(stegaClean(section.twoUpCardBlockTwo.valuePropositionCard.field_componentColor6ColorsInverse)),
						list: section.twoUpCardBlockTwo.valuePropositionCard?.list_valuePropositionCardItems?.map(item => {
							return {
								title: item.block_summaryText,
								icon: item.field_icon,
							};
						}),
						button: transformButtons([section.twoUpCardBlockTwo?.valuePropositionCard?.button as any])?.[0],
					} as any)
				}
			/>
		</section>
	);
}
