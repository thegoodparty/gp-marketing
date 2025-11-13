import { Text } from './Text';

interface TaglineProps {
	copy?: string;
}

export const Tagline = (props: TaglineProps) => {
	return (
		<div className='w-fit text-black py-1 px-2.5 shadow-xs border border-grey rounded-sm bg-white'>
			<Text styleType='text-sm'>{props.copy}</Text>
		</div>
	);
};
