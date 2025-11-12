import { cn, tv } from './_lib/utils.ts';

import { Container } from './Container.tsx';
import { PricingCard, type PricingCardProps } from './PricingCard.tsx';
import { HeaderBlock, type HeaderBlockProps } from './HeaderBlock.tsx';

const styles = tv({
	slots: {
		base: 'py-(--container-padding) bg-midnight-900',
		container: 'flex flex-col gap-12 md:gap-20',
	},
});

export type PricingBlockProps = {
	className?: string;
	items: PricingCardProps[];
	header?: HeaderBlockProps;
};

export function PricingBlock(props: PricingBlockProps) {
	const { base, container } = styles();

	return (
		<article className={cn(base(), props.className)} data-component='PricingBlock'>
			<Container className={container()} size='xl'>
				<HeaderBlock {...props.header} backgroundColor='midnight' />
				{props.items && props.items.length > 0 && (
					<div className='flex max-lg:flex-col gap-6 lg:gap-8 justify-center'>
						{props.items?.map((item, index) => {
							return <PricingCard {...item} key={index} />;
						})}
					</div>
				)}
			</Container>
		</article>
	);
}
