'use client';

import type { ReactNode } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

import { cn, tv } from './_lib/utils.ts';
import { Avatar } from './Avatar.tsx';
import { Container } from './Container.tsx';
import { Text } from './Text.tsx';
import { Media } from './Media.tsx';
import { IconResolver } from './IconResolver.tsx';
import { ElectionsNearYouSearch } from './ElectionsNearYouSearch.tsx';
import { useDotButton, usePrevNextButtons } from './Carousel.tsx';
import type { AuthorProps } from './Author.tsx';
import type { SanityImage } from './types.ts';
import { Logo } from '~/sanity/utils/Logo.tsx';

const styles = tv({
	slots: {
		base: 'relative',
		// Figma 2035:1471: 60px of vertical padding around a 524px photo at 1440,
		// 24px around the stacked mobile frame (2035:2402).
		grid: 'flex flex-col gap-[5.5rem] py-6 lg:grid lg:grid-cols-[minmax(0,33.75rem)_1fr] lg:items-center lg:gap-x-10 lg:py-[3.75rem]',
		content: 'flex flex-col gap-6 lg:gap-10',
		textContainer: 'flex flex-col gap-3 md:gap-4',
		// The slide keeps room for the quote card's overhang inside the clipped
		// viewport: 108px to the left of the photo at desktop, 82px below it on
		// mobile. 39.5rem is the 524px photo plus that left overhang.
		carousel: 'w-full lg:ml-auto lg:max-w-[39.5rem]',
		// The viewport clips so neighbouring slides stay hidden, but a plain clip
		// cut the photo's and quote card's shadows in a straight line, and Chrome
		// paints `overflow: clip` with a clip margin as a pale box over the page.
		// So the clip stays `hidden` and the box is widened instead: padding on the
		// left, right and bottom makes room for the shadows (the card's reaches
		// 63px), with matching negative margins so nothing else moves. Each slide
		// carries 5.75rem of empty padding on its left (the track pulls the first
		// one back by that amount): the 4.5rem the viewport reveals plus the 20px
		// the previous photo's shadow reaches into the gap, so the extra room only
		// ever shows empty gap, never a neighbouring slide or its shadow. The right
		// side only takes the page gutter.
		viewport: 'overflow-hidden -mb-[4.5rem] -ml-[4.5rem] -mr-4 pb-[4.5rem] pl-[4.5rem] pr-4 lg:-mr-5 lg:pr-5',
		track: '-ml-[5.75rem] flex touch-pan-y',
		slide: 'relative min-w-0 flex-[0_0_100%] pb-[5.125rem] pl-[5.75rem] lg:pb-0 lg:pl-[12.5rem]',
		photo: 'relative aspect-square w-full overflow-hidden rounded-3xl shadow-xl-duo [&>div]:h-full [&>div]:w-full',
		quoteCard: [
			'absolute bottom-0 left-[6.75rem] right-4 flex flex-col gap-4 rounded-lg bg-bright-yellow-100 p-5 text-black shadow-2xl',
			'lg:bottom-5 lg:left-[5.75rem] lg:right-auto lg:w-[19.25rem]',
		],
		quoteText: 'font-secondary text-[0.875rem] leading-5',
		quoteAuthor: 'flex items-center gap-4',
		quoteAvatar: 'relative shrink-0',
		quoteName: 'font-secondary text-[1rem] font-bold leading-6',
		quoteMeta: 'font-secondary text-[0.875rem] leading-5',
		footer: 'mt-6 grid grid-cols-[1fr_auto_1fr] items-start lg:mt-4 lg:pl-[6.75rem]',
		dots: 'col-start-2 flex items-center gap-2',
		dot: 'size-2 rounded-full transition-opacity duration-fast ease-smooth',
		arrows: 'col-start-3 hidden justify-end gap-[0.6875rem] lg:flex',
		arrow: 'flex size-12 items-center justify-center rounded-full border disabled:cursor-not-allowed disabled:opacity-50',
	},
	variants: {
		backgroundColor: {
			cream: {
				base: 'bg-goodparty-cream text-black',
				dot: 'bg-black',
				arrow: 'border-black text-black',
			},
			midnight: {
				base: 'bg-midnight-900 text-white',
				dot: 'bg-white',
				arrow: 'border-white text-white',
			},
		},
	},
});

export type ElectionsSearchHeroSlide = {
	_key?: string;
	image: SanityImage;
	quote?: string;
	author?: AuthorProps;
};

export type ElectionsSearchHeroProps = {
	className?: string;
	headerText?: string;
	bodyCopy?: ReactNode;
	buttonLabel?: string;
	backgroundColor?: 'cream' | 'midnight';
	slides?: ElectionsSearchHeroSlide[];
};

// Sent with the shared search's analytics events so this hero can be told
// apart from the Near You block when both sit on one page.
const HERO_PLACEMENT = 'elections_search_hero';

export function ElectionsSearchHero(props: ElectionsSearchHeroProps) {
	// The live document predates the redesign and was saved as midnight, so the
	// fallback matches what it renders as until an editor switches it.
	const backgroundColor = props.backgroundColor ?? 'midnight';
	const slides = props.slides ?? [];
	const hasSlides = slides.length > 0;

	const {
		base,
		grid,
		content,
		textContainer,
		carousel,
		viewport,
		track,
		slide,
		photo,
		quoteCard,
		quoteText,
		quoteAuthor,
		quoteAvatar,
		quoteName,
		quoteMeta,
		footer,
		dots,
		dot,
		arrows,
		arrow,
	} = styles({ backgroundColor });

	const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start' }, []);
	const dotNav = useDotButton(emblaApi);
	const arrowNav = usePrevNextButtons(emblaApi);

	return (
		<article className={cn(base(), props.className)} data-component='ElectionsSearchHero'>
			<Container size='xl'>
				<div className={cn(grid(), !hasSlides && 'lg:grid-cols-1')}>
					<div className={content()}>
						<div className={textContainer()}>
							{props.headerText && (
								<Text as='h1' styleType='heading-xl'>
									{props.headerText}
								</Text>
							)}
							{props.bodyCopy && <Text styleType='body-1'>{props.bodyCopy}</Text>}
						</div>
						<ElectionsNearYouSearch
							parent='ElectionsSearchHero'
							placement={HERO_PLACEMENT}
							buttonLabel={props.buttonLabel}
							layout='fluid'
							appearance='field'
						/>
					</div>
					{hasSlides && (
						<div className={carousel()} data-component='ElectionsSearchHeroCarousel'>
							<div className={viewport()} ref={emblaRef}>
								<div className={track()}>
									{slides.map((item, index) => (
										<div key={item._key ?? index} className={slide()} aria-roledescription='slide' aria-label={`${index + 1} of ${slides.length}`}>
											<div className={photo()}>
												<Media image={item.image} objectFit='cover' priority={index === 0} />
											</div>
											{(item.quote || item.author) && (
												<figure className={quoteCard()}>
													{item.quote && <blockquote className={quoteText()}>&ldquo;{item.quote}&rdquo;</blockquote>}
													{item.author && (
														<figcaption className={quoteAuthor()}>
															{item.author.image && (
																<div className={quoteAvatar()}>
																	<Avatar image={item.author.image} size='sm' />
																	<Logo width={20} height={15} className='absolute -bottom-px -right-px' aria-hidden='true' />
																</div>
															)}
															<div className='flex flex-col gap-1'>
																<span className={quoteName()}>{item.author.name}</span>
																{item.author.meta?.[0] && <span className={quoteMeta()}>{item.author.meta[0]}</span>}
															</div>
														</figcaption>
													)}
												</figure>
											)}
										</div>
									))}
								</div>
							</div>
							{slides.length > 1 && (
								<div className={footer()}>
									<div className={dots()} role='tablist' aria-label='Choose a slide'>
										{slides.map((_, index) => (
											<button
												key={index}
												type='button'
												role='tab'
												aria-selected={index === dotNav.selectedIndex}
												aria-label={`Go to slide ${index + 1}`}
												onClick={() => dotNav.onDotButtonClick(index)}
												className={cn(dot(), index !== dotNav.selectedIndex && 'opacity-30')}
											/>
										))}
									</div>
									<div className={arrows()}>
										<button
											type='button'
											aria-label='Previous slide'
											onClick={() => arrowNav.onPrevButtonClick()}
											disabled={arrowNav.prevBtnDisabled}
											className={arrow()}
										>
											<IconResolver icon='arrow-left' />
										</button>
										<button
											type='button'
											aria-label='Next slide'
											onClick={() => arrowNav.onNextButtonClick()}
											disabled={arrowNav.nextBtnDisabled}
											className={arrow()}
										>
											<IconResolver icon='arrow-right' />
										</button>
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</Container>
		</article>
	);
}
