import { cn, tv } from './_lib/utils.ts';
import { Container } from './Container.tsx';
import { HeaderBlock, type HeaderBlockProps } from './HeaderBlock.tsx';
import { LocationCard, type LocationCardProps } from './LocationCard.tsx';
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

export type FeaturedCitiesBlockProps = {
	className?: string;
	backgroundColor?: (typeof backgroundTypeValues)[number];
	header?: HeaderBlockProps;
	locationCards: LocationCardProps[];
};

export function FeaturedCitiesBlock(props: FeaturedCitiesBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, wrapper, grid } = styles({ backgroundColor });

	if (!props.locationCards || props.locationCards.length === 0) {
		return null;
	}

	return (
		<article className={cn(base(), props.className)} data-component='FeaturedCitiesBlock'>
			<Container size='xl'>
				<div className={wrapper()}>
					{props.header && <HeaderBlock {...props.header} backgroundColor={backgroundColor} />}
					<ul className={grid()}>
						{props.locationCards.map((card, index) => (
							<li key={`location-card-${index}`}>
								<LocationCard {...card} />
							</li>
						))}
					</ul>
				</div>
			</Container>
		</article>
	);
}
