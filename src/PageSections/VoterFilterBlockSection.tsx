import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';

import { RichData } from '~/ui/RichData';
import { VoterFilterBlock } from '~/ui/VoterFilterBlock';

export function VoterFilterBlockSection(section: Extract<Sections, { _type: 'component_voterFilterBlock' }>) {
	const backgroundColor = resolveBg(section.voterFilterBlockDesignSettings?.field_blockColorCreamMidnight ?? undefined);

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Voter Filter Block'>
			<VoterFilterBlock
				backgroundColor={backgroundColor}
				header={{
					title: section.summaryInfo?.field_title,
					label: section.summaryInfo?.field_label,
					caption: section.summaryInfo?.field_caption,
					copy: <RichData value={section.summaryInfo?.block_summaryText} />,
					buttons: transformButtons(section.summaryInfo?.list_buttons),
					textSize: resolveTextSize(section.summaryInfo?.field_textSize),
				}}
				groups={(section.voterFilterBlockContent?.list_voterFilterGroups ?? []).map(group => ({
					title: group.field_title ?? undefined,
					icon: group.field_icon ? stegaClean(group.field_icon) : undefined,
					filters: (group.list_voterFilters ?? []).map(filter => ({
						label: filter.field_label ?? '',
						values: (filter.list_values ?? []).filter((value): value is string => typeof value === 'string' && value.length > 0),
					})),
				}))}
			/>
		</section>
	);
}
