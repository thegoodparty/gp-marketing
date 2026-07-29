import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';
import type { TokenMap } from '~/lib/resolveTokens';
import { resolveSectionText, resolveRichTextTokens } from '~/lib/resolveSectionText';

import { transformButtons } from '~/lib/buttonTransformer';

import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveStepperBlockLayout } from '~/ui/_lib/resolveStepperBlockLayout';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';

import { RichData } from '~/ui/RichData';
import { StepperBlock } from '~/ui/StepperBlock';

type Props = Extract<Sections, { _type: 'component_stepperBlock' }> & {
	tokens?: TokenMap;
};

export function StepperBlockSection(section: Props) {
	const backgroundColor = section.stepperBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.stepperBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';
	const summary = section.summaryInfo;

	const header = summary
		? {
				label: resolveSectionText(summary.field_label, section.tokens),
				title: resolveSectionText(summary.field_title, section.tokens),
				copy: <RichData value={resolveRichTextTokens(summary.block_summaryText, section.tokens)} />,
				buttons: transformButtons(summary.list_buttons),
				caption: resolveSectionText(summary.field_caption, section.tokens),
				backgroundColor,
				textSize: resolveTextSize(summary.field_textSize),
			}
		: undefined;

	const items =
		section.stepperBlockItems?.list_stepperBlockItems?.map(item => ({
			_key: item._key,
			label: resolveSectionText(item.summaryInfo?.field_label, section.tokens),
			title: resolveSectionText(item.summaryInfo?.field_title, section.tokens),
			copy: <RichData value={resolveRichTextTokens(item.summaryInfo?.block_summaryText, section.tokens)} />,
			buttons: transformButtons(item.summaryInfo?.list_buttons),
			image: item.stepperBlockItemMedia?.img_image,
			showFullImage: item.stepperBlockItemMedia?.showFullImage,
			layout:
				item.stepperBlockItemDesignSettings?.field_mediaAlignmentRightLeft &&
				resolveStepperBlockLayout(stegaClean(item.stepperBlockItemDesignSettings.field_mediaAlignmentRightLeft)),
			caption: resolveSectionText(item.summaryInfo?.field_caption, section.tokens),
			textSize: resolveTextSize(item.summaryInfo?.field_textSize),
		})) ?? [];

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Stepper Block'>
			<StepperBlock header={header} items={items} backgroundColor={backgroundColor} />
		</section>
	);
}
