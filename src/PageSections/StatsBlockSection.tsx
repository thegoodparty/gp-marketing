import type { Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';

import { resolveLayoutStackedSideBySide } from '~/ui/_lib/resolveLayoutStackedSideBySide';
import { resolveStats } from '~/ui/_lib/resolveStats';
import { StatsBlock } from '~/ui/StatsBlock';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { stegaClean } from 'next-sanity';
import { RichData } from '~/ui/RichData';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';

export function StatsBlockSection(section: Extract<Sections, { _type: 'component_statsBlock' }>) {
	const backgroundColor = section.statsBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(section.statsBlockDesignSettings.field_blockColorCreamMidnight)
		: 'cream';

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Stats Block'>
			<StatsBlock
				backgroundColor={backgroundColor}
				header={{
					label: section.summaryInfo?.field_label,
					title: section.summaryInfo?.field_title,
					caption: section.summaryInfo?.field_caption,
					buttons: transformButtons(section.summaryInfo?.list_buttons),
					layout: 'left',
					textSize: resolveTextSize(section.summaryInfo?.field_textSize),
					copy: <RichData value={section.summaryInfo?.block_summaryText} />,
				}}
				stats={resolveStats(section.stats?.list_stats)}
				layout={resolveLayoutStackedSideBySide(section.statsBlockDesignSettings?.field_layoutStackedSideBySide)}
			/>
		</section>
	);
}
