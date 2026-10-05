'use client';

import { type ReactNode, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

import { cn, tv } from './_lib/utils.ts';
import { useRectTracker } from './_lib/useRectTracker';

import { NextButton, PrevButton, useDotButton, usePrevNextButtons } from './Carousel.tsx';
import { CarouselIndicator } from './CarouselIndicator.tsx';
import { Container } from './Container.tsx';
import { FeaturedCandidateCard, type FeaturedCandidateCardProps } from './FeaturedCandidateCard.tsx';
import { Text } from './Text.tsx';
import { Logo } from '~/sanity/utils/Logo.tsx';

const styles = tv({
	slots: {
		base: 'flex flex-col gap-12 py-(--container-padding) md:gap-20',
		header: 'flex flex-col gap-6',
		headingRow: 'flex items-end justify-between gap-8',
		// Figma: 48px on desktop, 32px on mobile; heading-lg ramps 40 → 48, so the phone end is pulled down.
		heading: 'text-black max-md:text-heading-md',
		arrows: 'hidden shrink-0 items-end gap-4 text-midnight-900 fill-midnight-900 border-midnight-900/50 md:flex',
		// Figma: midnight/50 fill, midnight/200 hairline, 12px radius, 956 max width.
		callout: 'flex max-w-[59.75rem] items-start gap-3 rounded-md border border-midnight-200 bg-midnight-50 px-4 py-3.5 text-black',
		calloutIcon: 'mt-px h-8 w-[2.3333rem] shrink-0',
		calloutText: 'text-black [&_a]:text-info-500 [&_a]:underline',
		viewport: 'max-w-full overflow-hidden',
		// Figma: 32px between cards on the phone frame, 16px on the desktop frame.
		track: 'flex touch-pan-y items-stretch gap-8 md:gap-4',
		slide: 'flex shrink-0 grow-0 basis-auto cursor-grab active:cursor-grabbing',
		dots: 'flex justify-center gap-4 md:hidden',
	},
	variants: {
		backgroundColor: {
			cream: { base: 'bg-goodparty-cream' },
			midnight: {
				base: 'bg-midnight-900',
				heading: 'text-white',
				arrows: 'text-white fill-white border-white/50',
			},
		},
	},
});

export type FeaturedCandidatesBlockProps = {
	className?: string;
	backgroundColor?: 'cream' | 'midnight';
	heading?: string;
	/** The pledge callout's copy. Nothing here means no callout box at all. */
	callout?: ReactNode;
	/** Already ranked and capped by the page (see `selectFeaturedPeople`). */
	people: Array<FeaturedCandidateCardProps & { key?: string }>;
};

/**
 * Renders nothing without people. On a page whose route does not feed the
 * block (today: everything but the location pages) an empty carousel would
 * otherwise publish a heading over nothing, which no boundary catches.
 */
export function FeaturedCandidatesBlock(props: FeaturedCandidatesBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, header, headingRow, heading, arrows, callout, calloutIcon, calloutText, viewport, track, slide, dots } = styles({
		backgroundColor,
	});
	const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start' });
	const nav = usePrevNextButtons(emblaApi);
	const pagination = useDotButton(emblaApi);

	const containerRef = useRef<HTMLDivElement>(null);
	const rect = useRectTracker(containerRef);

	if (props.people.length === 0) return null;

	return (
		<article className={cn(base(), props.className)} data-component='FeaturedCandidatesBlock'>
			<Container ref={containerRef} size='xl' className={header()}>
				<div className={headingRow()}>
					<Text as='h2' styleType='heading-lg' className={heading()}>
						{props.heading || 'Featured candidates and representatives'}
					</Text>
					<div className={arrows()}>
						<PrevButton onClick={() => nav.onPrevButtonClick()} disabled={nav.prevBtnDisabled} backgroundColor={backgroundColor} aria-label='Previous' />
						<NextButton onClick={() => nav.onNextButtonClick()} disabled={nav.nextBtnDisabled} backgroundColor={backgroundColor} aria-label='Next' />
					</div>
				</div>
				{props.callout && (
					<div className={callout()} data-component='FeaturedCandidatesCallout'>
						<Logo className={calloutIcon()} aria-hidden='true' />
						<Text as='div' styleType='body-2' className={calloutText()}>
							{props.callout}
						</Text>
					</div>
				)}
			</Container>
			<div className={viewport()} ref={emblaRef}>
				<div className={track()}>
					{props.people.map(({ key, ...person }, index) => (
						<div
							key={key ?? person.href}
							className={slide()}
							style={{
								marginLeft: index === 0 ? rect.computedStyle.paddingLeft + rect.computedStyle.marginLeft : 0,
								marginRight: index === props.people.length - 1 ? rect.computedStyle.paddingRight + rect.computedStyle.marginRight : 0,
							}}
						>
							<FeaturedCandidateCard {...person} />
						</div>
					))}
				</div>
			</div>
			{pagination.scrollSnaps.length > 1 && (
				<Container size='xl' className={dots()}>
					{pagination.scrollSnaps.map((_, index) => (
						<CarouselIndicator
							key={index}
							active={index === pagination.selectedIndex}
							onClick={() => pagination.onDotButtonClick(index)}
							color={backgroundColor}
						/>
					))}
				</Container>
			)}
		</article>
	);
}
