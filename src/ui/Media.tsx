'use client';

import { cn, tv } from './_lib/utils.ts';
import type { aspectRatioValues } from './_lib/designTypesStore.ts';

import type { SanityImage } from './types.ts';

import { ResponsiveImage, type ResponsiveImageProps } from './ResponsiveImage.tsx';
import { Video } from './Video.tsx';

const styles = tv({
	slots: {
		base: 'flex flex-col gap-4',
	},
	variants: {
		aspectRatio: {
			'1:1': {
				base: 'aspect-1/1',
			},
			'16:9': {
				base: 'aspect-16/9',
			},
			'9:16': {
				base: 'aspect-9/16',
			},
			'5:4': {
				base: 'aspect-5/4',
			},
			'4:5': {
				base: 'aspect-4/5',
			},
			'4:3': {
				base: 'aspect-4/3',
			},
			'3:4': {
				base: 'aspect-3/4',
			},
			default: {},
		},
	},
});

export type MediaProps = {
	aspectRatio?: (typeof aspectRatioValues)[number];
	className?: string;
	image?: SanityImage;
	objectFit?: ResponsiveImageProps['objectFit'];
	priority?: boolean;
	video?: string;
};

export function Media(props: MediaProps) {
	const aspectRatio = props.aspectRatio ?? 'default';
	const { base } = styles({ aspectRatio });

	return (
		<div className={cn(base(), props.className)} data-component='Media'>
			{props.image && !props.video && <ResponsiveImage image={props.image} objectFit={props.objectFit} priority={props.priority} />}
			{props.video && <Video video={props.video} />}
		</div>
	);
}
