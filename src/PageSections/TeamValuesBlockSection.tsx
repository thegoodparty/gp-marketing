import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveComponentColor } from '~/ui/_lib/resolveComponentColor';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';

import { RichData } from '~/ui/RichData';
import { TeamValuesBlock, type TeamValuesCardColor } from '~/ui/TeamValuesBlock';

export function TeamValuesBlockSection(section: Extract<Sections, { _type: 'component_teamValuesBlock' }>) {
	const backgroundColor = section.teamValuesBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.teamValuesBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	const cards =
		section.teamValuesBlockContent?.list_teamValuesCards?.map(item => {
			const rawColor = item.field_componentColor6Colors
				? resolveComponentColor(stegaClean(item.field_componentColor6Colors))
				: undefined;

			return {
				icon: item.field_icon,
				heading: item.field_title,
				backCopy: (item as { field_backCopy?: string }).field_backCopy,
				color: rawColor as TeamValuesCardColor | undefined,
			};
		}) ?? [];

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Team Values Block'>
			<TeamValuesBlock
				backgroundColor={backgroundColor}
				header={{
					title: section.summaryInfo?.field_title,
					label: section.summaryInfo?.field_label,
					caption: section.summaryInfo?.field_caption,
					copy: <RichData value={section.summaryInfo?.block_summaryText} />,
					buttons: transformButtons(section.summaryInfo?.list_buttons),
					textSize: resolveTextSize(section.summaryInfo?.field_textSize),
				}}
				cards={cards}
			/>
		</section>
	);
}
