'use client';

import { useMemo } from 'react';
import { tv } from './_lib/utils';
import { Container } from './Container';
import { HeaderBlock, type HeaderBlockProps } from './HeaderBlock';
import { TestimonialCard, type TestimonialCardProps } from './TestimonialCard';
import { shuffleArray } from './_lib/shuffleArray';
import { colorTypeValues } from './_lib/designTypesStore';

const DURATION_PER_CARD_SECONDS = 6;

const styles = tv({
	slots: {
		base: 'py-[calc(var(--container-padding))] flex flex-col gap-12 md:gap-20',
	},
	variants: {
		backgroundColor: {
			midnight: { base: 'bg-midnight-900' },
			cream: { base: 'bg-goodparty-cream' },
			white: { base: 'bg-white' },
		},
	},
});

export type TestimonialsAutoScrollProps = {
	header?: HeaderBlockProps;
	backgroundColor?: 'cream' | 'midnight' | 'white';
	cards: TestimonialCardProps[];
	/** Multiplies scroll speed. Default 1. Values > 1 scroll faster. */
	speedMultiplier?: number;
};

/**
 * Infinite auto-scrolling testimonial marquee.
 * Shows ~3 cards on desktop, ~1 on mobile. Pauses on hover.
 * Intended for A/B testing against TestimonialBlock / TestimonialsCarousel.
 */
export function TestimonialsAutoScroll({
	cards,
	header,
	backgroundColor = 'cream',
	speedMultiplier = 1,
}: TestimonialsAutoScrollProps) {
	const { base } = styles({ backgroundColor });

	const colors = useMemo(() => {
		const c = shuffleArray(colorTypeValues.filter(color => color !== 'inverse'));
		while (c.length < cards.length) c.push(...c);
		return c;
	}, [cards.length]);

	// Duplicate the cards so we can translate by -50% and loop seamlessly.
	const doubled = useMemo(() => [...cards, ...cards], [cards]);
	const duration = (cards.length * DURATION_PER_CARD_SECONDS) / speedMultiplier;

	return (
		<div className={base()} data-component='TestimonialsAutoScroll'>
			<style>{`
				@keyframes testimonials-auto-scroll {
					to { transform: translateX(-50%); }
				}
				@media (prefers-reduced-motion: reduce) {
					.testimonials-auto-scroll-track {
						animation-play-state: paused !important;
					}
				}
			`}</style>
			{header && (
				<Container size='xl'>
					<HeaderBlock {...header} backgroundColor={backgroundColor} />
				</Container>
			)}
			<div className='overflow-hidden'>
				<div
					className='testimonials-auto-scroll-track flex'
					style={{ animation: `testimonials-auto-scroll ${duration}s linear infinite` }}
					onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
					onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}
				>
					{doubled.map((card, index) => (
						// pr-6 acts as the gap and is included in the -50% translation calculation.
						<div key={index} className='flex-none pr-6 w-[80vw] md:w-[32vw]'>
							<TestimonialCard
								{...card}
								color={card.color ?? (colors[index % cards.length] as TestimonialCardProps['color'])}
								className='h-full'
							/>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
