'use client';

import { useRef } from 'react';
import type { EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';

import { cn, tv } from './_lib/utils.ts';
import { useRectTracker } from './_lib/useRectTracker';

import { Container } from './Container.tsx';
import { CarouselIndicator } from './CarouselIndicator.tsx';
import { HeaderBlock, type HeaderBlockProps } from './HeaderBlock.tsx';
import { NextButton, PrevButton, useDotButton, usePrevNextButtons } from './Carousel.tsx';
import { LocationCard, type LocationCardProps } from './LocationCard.tsx';

const styles = tv({
	slots: {
		base: 'flex flex-col gap-[3rem] md:gap-[5rem] py-(--container-padding)',
		text: '',
		slide: 'flex shrink-0 grow-0 basis-auto w-[19.5rem] md:w-[25.375rem] cursor-grab active:cursor-grabbing',
	},
	variants: {
		backgroundColor: {
			midnight: {
				base: 'bg-midnight-900 text-white',
				text: 'text-white fill-white border-white/50',
			},
			cream: {
				base: 'bg-goodparty-cream text-midnight-900',
				text: 'text-midnight-900 fill-midnight-900 border-midnight-900/50',
			},
		},
	},
});

export type FeaturedCitiesBlockProps = {
	className?: string;
	backgroundColor?: 'cream' | 'midnight';
	header?: HeaderBlockProps;
	locationCards: LocationCardProps[];
	options?: EmblaOptionsType;
};

export function FeaturedCitiesBlock(props: FeaturedCitiesBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, text, slide } = styles({ backgroundColor });
	const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', ...props.options });
	const dots = useDotButton(emblaApi);
	const nav = usePrevNextButtons(emblaApi);

	const containerRef = useRef<HTMLDivElement>(null);
	const rect = useRectTracker(containerRef);

	if (!props.locationCards || props.locationCards.length === 0) {
		return null;
	}

	return (
		<article className={cn(base(), props.className)} data-component='FeaturedCitiesBlock'>
			<Container ref={containerRef} size='xl' className='flex flex-col md:flex-row gap-[2rem] justify-between'>
				{/* Left, not HeaderBlock's centred default: the design keeps the title
				    against the container edge with the arrows opposite it. */}
				{props.header && <HeaderBlock {...props.header} layout={props.header.layout ?? 'left'} backgroundColor={backgroundColor} />}
				<div className={cn(text(), 'flex gap-4 items-end justify-end')}>
					<PrevButton onClick={() => nav.onPrevButtonClick()} disabled={nav.prevBtnDisabled} backgroundColor={backgroundColor} />
					<NextButton onClick={() => nav.onNextButtonClick()} disabled={nav.nextBtnDisabled} backgroundColor={backgroundColor} />
				</div>
			</Container>
			<div className='overflow-hidden max-w-full' ref={emblaRef}>
				<ul className='flex touch-pan-y items-stretch gap-8'>
					{props.locationCards.map((card, index) => (
						<li
							className={slide()}
							key={`${card.cityName}-${card.stateAbbreviation}-${index}`}
							style={{
								marginLeft: index === 0 ? rect.computedStyle.paddingLeft + rect.computedStyle.marginLeft : 0,
								marginRight:
									index === props.locationCards.length - 1
										? rect.computedStyle.paddingRight + rect.computedStyle.marginRight
										: 0,
							}}
						>
							<LocationCard {...card} className='w-full' />
						</li>
					))}
				</ul>
			</div>
			{/* Pagination is mobile-only in the design; desktop navigates with the arrows. */}
			<Container size='xl' className='flex gap-4 justify-center md:hidden'>
				{dots.scrollSnaps.map((_, index) => (
					<CarouselIndicator
						key={index}
						active={index === dots.selectedIndex}
						onClick={() => dots.onDotButtonClick(index)}
						color={backgroundColor}
					/>
				))}
			</Container>
		</article>
	);
}
