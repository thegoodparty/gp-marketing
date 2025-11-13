import { stegaClean } from 'next-sanity';
import type { Sections } from '~/PageSections';
import { BlogTopicTagsBlock } from '~/ui/BlogTopicTagsBlock';

export function BlogTopicTagsBlockSection(section: Extract<Sections, { _type: 'component_blogTopicTagsBlock' }>) {
	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Blog Topic Tags Block'>
			<BlogTopicTagsBlock
				topics={section.topics
					?.map(topic =>
						topic.tagOverview?.field_name && topic.href ? { name: topic.tagOverview.field_name, href: topic.href } : undefined,
					)
					.filter(Boolean)}
			/>
		</section>
	);
}
