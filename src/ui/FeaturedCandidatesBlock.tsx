'use client';

import { type ReactNode, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

import { cn, tv } from './_lib/utils.ts';
import { useCarouselPageTracking } from './_lib/useCarouselPageTracking.ts';
import { useRectTracker } from './_lib/useRectTracker';

import { NextButton, PrevButton, useDotButton, usePrevNextButtons } from './Carousel.tsx';
import { CarouselIndicator } from './CarouselIndicator.tsx';
import { Container } from './Container.tsx';
import { FeaturedCandidateCard, type FeaturedCandidateCardProps } from './FeaturedCandidateCard.tsx';
import { IconResolver } from './IconResolver.tsx';
import { PledgeModal } from './PledgeModal.tsx';
import { Text } from './Text.tsx';
import { Logo } from '~/sanity/utils/Logo.tsx';

const styles = tv({
	slots: {
		base: 'flex flex-col gap-12 py-(--container-padding) md:gap-20',
		// Figma: the heading column and the arrows share a row with their bottoms
		// aligned, and the callout sits under the heading column only.
		header: 'grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-x-16',
		intro: 'flex flex-col gap-3 md:gap-4',
		// Figma: 48px on desktop, 32px on mobile; heading-lg ramps 40 → 48, so the phone end is pulled down.
		heading: 'text-black max-md:text-heading-md',
		bodyCopy: 'text-black',
		arrows: 'hidden shrink-0 items-end gap-4 text-midnight-900 fill-midnight-900 border-midnight-900/50 md:flex',
		// Figma: midnight/50 fill, midnight/200 hairline, 12px radius. From md the
		// heart gets a 117px column with a divider; on the phone it stacks on top.
		callout:
			'flex flex-col gap-3 rounded-md border border-midnight-200 bg-midnight-50 p-4 text-black md:col-start-1 md:flex-row md:gap-0 md:p-0',
		calloutIconCell: 'flex shrink-0 items-start md:w-[7.3125rem] md:items-center md:justify-center md:border-r md:border-midnight-200',
		calloutIcon: 'h-12 w-14 shrink-0 md:h-[3.6875rem] md:w-[4.5rem]',
		calloutBody: 'flex min-w-0 flex-col gap-1 md:px-8 md:py-[1.1875rem]',
		// Figma: Outfit 20/28 and Open Sans 16/24 on both frames, which no ramping token gives.
		calloutTitle: 'font-primary text-[1.25rem]/[1.75rem] font-semibold text-black',
		calloutText: 'font-secondary text-[1rem]/[1.5rem] text-black [&_a]:text-info-500 [&_a]:underline md:[&_p]:inline',
		calloutLink:
			'flex w-fit items-center gap-1 font-secondary text-[1rem]/[1.5rem] font-semibold text-info-500 underline max-md:mt-1 md:ml-1 md:inline-flex',
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
				bodyCopy: 'text-white',
				arrows: 'text-white fill-white border-white/50',
			},
		},
	},
});

export type FeaturedCandidatesCalloutProps = {
	/** Defaults to "What this symbol means". */
	title?: string;
	body: ReactNode;
	/** The link at the end of the copy that opens the pledge pop-up. Nothing here means no link. */
	pledgeLinkLabel?: string;
};

export type FeaturedCandidatesBlockProps = {
	className?: string;
	backgroundColor?: 'cream' | 'midnight';
	heading?: string;
	/** The paragraph under the heading. Nothing here means no paragraph. */
	bodyCopy?: string;
	/** The badge explainer. Nothing here means no callout box at all. */
	callout?: FeaturedCandidatesCalloutProps;
	/** Already filtered to pledged people, ranked and capped by the page (see `selectFeaturedPeople`). */
	people: Array<FeaturedCandidateCardProps & { key?: string }>;
};

/**
 * Renders nothing without people. On a page whose route does not feed the
 * block (today: everything but the location pages) an empty carousel would
 * otherwise publish a heading over nothing, which no boundary catches.
 */
export function FeaturedCandidatesBlock(props: FeaturedCandidatesBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const {
		base,
		header,
		intro,
		heading,
		bodyCopy,
		arrows,
		callout,
		calloutIconCell,
		calloutIcon,
		calloutBody,
		calloutTitle,
		calloutText,
		calloutLink,
		viewport,
		track,
		slide,
		dots,
	} = styles({ backgroundColor });
	const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start' });
	const nav = usePrevNextButtons(emblaApi);
	const pagination = useDotButton(emblaApi);
	useCarouselPageTracking(emblaApi, 'featured_candidates');

	const containerRef = useRef<HTMLDivElement>(null);
	const rect = useRectTracker(containerRef);

	if (props.people.length === 0) return null;

	return (
		<article className={cn(base(), props.className)} data-component='FeaturedCandidatesBlock'>
			<Container ref={containerRef} size='xl' className={header()}>
				<div className={intro()}>
					<Text as='h2' styleType='heading-lg' className={heading()}>
						{props.heading || 'Candidates and officials who took the GoodParty.org Pledge'}
					</Text>
					{props.bodyCopy && (
						<Text as='p' styleType='body-large' className={bodyCopy()}>
							{props.bodyCopy}
						</Text>
					)}
				</div>
				<div className={arrows()}>
					<PrevButton onClick={() => nav.onPrevButtonClick()} disabled={nav.prevBtnDisabled} backgroundColor={backgroundColor} aria-label='Previous' />
					<NextButton onClick={() => nav.onNextButtonClick()} disabled={nav.nextBtnDisabled} backgroundColor={backgroundColor} aria-label='Next' />
				</div>
				{props.callout && (
					<div className={callout()} data-component='FeaturedCandidatesCallout'>
						<div className={calloutIconCell()}>
							<Logo className={calloutIcon()} aria-hidden='true' />
						</div>
						<div className={calloutBody()}>
							<h3 className={calloutTitle()}>{props.callout.title || 'What this symbol means'}</h3>
							<div className={calloutText()}>
								{props.callout.body}
								{props.callout.pledgeLinkLabel && (
									<PledgeModal source='featured_candidates'>
										<button type='button' className={calloutLink()}>
											{props.callout.pledgeLinkLabel}
											<IconResolver icon='arrow-up-right' className='min-w-4 min-h-4 w-4 h-4 max-w-4 max-h-4' />
										</button>
									</PledgeModal>
								)}
							</div>
						</div>
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
							<FeaturedCandidateCard {...person} position={index} />
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
