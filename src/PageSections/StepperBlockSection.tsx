import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';

import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveStepperBlockLayout } from '~/ui/_lib/resolveStepperBlockLayout';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';

import { RichData } from '~/ui/RichData';
import { StepperBlock } from '~/ui/StepperBlock';

export function StepperBlockSection(section: Extract<Sections, { _type: 'component_stepperBlock' }>) {
	const backgroundColor = section.stepperBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.stepperBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';
	const summary = section.summaryInfo;

	const header = summary
		? {
				label: summary.field_label,
				title: summary.field_title,
				copy: <RichData value={summary.block_summaryText} />,
				buttons: transformButtons(summary.list_buttons),
				caption: summary.field_caption,
				backgroundColor,
				textSize: resolveTextSize(summary.field_textSize),
			}
		: undefined;

	const items =
		section.stepperBlockItems?.list_stepperBlockItems?.map(item => ({
			_key: item._key,
			label: item.summaryInfo?.field_label,
			title: item.summaryInfo?.field_title,
			copy: <RichData value={item.summaryInfo?.block_summaryText} />,
			buttons: transformButtons(item.summaryInfo?.list_buttons),
			image: item.stepperBlockItemMedia?.img_image,
			showFullImage: item.stepperBlockItemMedia?.showFullImage,
			layout:
				item.stepperBlockItemDesignSettings?.field_mediaAlignmentRightLeft &&
				resolveStepperBlockLayout(stegaClean(item.stepperBlockItemDesignSettings.field_mediaAlignmentRightLeft)),
			caption: item.summaryInfo?.field_caption,
			textSize: resolveTextSize(item.summaryInfo?.field_textSize),
		})) ?? [];

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Stepper Block'>
			<StepperBlock header={header} items={items} backgroundColor={backgroundColor} />
		</section>
	);
}
