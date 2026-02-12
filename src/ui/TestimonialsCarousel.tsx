'use client';

import type { EmblaOptionsType } from 'embla-carousel';
import { Carousel } from '~/ui/Carousel';
import type { HeaderBlockProps } from '~/ui/HeaderBlock';
import type { TestimonialCardProps } from '~/ui/TestimonialCard';

export type TestimonialsCarouselProps = {
	header?: HeaderBlockProps;
	backgroundColor?: 'cream' | 'midnight';
	cards: TestimonialCardProps[];
	options?: EmblaOptionsType;
};

/**
 * Carousel of testimonial cards (Logo + quote + Author).
 * Uses TestimonialCard design; for image-based testimonials use Carousel with cardVariant="image".
 */
export function TestimonialsCarousel(props: TestimonialsCarouselProps) {
	return <Carousel {...props} cardVariant='card' />;
}
