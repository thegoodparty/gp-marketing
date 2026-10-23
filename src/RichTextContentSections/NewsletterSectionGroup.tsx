import { stegaClean } from 'next-sanity';

import type { NewsletterArticleSection } from '~/experiments/blogNewsletter';
import { CTABlock } from '~/ui/CTABlock';
import { RichData } from '~/ui/RichData';
import { resolveComponentColor } from '~/ui/_lib/resolveComponentColor';
import { resolveCTASize } from '~/ui/_lib/resolveCTASize';
import { resolveForm } from '~/ui/_lib/resolveForm';

/** The newsletter subscribe block inside an article body (voter-facing articles). */
export function NewsletterSectionGroup(section: NewsletterArticleSection) {
	const block = section.block;
	const form = resolveForm(stegaClean(block.newsletterBlockForm?.ref_formUsed ?? undefined));
	return (
		<section data-group='NewsletterSectionGroup' id='newsletter'>
			<CTABlock
				id={section._key}
				label={block.newsletterBlockMessaging?.field_label}
				title={block.newsletterBlockMessaging?.field_title}
				copy={<RichData value={block.newsletterBlockMessaging?.block_summaryText} />}
				caption={block.newsletterBlockMessaging?.field_caption}
				color={resolveComponentColor(stegaClean(block.newsletterBlockDesignSettings?.field_componentColor6Colors))}
				form={form ? { ...form, experiment: section.experiment } : undefined}
				size={resolveCTASize(stegaClean(block.newsletterBlockDesignSettings?.field_ctaSizeNormalCondensed))}
				layout='blog'
				hoverScale={false}
			/>
		</section>
	);
}
