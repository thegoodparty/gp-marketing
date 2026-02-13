import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveCalculatorLayout } from '~/ui/_lib/resolveCalculatorLayout';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';

import { CalculatorTextBlock } from '~/ui/CalculatorTextBlock';
import { RichData } from '~/ui/RichData';

const bgClass = {
	cream: 'bg-goodparty-cream',
	midnight: 'bg-midnight-900',
} as const;

export function CalculatorTextBlockSection(
	section: Extract<Sections, { _type: 'component_calculatorTextBlock' }>,
) {
	const backgroundColor = section.calculatorTextBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(section.calculatorTextBlockDesignSettings.field_blockColorCreamMidnight)
		: 'cream';
	const layout = resolveCalculatorLayout(
		stegaClean(section.calculatorTextBlockDesignSettings?.field_calculatorLayout),
	);
	const summary = section.summaryInfo;

	return (
		<section
			id={stegaClean(section.componentSettings?.field_anchorId)}
			data-section="Calculator Text Block"
			className={bgClass[backgroundColor]}
		>
			<CalculatorTextBlock
				backgroundColor={backgroundColor}
				layout={layout}
				text={{
					title: summary?.field_title,
					copy: summary?.block_summaryText ? (
						<RichData value={summary.block_summaryText} />
					) : undefined,
					buttons: transformButtons(summary?.list_buttons),
				}}
				textSize={resolveTextSize(summary?.field_textSize)}
			/>
		</section>
	);
}
