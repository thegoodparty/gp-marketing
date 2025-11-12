import type { Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';

import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveColumnLayout } from '~/ui/_lib/resolveColumnLayout';
import { resolveTeams } from '~/ui/_lib/resolveTeams';

import { RichData } from '~/ui/RichData';
import { TeamBlock } from '~/ui/TeamBlock';
import { stegaClean } from 'next-sanity';

export function TeamBlockSection(section: Extract<Sections, { _type: 'component_teamBlock' }>) {
	const backgroundColor = section.teamBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(section.teamBlockDesignSettings.field_blockColorCreamMidnight)
		: 'cream';

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Team Block'>
			<TeamBlock
				backgroundColor={backgroundColor}
				header={{
					label: section.summaryInfo?.field_label,
					title: section.summaryInfo?.field_title,
					copy: <RichData value={section.summaryInfo?.block_summaryText} />,
					caption: section.summaryInfo?.field_caption,
					buttons: transformButtons(section.summaryInfo?.list_buttons),
				}}
				items={resolveTeams(section.people?.list_people)}
				columns={resolveColumnLayout(stegaClean(section.teamBlockDesignSettings?.field_columnLayout34Columns))}
			/>
		</section>
	);
}
