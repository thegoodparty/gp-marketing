import { Container } from '~/ui/Container';
import { Tag } from './Tag';
import { Text } from './Text';

import type { backgroundTypeValues } from '~/ui/_lib/designTypesStore';

type BlogTopicTagsBlockProps = {
	backgroundColor?: (typeof backgroundTypeValues)[number];
	headingOverride?: string;
	topics: {
		name: string;
		href: string;
	}[];
};

export function BlogTopicTagsBlock(props: BlogTopicTagsBlockProps) {
	return (
		<div className='bg-goodparty-cream'>
			<Container size='xl' className={'py-[calc(var(--container-padding))]'}>
				<div className='flex flex-col gap-[2rem] rounded-[1rem] bg-lavender-100 p-[1.5rem] md:p-[3rem]'>
					<Text as='h3' styleType='heading-sm'>
						{props.headingOverride || 'Explore all topics'}
					</Text>
					<div className='flex flex-wrap gap-x-[0.5rem] gap-y-[1rem]'>
						{props.topics?.map((topic, index) => (
							<Tag key={`topic-${topic.href}-${index}`} id={`topic-${topic.href}-${index}`} name={topic.name} href={topic.href} />
						))}
					</div>
				</div>
			</Container>
		</div>
	);
}
