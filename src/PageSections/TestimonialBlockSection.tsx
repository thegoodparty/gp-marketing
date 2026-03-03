import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';

import { transformButtons, type ButtonType } from '~/lib/buttonTransformer';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveTestimonials } from '~/ui/_lib/resolveTestimonials';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';

import { RichData } from '~/ui/RichData';
import { TestimonialBlock } from '~/ui/TestimonialBlock';

export function TestimonialBlockSection(section: Extract<Sections, { _type: 'component_testimonialBlock' }>) {
	const backgroundColor = section.testimonialBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(section.testimonialBlockDesignSettings.field_blockColorCreamMidnight)
		: 'cream';

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Testimonial Block'>
			<TestimonialBlock
				backgroundColor={backgroundColor}
				header={{
					title: section.summaryInfo?.field_title,
					label: section.summaryInfo?.field_label,
					caption: section.summaryInfo?.field_caption,
					copy: <RichData value={section.summaryInfo?.block_summaryText} />,
					buttons: transformButtons(section.summaryInfo?.list_buttons as unknown as ButtonType[]),
					textSize: resolveTextSize(section.summaryInfo?.field_textSize),
				}}
				items={resolveTestimonials(section.quotesContentCollection)}
			/>
		</section>
	);
}
