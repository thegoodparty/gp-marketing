import { cn, tv } from './_lib/utils.ts';
import { Container } from './Container.tsx';
import { HeaderBlock, type HeaderBlockProps } from './HeaderBlock.tsx';
import { FactsCard, type FactsCardProps } from './FactsCard.tsx';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		wrapper: 'flex flex-col gap-12 md:gap-16',
		grid: 'grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3',
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

export type LocationFactsBlockProps = {
	className?: string;
	backgroundColor?: (typeof backgroundTypeValues)[number];
	header?: HeaderBlockProps;
	factsCards: FactsCardProps[];
};

export function LocationFactsBlock(props: LocationFactsBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, wrapper, grid } = styles({ backgroundColor });

	if (!props.factsCards || props.factsCards.length === 0) {
		return null;
	}

	return (
		<article className={cn(base(), props.className)} data-component='LocationFactsBlock'>
			<Container size='xl'>
				<div className={wrapper()}>
					{props.header && <HeaderBlock {...props.header} backgroundColor={backgroundColor} />}
					<ul className={grid()}>
						{props.factsCards.map((card, index) => (
							<li key={`facts-card-${index}`}>
								<FactsCard {...card} />
							</li>
						))}
					</ul>
				</div>
			</Container>
		</article>
	);
}
