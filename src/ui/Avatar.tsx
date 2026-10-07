import type { FC } from 'react';

import { cn, tv } from './_lib/utils.ts';

import { Media, type MediaProps } from './Media.tsx';
import type { SanityImage } from './types.ts';

const styles = tv({
	slots: {
		base: 'flex items-center overflow-hidden justify-center text-foreground-primary transition-colors duration-slow ease-smooth !rounded-full',
		image: 'h-full w-full [&_img]:h-full [&_img]:w-full',
		// A photo given as a plain URL (every election-api headshot) used to fill the
		// circle with no crop, so a portrait or landscape photo came out squished in
		// every candidate list while the same photo looked right in the profile hero,
		// which crops. The Sanity path below always cropped; this matches it.
		urlImage: 'object-cover',
	},
	variants: {
		imageFit: {
			contain: { urlImage: 'object-contain' },
			cover: { urlImage: 'object-cover' },
		},
		size: {
			sm: 'size-12',
			lg: 'size-20',
			xl: 'size-24',
		},
	},
});

export type AvatarProps = Omit<MediaProps, 'image'> & {
	_key?: string;
	className?: string;
	image?: SanityImage | string;
	imageFit?: 'contain' | 'cover';
	size?: 'sm' | 'lg' | 'xl';
};

export const Avatar: FC<AvatarProps> = props => {
	const { className, size = 'lg', imageFit = 'cover' } = props;
	const { base, image, urlImage } = styles({ size, imageFit });

	return (
		<div className={cn(base(), className)} data-component='Avatar'>
			{typeof props.image === 'string' ? (
				<div className={image()}>
					<img src={props.image} alt='' className={urlImage()} />
				</div>
			) : (
				<Media image={props.image} className={image()} objectFit={imageFit} />
			)}
		</div>
	);
};
