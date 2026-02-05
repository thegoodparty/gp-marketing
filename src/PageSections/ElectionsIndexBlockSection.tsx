import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';
import { transformButtons } from '~/lib/buttonTransformer';
import { DEFAULT_DISPLAY_COUNT } from '~/constants/display';
import { ElectionsIndexBlock } from '~/ui/ElectionsIndexBlock';
import { RichData } from '~/ui/RichData';

type ElectionsIndexBlockSectionProps = Extract<Sections, { _type: 'component_electionsIndexBlock' }>;

export function ElectionsIndexBlockSection(section: ElectionsIndexBlockSectionProps) {
	// Resolve background color - handle both direct values and Sanity enum values
	const bgValue = section.electionsIndexBlockDesignSettings?.field_blockColorCreamMidnight;
	const backgroundColor = bgValue
		? stegaClean(bgValue) === 'cream' || stegaClean(bgValue) === 'Cream'
			? 'cream'
			: 'midnight'
		: 'midnight';

	return (
		<section
			id={stegaClean(section.componentSettings?.field_anchorId)}
			data-section="Elections Index Block"
		>
			<ElectionsIndexBlock
				backgroundColor={backgroundColor}
				stateSlug=""
				header={{
					title: section.electionsIndexBlockHeader?.field_title,
					label: section.electionsIndexBlockHeader?.field_label,
					copy: <RichData value={section.electionsIndexBlockHeader?.block_summaryText} />,
					backgroundColor,
					buttons: transformButtons(section.electionsIndexBlockHeader?.list_buttons),
				}}
				elections={[]}
				showSearch={section.electionsIndexBlockDesignSettings?.field_showSearch ?? true}
				searchPlaceholder={
					section.electionsIndexBlockDesignSettings?.field_searchPlaceholder ??
					'Search by county or municipality'
				}
				initialDisplayCount={section.electionsIndexBlockDesignSettings?.field_initialDisplayCount ?? DEFAULT_DISPLAY_COUNT}
				ctaLabel={section.electionsIndexBlockDesignSettings?.field_ctaLabel ?? 'Browse CTA'}
			/>
		</section>
	);
}
