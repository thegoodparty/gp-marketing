'use client';
import { type ComponentPropsWithRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { Container } from '~/ui/Container';
import { useRectTracker } from '~/ui/_lib/useRectTracker';
import { HeaderBlock, type HeaderBlockProps } from '~/ui/HeaderBlock';
import { shuffleArray } from '~/ui/_lib/shuffleArray.ts';
import { tv } from 'tailwind-variants';
import { colorTypeValues } from '~/ui/_lib/designTypesStore';
import { TestimonialImageCard, type TestimonialImageCardProps } from '~/ui/TestimonialImageCard';
import { TestimonialCard, type TestimonialCardProps } from '~/ui/TestimonialCard';
import { IconResolver } from '~/ui/IconResolver';
import { cn } from '~/ui/_lib/utils';
import { CarouselIndicator } from '~/ui/CarouselIndicator';

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

export type CarouselProps = {
	header?: HeaderBlockProps;
	backgroundColor?: 'cream' | 'midnight';
	/** Use 'card' for TestimonialCard (Logo + quote), 'image' for TestimonialImageCard (photo + quote). Default: 'image'. */
	cardVariant?: 'image' | 'card';
	cards: TestimonialImageCardProps[] | TestimonialCardProps[];
	options?: EmblaOptionsType;
};

export function Carousel(props: CarouselProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const cardVariant = props.cardVariant ?? 'image';
	const [emblaRef, emblaApi] = useEmblaCarousel({
		align: 'start',
	});
	const { base, text } = styles({ backgroundColor });
	const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi);
	const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi);

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
		<div className={base()}>
			<Container ref={containerRef} size='xl' className='flex flex-col md:flex-row gap-[2rem] justify-between'>
				{props.header && <HeaderBlock {...props.header} backgroundColor={backgroundColor} />}
				<div className={cn(text(), 'flex gap-4 items-end justify-end')}>
					<PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} backgroundColor={backgroundColor} />
					<NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} backgroundColor={backgroundColor} />
				</div>
			</Container>
			<div className='embla max-w-full'>
				<div className='embla__viewport' ref={emblaRef}>
					<div className='embla__container'>
						{props.cards.map((card, index) => (
							<div
								className={`embla__slide cursor-grab active:cursor-grabbing`}
								key={`carousel-card-${index}-${card.copy?.toString().slice(0, 10)}`}
								style={{
									marginLeft: index === 0 ? rect.computedStyle.paddingLeft + rect.computedStyle.marginLeft : 0,
									marginRight: index === props.cards.length - 1 ? rect.computedStyle.paddingRight + rect.computedStyle.marginRight : 0,
								}}
							>
								<div className='embla__slide__number h-full'>
									{cardVariant === 'card' ? (
										<TestimonialCard
											{...(card as TestimonialCardProps)}
											color={colors[index] as TestimonialCardProps['color']}
											quoteStyleType={(card as TestimonialCardProps).quoteStyleType ?? 'text-lg'}
											className='text-black'
										/>
									) : (
										<TestimonialImageCard {...(card as TestimonialImageCardProps)} color={colors[index]} className='text-black' />
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
			<Container size='xl' className='flex gap-4 justify-center text-black'>
				{scrollSnaps.map((_, index) => (
					<CarouselIndicator key={index} active={index === selectedIndex} onClick={() => onDotButtonClick(index)} color={backgroundColor} />
				))}
			</Container>
		</div>
	);
}

type UseDotButtonType = {
	selectedIndex: number;
	scrollSnaps: number[];
	onDotButtonClick: (index: number) => void;
};

export const useDotButton = (emblaApi: EmblaCarouselType | undefined): UseDotButtonType => {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

	const onDotButtonClick = useCallback(
		(index: number) => {
			if (!emblaApi) return;
			emblaApi.scrollTo(index);
		},
		[emblaApi],
	);

	const onInit = useCallback((emblaApi: EmblaCarouselType) => {
		setScrollSnaps(emblaApi.scrollSnapList());
	}, []);

	const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
		setSelectedIndex(emblaApi.selectedScrollSnap());
	}, []);

	useEffect(() => {
		if (!emblaApi) return;

		onInit(emblaApi);
		onSelect(emblaApi);
		emblaApi.on('reInit', onInit).on('reInit', onSelect).on('select', onSelect);
	}, [emblaApi, onInit, onSelect]);

	return {
		selectedIndex,
		scrollSnaps,
		onDotButtonClick,
	};
};

type PropType = ComponentPropsWithRef<'button'>;

type UsePrevNextButtonsType = {
	prevBtnDisabled: boolean;
	nextBtnDisabled: boolean;
	onPrevButtonClick: () => void;
	onNextButtonClick: () => void;
};

export const usePrevNextButtons = (emblaApi: EmblaCarouselType | undefined): UsePrevNextButtonsType => {
	const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
	const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

	const onPrevButtonClick = useCallback(() => {
		if (!emblaApi) return;
		emblaApi.scrollPrev();
	}, [emblaApi]);

	const onNextButtonClick = useCallback(() => {
		if (!emblaApi) return;
		emblaApi.scrollNext();
	}, [emblaApi]);

	const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
		setPrevBtnDisabled(!emblaApi.canScrollPrev());
		setNextBtnDisabled(!emblaApi.canScrollNext());
	}, []);

	useEffect(() => {
		if (!emblaApi) return;

		onSelect(emblaApi);
		emblaApi.on('reInit', onSelect).on('select', onSelect);
	}, [emblaApi, onSelect]);

	return {
		prevBtnDisabled,
		nextBtnDisabled,
		onPrevButtonClick,
		onNextButtonClick,
	};
};

export const PrevButton: React.FC<PropType & { backgroundColor: 'cream' | 'midnight' }> = ({ backgroundColor, ...props }) => {
	const { text } = styles({ backgroundColor: backgroundColor });
	return (
		<button
			className={cn(
				text(),
				'border rounded-full w-[4.5rem] h-[4.5rem] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed',
			)}
			type='button'
			{...props}
		>
			<IconResolver icon='arrow-left' />
		</button>
	);
};

export const NextButton: React.FC<PropType & { backgroundColor: 'cream' | 'midnight' }> = ({ backgroundColor, ...props }) => {
	const { text } = styles({ backgroundColor: backgroundColor });
	return (
		<button
			className={cn(
				text(),
				'border rounded-full w-[4.5rem] h-[4.5rem] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed',
			)}
			type='button'
			{...props}
		>
			<IconResolver icon='arrow-right' />
		</button>
	);
};
