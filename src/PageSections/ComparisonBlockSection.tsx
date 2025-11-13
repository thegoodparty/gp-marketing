import type { Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';

import type { componentColorValues } from '~/ui/_lib/designTypesStore';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveComponentColor } from '~/ui/_lib/resolveComponentColor';
import { ComparisonBlock } from '~/ui/ComparisonBlock';
import type { ComparisonTableCardProps } from '~/ui/ComparisonTableCard';
import { RichData } from '~/ui/RichData';
import { stegaClean } from 'next-sanity';

export function ComparisonBlockSection(section: Extract<Sections, { _type: 'component_comparisonBlock' }>) {
	const backgroundColor = section.comparisonBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.comparisonBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Comparison Block'>
			<ComparisonBlock
				backgroundColor={backgroundColor}
				header={{
					title: section.summaryInfo?.field_title,
					label: section.summaryInfo?.field_label,
					caption: section.summaryInfo?.field_caption,
					copy: <RichData value={section.summaryInfo?.block_summaryText} />,
					buttons: transformButtons(section.summaryInfo?.list_buttons),
				}}
				tableOne={resolveComparisonBlockTableCard(section.comparisonBlockTableOne)}
				tableTwo={resolveComparisonBlockTableCard(section.comparisonBlockTableTwo)}
			/>
		</section>
	);
}

function resolveComparisonBlockTableCard(
	table: Extract<Sections, { _type: 'component_comparisonBlock' }>['comparisonBlockTableOne' | 'comparisonBlockTableTwo'],
) {
	if (!table) return undefined;
	return {
		title: table.field_title,
		list: table.list_comparisonBlockTableItems
			?.map(item => {
				return item.block_summaryText?.[0]?.children && item.block_summaryText?.[0]?.children?.length > 0
					? {
							title: <RichData value={item.block_summaryText} />,
							icon: item.field_icon,
						}
					: undefined;
			})
			.filter(Boolean),
		color:
			table.field_componentColor6Colors &&
			(resolveComponentColor(table.field_componentColor6Colors) as Exclude<
				(typeof componentColorValues)[number],
				'inverse' | 'midnight' | 'cream'
			>),
	} satisfies ComparisonTableCardProps;
}
