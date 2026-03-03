import type { ArticleSections } from '~/RichTextContentSections';
import { RichData } from '~/ui/RichData';
import { Text } from '~/ui/Text';

export function CalloutSectionGroup(section: Extract<ArticleSections, { _type: 'callout' }>) {
	return (
		<section data-group='CalloutSectionGroup' className='py-2 pl-8 border-l-4 border-lavender-200'>
			<Text styleType='text-lg' className='font-bold [&_a]:bg-none [&_a]:text-link font-secondary'>
				<RichData value={section.block_summaryText} />
			</Text>
		</section>
	);
}
