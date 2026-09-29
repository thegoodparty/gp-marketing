import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';
import type { SanityImage } from '~/ui/types';

import { resolveAuthor } from '~/ui/_lib/resolveAuthor';
import { ElectionsSearchHero, type ElectionsSearchHeroSlide } from '~/ui/ElectionsSearchHero';

export function ElectionsSearchHeroSection(section: Extract<Sections, { _type: 'component_electionsSearchHero' }>) {
	// A slide with no photo has nothing to show in the square, so it is dropped
	// rather than rendered as an empty frame with a floating quote.
	const slides: ElectionsSearchHeroSlide[] = (section.list_slides ?? []).flatMap(slide => {
		if (!slide.img_photo?.asset) return [];
		return [
			{
				_key: slide._key,
				image: slide.img_photo as unknown as SanityImage,
				quote: slide.field_quote ?? undefined,
				author: resolveAuthor(slide.ref_quoteBy),
			},
		];
	});

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Elections Search Hero'>
			<ElectionsSearchHero
				headerText={section.electionsSearchHeroContent?.field_headerText ?? undefined}
				bodyCopy={section.electionsSearchHeroContent?.field_bodyCopy ?? undefined}
				buttonLabel={section.ctaAction?.field_buttonText ?? 'Search'}
				backgroundColor={
					section.electionsSearchHeroDesignSettings?.field_backgroundColor
						? stegaClean(section.electionsSearchHeroDesignSettings.field_backgroundColor)
						: undefined
				}
				slides={slides}
			/>
		</section>
	);
}
