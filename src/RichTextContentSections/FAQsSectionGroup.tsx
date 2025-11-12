import type { ArticleSections } from '~/RichTextContentSections';
import { resolveFAQItems } from '~/ui/_lib/resolveFAQItems';
import { FAQBlock } from '~/ui/FAQBlock';

export function FAQsSectionGroup(section: Extract<ArticleSections, { _type: 'faqs' }>) {
	return (
		<div data-group='FAQsSectionGroup' className='font-secondary'>
			<FAQBlock layout='blog' items={resolveFAQItems(section.list_faQs)} />
		</div>
	);
}
