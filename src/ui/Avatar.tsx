import type { FC } from 'react';

import { cn, tv } from './_lib/utils.ts';

import { Media, type MediaProps } from './Media.tsx';
import type { SanityImage } from './types.ts';
import type { smallLargeValues } from './_lib/designTypesStore.ts';

const styles = tv({
	slots: {
		base: 'flex items-center overflow-hidden justify-center text-foreground-primary transition-colors duration-slow ease-smooth !rounded-full',
		image: 'h-full w-full [&_img]:h-full [&_img]:w-full',
	},
	variants: {
		size: {
			lg: 'size-20',
			sm: 'size-12',
		},
	},
});

export type AvatarProps = Omit<MediaProps, 'image'> & {
	_key?: string;
	className?: string;
	image?: SanityImage | string;
	imageFit?: 'contain' | 'cover';
	size?: (typeof smallLargeValues)[number];
};

export const Avatar: FC<AvatarProps> = props => {
	const { className, size = 'lg', imageFit = 'cover' } = props;
	const { base, image } = styles({ size });

	return (
		<div className={cn(base(), className)} data-component='Avatar'>
			{typeof props.image === 'string' ? (
				<div className={image()}>
					<img src={props.image} />
				</div>
			) : (
				<Media image={props.image as SanityImage} className={image()} objectFit={imageFit} />
			)}
		</div>
	);
};
