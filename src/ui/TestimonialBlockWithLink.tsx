'use client';

import { useMemo, useRef } from 'react';
import type { EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';

import { cn, tv } from './_lib/utils.ts';
import { colorTypeValues } from './_lib/designTypesStore.ts';
import { shuffleArray } from './_lib/shuffleArray.ts';
import { useRectTracker } from './_lib/useRectTracker';

import { Container } from './Container.tsx';
import { CarouselIndicator } from './CarouselIndicator.tsx';
import { HeaderBlock, type HeaderBlockProps } from './HeaderBlock.tsx';
import { NextButton, PrevButton, useDotButton, usePrevNextButtons } from './Carousel.tsx';
import { TestimonialStoryCard, type TestimonialStoryCardProps } from './TestimonialStoryCard.tsx';

const styles = tv({
	slots: {
		base: 'flex flex-col gap-[3rem] md:gap-[5rem] py-[calc(var(--container-padding))]',
		text: 'text-black',
	},
	variants: {
		backgroundColor: {
			midnight: { base: 'bg-midnight-900 text-white', text: 'text-white fill-white border-white/50' },
			cream: { base: 'bg-goodparty-cream text-midnight-900', text: 'text-midnight-900 fill-midnight-900 border-midnight-900/50' },
		},
	},
});

export type TestimonialBlockWithLinkProps = {
	backgroundColor?: 'cream' | 'midnight';
	cards: TestimonialStoryCardProps[];
	header?: HeaderBlockProps;
	options?: EmblaOptionsType;
};

export function TestimonialBlockWithLink(props: TestimonialBlockWithLinkProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', ...props.options });
	const { base, text } = styles({ backgroundColor });
	const dots = useDotButton(emblaApi);
	const nav = usePrevNextButtons(emblaApi);

	const containerRef = useRef<HTMLDivElement>(null);
	const rect = useRectTracker(containerRef);

	const cardsCount = props.cards?.length ?? 0;
	const colors = useMemo(() => {
		const colors = shuffleArray(colorTypeValues.filter(color => color !== 'inverse'));

		while (colors.length < cardsCount) {
			colors.push(...colors);
		}
		return colors;
	}, [cardsCount]);

	return (
		<div className={base()} data-component='TestimonialBlockWithLink'>
			<Container ref={containerRef} size='xl' className='flex flex-col md:flex-row gap-[2rem] justify-between'>
				{props.header && <HeaderBlock {...props.header} backgroundColor={backgroundColor} />}
				<div className={cn(text(), 'flex gap-4 items-end justify-end')}>
					<PrevButton onClick={() => nav.onPrevButtonClick()} disabled={nav.prevBtnDisabled} backgroundColor={backgroundColor} />
					<NextButton onClick={() => nav.onNextButtonClick()} disabled={nav.nextBtnDisabled} backgroundColor={backgroundColor} />
				</div>
			</Container>
			<div className='overflow-hidden max-w-full' ref={emblaRef}>
				<div className='flex touch-pan-y items-stretch gap-4 md:gap-8'>
					{props.cards.map((card, index) => (
						<div
							className='shrink-0 grow-0 basis-auto flex w-[min(38.0625rem,calc(100vw-3rem))] cursor-grab active:cursor-grabbing'
							key={`${index}-${card.copy?.slice(0, 10)}`}
							style={{
								marginLeft: index === 0 ? rect.computedStyle.paddingLeft + rect.computedStyle.marginLeft : 0,
								marginRight: index === props.cards.length - 1 ? rect.computedStyle.paddingRight + rect.computedStyle.marginRight : 0,
							}}
						>
							<TestimonialStoryCard {...card} color={card.color ?? (colors[index] as TestimonialStoryCardProps['color'])} />
						</div>
					))}
				</div>
			</div>
			<Container size='xl' className='flex gap-4 justify-center text-black'>
				{dots.scrollSnaps.map((_, index) => (
					<CarouselIndicator
						key={index}
						active={index === dots.selectedIndex}
						onClick={() => dots.onDotButtonClick(index)}
						color={backgroundColor}
					/>
				))}
			</Container>
		</div>
	);
}
