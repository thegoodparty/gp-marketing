import { stegaClean } from 'next-sanity';
import { transformButtons } from '~/lib/buttonTransformer';
import { FAQ_PAGE_SLUG } from '~/lib/faqSlugs';
import type { Sections } from '~/PageSections';
import { resolveFAQItems } from '~/ui/_lib/resolveFAQItems';
import { resolveFAQItemsAsText } from '~/lib/resolveFAQItemsAsText';
import { FAQBlock } from '~/ui/FAQBlock';
import { RichData } from '~/ui/RichData';
import { PageSchema } from '~/ui/PageSchema';
import { buildFAQSchema } from '~/lib/schema';

type FAQBlockSectionProps = Extract<Sections, { _type: 'component_faqBlock' }> & {
	pageSlug?: string;
	faqSlugMap?: ReadonlyMap<string, string>;
};

export function FAQBlockSection(section: FAQBlockSectionProps) {
	const sourceFaqs = (section.faQsContentCollection?.['faQs'] ?? null) as Parameters<typeof resolveFAQItemsAsText>[0];
	const isFaqLandingPage = section.pageSlug === FAQ_PAGE_SLUG;
	const slugMap = isFaqLandingPage ? section.faqSlugMap : undefined;
	const faqSchema = isFaqLandingPage ? null : buildFAQSchema(resolveFAQItemsAsText(sourceFaqs));

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='FAQ Block'>
			<PageSchema schema={faqSchema ?? undefined} />
			<FAQBlock
				variant={isFaqLandingPage ? 'links' : 'accordion'}
				header={{
					label: section.summaryInfo?.field_label,
					title: section.summaryInfo?.field_title,
					copy: <RichData value={section.summaryInfo?.block_summaryText} />,
					caption: section.summaryInfo?.field_caption,
					buttons: transformButtons(section.summaryInfo?.list_buttons),
				}}
				items={resolveFAQItems(section.faQsContentCollection?.['faQs'], {
					linksOnly: isFaqLandingPage,
					slugMap,
				})}
			/>
		</section>
	);
}
