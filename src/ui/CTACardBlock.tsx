import { cn, tv } from './_lib/utils.ts';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';

import { CTACard, type CTACardProps } from './CTACard.tsx';
import { Container } from './Container.tsx';

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
	},
	variants: {
		backgroundColor: {
			midnight: {
				base: 'bg-midnight-900',
			},
			cream: {
				base: 'bg-goodparty-cream',
			},
		},
	},
});

export type CTACardBlockProps = {
	backgroundColor?: (typeof backgroundTypeValues)[number];
	card1: CTACardProps;
	card2: CTACardProps;
	className?: string;
};

export function CTACardBlock(props: CTACardBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base } = styles({ backgroundColor });

	return (
		<article className={cn(base(), props.className)} data-component='CTACardBlock'>
			<Container className='flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-10' size='xl'>
				<CTACard {...props.card1} color={props.card1.color} />
				<CTACard {...props.card2} color={props.card2.color} />
			</Container>
		</article>
	);
}
