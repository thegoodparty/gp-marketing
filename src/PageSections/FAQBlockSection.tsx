import { stegaClean } from 'next-sanity';
import { transformButtons } from '~/lib/buttonTransformer';
import type { Sections } from '~/PageSections';
import { resolveFAQItems } from '~/ui/_lib/resolveFAQItems';
import { FAQBlock } from '~/ui/FAQBlock';
import { RichData } from '~/ui/RichData';

export function FAQBlockSection(section: Extract<Sections, { _type: 'component_faqBlock' }>) {
	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='FAQ Block'>
			<FAQBlock
				header={{
					label: section.summaryInfo?.field_label,
					title: section.summaryInfo?.field_title,
					copy: <RichData value={section.summaryInfo?.block_summaryText} />,
					caption: section.summaryInfo?.field_caption,
					buttons: transformButtons(section.summaryInfo?.list_buttons),
				}}
				items={resolveFAQItems(section.faQsContentCollection?.['faQs'])}
			/>
		</section>
	);
}
