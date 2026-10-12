import { useEffect } from 'react';
import type { EmblaCarouselType } from 'embla-carousel';

import { trackVoterGuideEvent } from '~/lib/analytics';

/**
 * Reports every move between carousel pages, however it was made: the arrows,
 * the dots and a swipe all end in Embla's `select`, so listening there counts
 * them once each instead of three handlers counting two of them.
 */
export function useCarouselPageTracking(emblaApi: EmblaCarouselType | undefined, carousel: string): void {
	useEffect(() => {
		if (!emblaApi) return;
		const onSelect = (api: EmblaCarouselType) => {
			const index = api.selectedScrollSnap();
			const previous = api.previousScrollSnap();
			if (index === previous) return;
			trackVoterGuideEvent('carouselPage', { carousel, index, direction: index > previous ? 'next' : 'prev' });
		};
		emblaApi.on('select', onSelect);
		return () => {
			emblaApi.off('select', onSelect);
		};
	}, [emblaApi, carousel]);
}
