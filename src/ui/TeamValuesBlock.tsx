import type { backgroundTypeValues } from './_lib/designTypesStore.ts';
import { cn, tv } from './_lib/utils.ts';
import { useState } from 'react';

import { CircleIcon } from './CircleIcon.tsx';
import { Container } from './Container.tsx';
import { FadeIn } from './FadeIn.tsx';
import { HeaderBlock, type HeaderBlockProps } from './HeaderBlock.tsx';
import { type IconType } from './IconResolver.tsx';
import { Text } from './Text.tsx';

export type TeamValuesCardColor = 'waxflower' | 'blue' | 'lavender' | 'halo-green' | 'bright-yellow';

const blockStyles = tv({
	slots: {
		base: 'py-(--container-padding)',
		wrapper: 'flex flex-col gap-10',
		cardsContainer: 'grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 items-stretch',
	},
	variants: {
		backgroundColor: {
			cream: { base: 'bg-goodparty-cream' },
			midnight: { base: 'bg-midnight-900 text-white' },
			white: { base: 'bg-white' },
		},
	},
});

const cardStyles = tv({
	slots: {
		cardButton: [
			'group/card relative w-full h-full rounded-3xl text-left cursor-pointer',
			'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-midnight-900 focus-visible:ring-offset-4',
		],
		cardInner: [
			'relative rounded-3xl p-6 h-full',
			'transition-transform duration-normal ease-smooth hover:-translate-y-1',
			'min-h-64',
		],
		face: [
			'absolute inset-0 rounded-3xl p-6 flex flex-col items-start',
		],
		frontFace: 'justify-between',
		backFace: 'justify-center',
		top: 'flex flex-col gap-4 items-start',
	},
	variants: {
		color: {
			waxflower: { face: 'bg-waxflower-200' },
			blue: { face: 'bg-blue-200' },
			lavender: { face: 'bg-lavender-200' },
			'halo-green': { face: 'bg-halo-green-200' },
			'bright-yellow': { face: 'bg-bright-yellow-200' },
		},
	},
});

export type TeamValuesCardProps = {
	backCopy?: string;
	className?: string;
	color?: TeamValuesCardColor;
	heading?: string;
	icon?: IconType;
	isFlipped?: boolean;
	onToggle?(): void;
};

export function TeamValuesCard(props: TeamValuesCardProps) {
	const color = props.color ?? 'waxflower';
	const { cardButton, cardInner, face, frontFace, backFace, top } = cardStyles({ color });
	const isFlipped = props.isFlipped ?? false;
	const ariaLabel = props.heading
		? `${isFlipped ? 'Hide' : 'Show'} ${props.heading} details`
		: isFlipped
			? 'Hide details'
			: 'Show details';

	return (
		<div className={cn('w-full [perspective:1200px]', props.className)}>
			<button
				type='button'
				className={cardButton()}
				onClick={() => props.onToggle?.()}
				aria-pressed={isFlipped}
				aria-label={ariaLabel}
			>
				<div
					className={cardInner()}
					style={{
						transformStyle: 'preserve-3d',
						transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
					}}
				>
					<div
						className={cn(face(), frontFace())}
						style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
					>
						<div className={top()}>
							<CircleIcon icon={props.icon ?? 'heart-handshake'} iconBg='cream' />
							{props.heading && (
								// Keep value names whole and on one line; adjust grid min width before allowing wrap fallback.
								<Text as='h3' styleType='heading-sm' className='whitespace-nowrap break-normal'>
									{props.heading}
								</Text>
							)}
						</div>
					</div>
					<div
						className={cn(face(), backFace())}
						style={{
							backfaceVisibility: 'hidden',
							WebkitBackfaceVisibility: 'hidden',
							transform: 'rotateY(180deg)',
						}}
					>
						<Text as='p' styleType='body-2'>
							{props.backCopy ?? props.heading ?? ''}
						</Text>
					</div>
				</div>
			</button>
		</div>
	);
}

export type TeamValuesBlockProps = {
	backgroundColor?: (typeof backgroundTypeValues)[number];
	className?: string;
	header: HeaderBlockProps;
	cards: TeamValuesCardProps[];
};

export function TeamValuesBlock(props: TeamValuesBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, wrapper, cardsContainer } = blockStyles({ backgroundColor });
	const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);

	return (
		<article className={cn(base(), props.className)} data-component='TeamValuesBlock'>
			<Container size='xl'>
				<div className={wrapper()}>
					<FadeIn delay={0}>
						<HeaderBlock {...props.header} backgroundColor={backgroundColor} layout='left' />
					</FadeIn>
					<FadeIn delay={0.1}>
						<div className={cardsContainer()}>
							{props.cards.map((card, index) => (
								<TeamValuesCard
									key={index}
									{...card}
									isFlipped={activeCardIndex === index}
									onToggle={() => setActiveCardIndex(current => (current === index ? null : index))}
								/>
							))}
						</div>
					</FadeIn>
				</div>
			</Container>
		</article>
	);
}
