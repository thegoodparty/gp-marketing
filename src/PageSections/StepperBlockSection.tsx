import type { Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';

import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveStepperBlockLayout } from '~/ui/_lib/resolveStepperBlockLayout';
import { RichData } from '~/ui/RichData';
import { StepperBlock } from '~/ui/StepperBlock';
import { stegaClean } from 'next-sanity';

export function StepperBlockSection(section: Extract<Sections, { _type: 'component_stepperBlock' }>) {
	const backgroundColor = section.stepperBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.stepperBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	const header = {
		label: section.summaryInfo?.field_label,
		title: section.summaryInfo?.field_title,
		copy: <RichData value={section.summaryInfo?.block_summaryText} />,
		buttons: transformButtons(section.summaryInfo?.list_buttons),
		caption: section.summaryInfo?.field_caption,
		backgroundColor,
	};

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
		})) ?? [];

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Stepper Block'>
			<StepperBlock header={header} items={items} backgroundColor={backgroundColor} />
		</section>
	);
}
