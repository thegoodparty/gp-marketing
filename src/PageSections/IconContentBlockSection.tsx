import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveIconColor } from '~/ui/_lib/resolveComponentColor';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';

import { IconContentBlock } from '~/ui/IconContentBlock';
import { RichData } from '~/ui/RichData';

export function IconContentBlockSection(section: Extract<Sections, { _type: 'component_iconContentBlock' }>) {
	const backgroundColor = section.iconContentBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.iconContentBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Icon Content Block'>
			<IconContentBlock
				backgroundColor={backgroundColor}
				header={{
					title: section.summaryInfo?.field_title,
					label: section.summaryInfo?.field_label,
					caption: section.summaryInfo?.field_caption,
					copy: <RichData value={section.summaryInfo?.block_summaryText} />,
					buttons: transformButtons(section.summaryInfo?.list_buttons),
					textSize: resolveTextSize(section.summaryInfo?.field_textSize),
				}}
				columns={resolveColumns(stegaClean(section.iconContentBlockDesignSettings?.field_columnLayout234Columns))}
				color={resolveIconColor(stegaClean(section.iconContentBlockDesignSettings?.field_iconColor6ColorsWhiteMixed))}
				items={section.iconContentBlockItems?.list_iconContentItems?.map(item => ({
					copy: <RichData value={item.block_summaryText} />,
					icon: item.field_icon,
					title: item?.field_title,
				}))}
			/>
		</section>
	);
}

export function resolveColumns(
	columns: NonNullable<
		Extract<Sections, { _type: 'component_iconContentBlock' }>['iconContentBlockDesignSettings']
	>['field_columnLayout234Columns'],
) {
	return columns === '2Col' ? '2' : columns === '3Col' ? '3' : '4';
}
