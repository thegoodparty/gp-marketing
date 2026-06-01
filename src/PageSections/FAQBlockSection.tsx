import { stegaClean } from 'next-sanity';
import { transformButtons } from '~/lib/buttonTransformer';
import type { Sections } from '~/PageSections';
import { resolveFAQItems } from '~/ui/_lib/resolveFAQItems';
import { resolveFAQItemsAsText } from '~/lib/resolveFAQItemsAsText';
import { FAQBlock } from '~/ui/FAQBlock';
import { RichData } from '~/ui/RichData';
import { PageSchema } from '~/ui/PageSchema';
import { buildFAQSchema } from '~/lib/schema';

export function FAQBlockSection(section: Extract<Sections, { _type: 'component_faqBlock' }>) {
	const sourceFaqs = (section.faQsContentCollection?.['faQs'] ?? null) as Parameters<typeof resolveFAQItemsAsText>[0];
	const faqSchema = buildFAQSchema(resolveFAQItemsAsText(sourceFaqs));
	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='FAQ Block'>
			<PageSchema schema={faqSchema ?? undefined} />
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
