import type { ArticleSections } from '~/RichTextContentSections';
import { Author } from '~/ui/Author';
import { PlainText } from '~/ui/PlainText';

export function InlineQuoteSectionGroup(section: Extract<ArticleSections, { _type: 'inlineQuoteSection' }>) {
	return (
		<section data-group='InlineQuoteSectionGroup'>
			<div className='flex flex-col gap-6'>
				<PlainText
					as='blockquote'
					styleType='subtitle-1'
					className='italic pl-8 border-l-4 border-lavender-200 font-secondary'
					text={section.field_quote}
				/>
				<Author
					className='pl-9'
					name={section.ref_quoteBy?.['personOverview'].field_personName}
					meta={[section.ref_quoteBy?.['personOverview'].field_jobTitleOrRole]}
				/>
			</div>
		</section>
	);
}
