import { cn, tv } from './_lib/utils.ts';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';

import type { SanityImage } from './types.ts';
import { Container } from './Container.tsx';
import { Media } from './Media.tsx';
import { Testimonial, type TestimonialProps } from './Testimonial.tsx';
import { TwoUpCard, type TwoUpCardProps } from './TwoUpCard.tsx';

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

export type TwoUpCardBlockCardProps =
	| ({ type: 'value-prop' } & TwoUpCardProps)
	| ({ type: 'testimonial' } & TestimonialProps)
	| { type: 'image'; image: SanityImage; showFullImage?: boolean };

export type TwoUpCardBlockProps = {
	backgroundColor?: (typeof backgroundTypeValues)[number];
	card1?: TwoUpCardBlockCardProps;
	card2?: TwoUpCardBlockCardProps;
	className?: string;
};

export function TwoUpCardBlock(props: TwoUpCardBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base } = styles({ backgroundColor });

	const renderCard = (card: TwoUpCardBlockCardProps) => {
		switch (card.type) {
			case 'value-prop':
				return <TwoUpCard {...card} backgroundColor={backgroundColor} />;
			case 'testimonial':
				return <Testimonial {...card} color='white' quoteStyleType='text-3xl' />;
			case 'image':
				return <Media className='rounded-lg overflow-hidden' image={card.image} objectFit={card.showFullImage ? 'contain' : 'cover'} />;
			default:
				return null;
		}
	};

	return (
		<article className={cn(base(), props.className)} data-component='TwoUpCardBlock'>
			<Container
				className={`flex flex-col gap-6 md:grid ${props.card1?.type && props.card2?.type ? 'md:grid-cols-2' : '*:w-1/2 *:mx-auto'} md:gap-10`}
				size='xl'
			>
				{props.card1 && renderCard(props.card1)}
				{props.card2 && renderCard(props.card2)}
			</Container>
		</article>
	);
}
