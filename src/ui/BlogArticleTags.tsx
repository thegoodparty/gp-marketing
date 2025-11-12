import { Tag, type TagProps } from './Tag';
import { Text } from './Text';

interface BlogArticleTagsProps {
	tags: TagProps[];
}

export const BlogArticleTags = (props: BlogArticleTagsProps) => {
	return (
		<div className='flex flex-col gap-4'>
			<Text styleType='subtitle-1'>Tags</Text>
			<div className='flex gap-2'>
				{props.tags?.map(tag => (
					<Tag key={tag.id} {...tag} />
				))}
			</div>
		</div>
	);
};
