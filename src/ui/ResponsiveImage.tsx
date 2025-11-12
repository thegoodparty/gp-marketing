import Image from 'next/image';
import { cn } from './_lib/utils.ts';
import type { SanityImage } from './types.ts';
import { breakpoints } from './_lib/breakpoints.ts';

type SizeUnit = number | `${number}vw` | `${number}px`;

export const imageObjectFitValues = ['cover', 'contain'] as const;

export type ResponsiveImageProps = {
	className?: string;
	image: SanityImage | string;
	disableBlur?: boolean; // perceived size on desktop, use sizes if larger at other breakpoints
	maxWidth?: number; // behaves as 100vw until maxWidth if unset, use if larger at other breakpoints than desktop
	sizes?: {
		[k in keyof typeof breakpoints]?: SizeUnit;
	}; // eg: the result of 16 / 9
	crop?: {
		left: number;
		top: number;
		right: number;
		bottom: number;
	};
	aspectRatio?: string;
	priority?: boolean;
	setImageLoaded?: Function;
	objectFit?: (typeof imageObjectFitValues)[number];
	alt?: string;
};

export function ResponsiveImage(props: ResponsiveImageProps) {
	if (!props.image.asset) {
		return null;
	}
	let asset = props.image.asset;
	if ('_ref' in asset && typeof asset._ref === 'string') {
		let url = asset._ref;
		if (url.startsWith('image-')) {
			url = url.replace('image-', '');
		}
		const [id, dimensions, ext] = url.split('-');
		const [widthStr, heightStr] = dimensions.split('x');
		const width = widthStr ? Number(widthStr) : undefined;
		const height = heightStr ? Number(heightStr) : undefined;
		const metadata =
			!!width && !!height
				? {
						dimensions: {
							width,
							height,
						},
					}
				: undefined;

		asset = {
			_ref: id,
			url: `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${id}-${dimensions}.${ext}`,
			altText: '',
			metadata,
		};
	}

	// Add crop parameters if they exist
	if (props.image.crop && asset.metadata?.dimensions?.width && asset.metadata?.dimensions?.height) {
		if (!asset.url.includes('rect=')) {
			const cropLeft = Math.round(Number(props.image.crop.left) * Number(asset.metadata.dimensions.width));
			const cropTop = Math.round(Number(props.image.crop.top) * Number(asset.metadata.dimensions.height));
			const cropWidth = Math.round(
				(1 - Number(props.image.crop.left) - Number(props.image.crop.right)) * Number(asset.metadata.dimensions.width),
			);
			const cropHeight = Math.round(
				(1 - Number(props.image.crop.top) - Number(props.image.crop.bottom)) * Number(asset.metadata.dimensions.height),
			);

			const cropParams = `rect=${cropLeft},${cropTop},${cropWidth},${cropHeight}`;
			asset.url += `?${cropParams}`;
		}
	}

	let sizes = '';
	if (props.sizes) {
		for (const [size, unit] of Object.entries(props.sizes)) {
			if (size in breakpoints) {
				sizes += `${breakpoints[size].query} ${unit},`;
			}
		}
	}
	sizes += '100vw';

	const aspectRatio = (props.aspectRatio && Number(eval(props.aspectRatio))) || 1;
	const maxWidth = Number(props.maxWidth || asset.metadata?.dimensions?.width || 0);
	const maxHeight = Math.round(maxWidth / aspectRatio);
	// const shim = `data:image/svg+xml;base64,${toBase64(shimmer(maxWidth, maxHeight))}` as const;
	const objectFit = props.objectFit ?? 'cover';
	return (
		<span className={cn('w-full h-full block', props.className)}>
			<Image
				className={`h-full`}
				// the fallback url will
				src={asset.url.toString() || ''}
				// alt text should be set on an image in the media library, rather than a field in the document
				alt={props.alt || asset.altText?.toString() || ''}
				// placeholder={shouldShowBlur ? shim : 'empty'}
				// blurDataURL={shouldShowBlur ? props.image.asset?.metadata?.['lqip'] || undefined : undefined}
				// The maxWidth should set the upper bound on desktop,
				// responsive sizing should resolve a smaller image downloading via the generated srcset,
				// dpr is not considered here, we only want the max perceived size
				style={{
					width: '100%',
					maxWidth: props.maxWidth,
					aspectRatio: props.aspectRatio,
					objectFit: objectFit,
					objectPosition: 'center',
				}}
				// the ?w size is matched against the ?w sizes generated in the loader,
				// the default should behave as 100vw until maxWidth is reached
				sizes={sizes}
				// this is where dpr comes into play, as we've doubled the maxWidth as an upper bound, srcset has the larger size available to resolve to
				// if the devices dpr=1, the srcset should resolve to the perceived width rather than the double perceived width of a device with dpr=2
				// loader={loaderProps => loader(loaderProps, props.image, aspectRatio, maxWidth, maxHeight)}
				// We're actually just wanting to use w/h to set an aspect ratio, and also allowing a maxWidth
				width={maxWidth}
				height={maxHeight}
				priority={props.priority}
				onLoad={() => props.setImageLoaded && props.setImageLoaded(true)}
			/>
		</span>
	);
}
