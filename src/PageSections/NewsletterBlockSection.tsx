import type { Sections } from '~/PageSections';

import { resolveComponentColor } from '~/ui/_lib/resolveComponentColor';
import { resolveForm } from '~/ui/_lib/resolveForm';

import { CTABlock } from '~/ui/CTABlock';
import { RichData } from '~/ui/RichData';
import { stegaClean } from 'next-sanity';

export function NewsletterBlockSection(section: Extract<Sections, { _type: 'component_newsletterBlock' }>) {
	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Newsletter Block'>
			<CTABlock
				className='pt-0 pb-(--container-padding)'
				id={section._key}
				label={section.newsletterBlockMessaging?.field_label}
				title={section.newsletterBlockMessaging?.field_title}
				copy={<RichData value={section.newsletterBlockMessaging?.block_summaryText} />}
				caption={section.newsletterBlockMessaging?.field_caption}
				color={resolveComponentColor(stegaClean(section.newsletterBlockDesignSettings?.field_componentColor6Colors))}
				form={resolveForm(stegaClean(section.newsletterBlockForm?.ref_formUsed ?? undefined))}
			/>
		</section>
	);
}
