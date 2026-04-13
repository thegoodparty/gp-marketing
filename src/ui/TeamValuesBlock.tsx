import type { backgroundTypeValues } from './_lib/designTypesStore.ts';
import { cn, tv } from './_lib/utils.ts';

import { Anchor } from './Anchor.tsx';
import { CircleIcon } from './CircleIcon.tsx';
import { Container } from './Container.tsx';
import { FadeIn } from './FadeIn.tsx';
import { HeaderBlock, type HeaderBlockProps } from './HeaderBlock.tsx';
import { IconResolver, type IconType } from './IconResolver.tsx';
import { Text } from './Text.tsx';

const cardColors = ['waxflower', 'blue', 'lavender', 'halo-green', 'bright-yellow'] as const;
export type TeamValuesCardColor = (typeof cardColors)[number];

const blockStyles = tv({
	slots: {
		base: 'py-(--container-padding)',
		wrapper: 'flex flex-col gap-10',
		cardsContainer: 'flex gap-4 max-md:flex-col md:items-center',
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
		card: [
			'group/card relative rounded-3xl p-6 flex flex-col items-start',
			'gap-20 md:gap-40 flex-1',
			'transition-transform duration-normal ease-smooth hover:-translate-y-1',
		],
		top: 'flex flex-col gap-4 items-start',
		bottom: 'flex flex-col items-start w-full',
		arrowRow: 'flex items-center justify-end w-full',
	},
	variants: {
		color: {
			waxflower: { card: 'bg-waxflower-200' },
			blue: { card: 'bg-blue-200' },
			lavender: { card: 'bg-lavender-200' },
			'halo-green': { card: 'bg-halo-green-200' },
			'bright-yellow': { card: 'bg-bright-yellow-200' },
		},
	},
});

export type TeamValuesCardProps = {
	className?: string;
	color?: TeamValuesCardColor;
	heading?: string;
	href?: string;
	icon?: IconType;
};

export function TeamValuesCard(props: TeamValuesCardProps) {
	const color = props.color ?? 'waxflower';
	const { card, top, bottom, arrowRow } = cardStyles({ color });

	const content = (
		<>
			<div className={top()}>
				<CircleIcon icon={props.icon ?? 'heart-handshake'} iconBg='cream' />
				{props.heading && (
					<Text as='h3' styleType='heading-sm'>
						{props.heading}
					</Text>
				)}
			</div>
			<div className={bottom()}>
				<div className={arrowRow()}>
					<IconResolver icon='arrow-right' />
				</div>
			</div>
		</>
	);

	if (props.href) {
		return (
			<Anchor
				href={props.href}
				className={cn(
					card(),
					'before:content-[""] before:absolute before:inset-0 before:rounded-3xl',
					props.className,
				)}
			>
				{content}
			</Anchor>
		);
	}

	return (
		<div className={cn(card(), props.className)}>
			{content}
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
								<TeamValuesCard key={index} {...card} />
							))}
						</div>
					</FadeIn>
				</div>
			</Container>
		</article>
	);
}
