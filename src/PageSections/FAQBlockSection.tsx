import { stegaClean } from 'next-sanity';
import { transformButtons } from '~/lib/buttonTransformer';
import { FAQ_PAGE_SLUG } from '~/lib/faqSlugs';
import type { Sections } from '~/PageSections';
import type { TokenMap } from '~/lib/resolveTokens';
import { resolveSectionText, resolveRichTextTokens } from '~/lib/resolveSectionText';
import { resolveFAQItems } from '~/ui/_lib/resolveFAQItems';
import { resolveFAQItemsAsText } from '~/lib/resolveFAQItemsAsText';
import { FAQBlock } from '~/ui/FAQBlock';
import { RichData } from '~/ui/RichData';
import { PageSchema } from '~/ui/PageSchema';
import { buildFAQSchema } from '~/lib/schema';

type FAQBlockSectionProps = Extract<Sections, { _type: 'component_faqBlock' }> & {
	pageSlug?: string;
	faqSlugMap?: ReadonlyMap<string, string>;
	tokens?: TokenMap;
	faqOverride?: { items?: Array<{ title: string; copy: string }> };
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
					label: resolveSectionText(section.summaryInfo?.field_label, section.tokens),
					title: resolveSectionText(section.summaryInfo?.field_title, section.tokens),
					copy: <RichData value={resolveRichTextTokens(section.summaryInfo?.block_summaryText, section.tokens)} />,
					caption: resolveSectionText(section.summaryInfo?.field_caption, section.tokens),
					buttons: transformButtons(section.summaryInfo?.list_buttons),
				}}
				items={
					section.faqOverride?.items ??
					resolveFAQItems(section.faQsContentCollection?.['faQs'], {
						linksOnly: isFaqLandingPage,
						slugMap,
					})
				}
			/>
		</section>
	);
}
