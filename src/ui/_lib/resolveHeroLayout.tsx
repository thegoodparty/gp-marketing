import { stegaClean } from 'next-sanity';
import type { Field_imagePosition } from 'sanity.types';

import type { HeroBlockProps } from '../HeroBlock';

export function resolveHeroLayout({
	imagePosition,
	imageSize,
}: {
	imagePosition?: Field_imagePosition;
	imageSize?: string;
}): HeroBlockProps['layout'] {
	if (!imagePosition || imagePosition === 'NoImage') return 'no-media';

	const isFull = imageSize === 'Large';

	const layoutMap: Record<Exclude<Field_imagePosition, 'NoImage'>, HeroBlockProps['layout']> = {
		Center: isFull ? 'media-center-full' : 'media-center',
		Left: isFull ? 'media-left-full' : 'media-left',
		Right: isFull ? 'media-right-full' : 'media-right',
	};

	return layoutMap[stegaClean(imagePosition)] ?? 'no-media';
}
