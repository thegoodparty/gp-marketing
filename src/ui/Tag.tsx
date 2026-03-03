import { Anchor } from '~/ui/Anchor';
import { Text } from '~/ui/Text';

export type TagProps = {
	id: string;
	name?: string;
	href?: string;
};

export function Tag(props: TagProps) {
	return (
		<Text
			as='span'
			styleType='text-sm'
			className='relative py-[0.68rem] px-[1rem] text-midnight-900 bg-white rounded-full hover:bg-midnight-900 hover:text-white transition-all duration-fast ease-smooth w-fit'
		>
			<Anchor href={props.href} className='before:content[""] before:absolute before:inset-0'>
				{props.name}
			</Anchor>
		</Text>
	);
}
