import Link from 'next/link';
import { Text } from './Text';

interface TaglineProps {
	label?: string;
	href?: string;
}

export const Tagline = (props: TaglineProps) => {
	return (
		<Link href={props.href} className='w-fit text-black py-1 px-2.5 shadow-xs border border-grey rounded-sm bg-white'>
			<Text styleType='text-sm'>{props.label}</Text>
		</Link>
	);
};
