import type { ReactNode } from 'react';

import { cn, tv } from './_lib/utils.ts';
import type { backgroundTypeValues, leftRightValues } from './_lib/designTypesStore.ts';
import { isValidRichText } from './_lib/isValidRichText.ts';

import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { Container } from './Container.tsx';
import { Media } from './Media.tsx';
import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		wrapper: 'grid md:items-center md:grid-cols-2 gap-10 lg:gap-20',
		imageSlot: '',
		content: 'flex flex-col gap-6',
		copyGrid: 'grid gap-6 md:grid-cols-2',
	},
	variants: {
		backgroundColor: {
			midnight: {
				base: 'bg-midnight-900 text-white',
			},
			cream: {
				base: 'bg-goodparty-cream',
			},
		},
		mediaAlignment: {
			left: {
				imageSlot: 'order-1',
				content: 'order-2',
			},
			right: {
				imageSlot: 'order-2',
				content: 'order-1',
			},
		},
	},
});

export type ImageTwoColumnCopyBlockProps = {
	backgroundColor?: (typeof backgroundTypeValues)[number];
	mediaAlignment?: (typeof leftRightValues)[number];
	image?: any;
	showFullImage?: boolean;
	label?: string;
	title: string;
	copy1?: ReactNode;
	copy2?: ReactNode;
	primaryButton?: ComponentButtonProps;
	className?: string;
};

export function ImageTwoColumnCopyBlock(props: ImageTwoColumnCopyBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const mediaAlignment = props.mediaAlignment ?? 'left';

	const { base, wrapper, imageSlot, content, copyGrid } = styles({ backgroundColor, mediaAlignment });

	return (
		<article className={cn(base(), props.className)} data-component='ImageTwoColumnCopyBlock'>
			<Container size='xl'>
				<div className={wrapper()}>
					<Media aspectRatio='9:16' className={imageSlot()} image={props.image} objectFit={props.showFullImage ? 'contain' : 'cover'} />
					<div className={content()}>
						<div className='flex flex-col gap-3 md:gap-4'>
							{props.label && (
								<Text as='span' styleType='overline' className='text-neutral-500'>
									{props.label}
								</Text>
							)}
							{props.title && (
								<Text as='h2' styleType='heading-lg'>
									{props.title}
								</Text>
							)}
						</div>
						{(isValidRichText(props.copy1) || isValidRichText(props.copy2)) && (
							<div className={copyGrid()}>
								{isValidRichText(props.copy1) && <Text styleType='body-1'>{props.copy1}</Text>}
								{isValidRichText(props.copy2) && <Text styleType='body-1'>{props.copy2}</Text>}
							</div>
						)}
						{props.primaryButton && (
							<div>
								<ComponentButton {...props.primaryButton} />
							</div>
						)}
					</div>
				</div>
			</Container>
		</article>
	);
}
