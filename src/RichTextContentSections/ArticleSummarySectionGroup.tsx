import type { ArticleSections } from '~/RichTextContentSections';
import { ArticleSummary } from '~/ui/ArticleSummary';
import { RichData } from '~/ui/RichData';

export function ArticleSummarySectionGroup(section: Extract<ArticleSections, { _type: 'articleSummary' }>) {
	return (
		<ArticleSummary label={section.field_label}>
			<RichData value={section.block_summaryBody} />
		</ArticleSummary>
	);
}
