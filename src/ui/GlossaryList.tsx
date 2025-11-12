import type { ReactNode } from 'react';
import { Anchor } from '~/ui/Anchor';
import { Container } from '~/ui/Container';
import { Text } from '~/ui/Text';

type GlossaryListProps = {
	items: {
		title: string;
		copy?: ReactNode;
		href: string;
	}[];
};

export function GlossaryList(props: GlossaryListProps) {
	if (!props.items || props.items.length === 0) {
		return null;
	}

	return (
		<section className='bg-goodparty-cream'>
			<Container size='lg' className='pb-(--container-padding)'>
				<ul className='flex flex-col gap-6'>
					{props.items.map(item => (
						<li key={item.href} className='relative flex flex-col gap-2 p-6 md:p-8 bg-white rounded-lg'>
							<Anchor href={item.href} className='link-inverse before:content-[""] before:absolute before:inset-0 w-fit'>
								<Text as='div' styleType='text-3xl' className='font-semibold'>
									{item.title}
								</Text>
							</Anchor>
							<Text as='div' styleType='text-lg' className='font-normal'>
								{item.copy}
							</Text>
						</li>
					))}
				</ul>
			</Container>
		</section>
	);
}
