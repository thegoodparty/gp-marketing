import type { ReactNode } from 'react';

import { cn, tv } from './_lib/utils.ts';
import { resolveInverseButtonStyleType } from './_lib/resolveButtonStyleType.ts';
import { isValidRichText } from './_lib/isValidRichText.ts';
import type { backgroundTypeValues, componentColorValues, leftRightValues } from './_lib/designTypesStore.ts';

import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { Container } from './Container.tsx';
import { Media } from './Media.tsx';
import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		base: '',
		wrapper: 'grid md:items-center',
		card: 'absolute inset-0 overflow-hidden rounded-2xl transition-transform duration-normal ease-smooth z-0 pointer-events-none group-hover:scale-[1.025]',
		content: 'relative z-2 flex flex-col gap-6',
		media: 'relative z-2',
	},
	variants: {
		backgroundColor: {
			midnight: {
				base: 'bg-midnight-900',
			},
			cream: {
				base: 'bg-goodparty-cream',
			},
		},
		color: {
			red: {
				card: 'bg-goodparty-red-light',
			},
			waxflower: {
				card: 'bg-waxflower-200',
			},
			'bright-yellow': {
				card: 'bg-bright-yellow-200',
			},
			'halo-green': {
				card: 'bg-halo-green-200',
			},
			blue: {
				card: 'bg-blue-200',
			},
			lavender: {
				card: 'bg-lavender-200',
			},
			midnight: {
				base: 'text-white',
				card: 'bg-midnight-900',
			},
			cream: {
				card: 'bg-goodparty-cream',
			},
		},
		mediaAlignment: {
			left: {
				content: 'order-2',
				media: 'order-1',
			},
			right: {
				content: 'order-1',
				media: 'order-2',
			},
		},
		layout: {
			blog: {
				wrapper: 'p-8 gap-8 md:grid-cols-[1fr_auto]',
				media: 'md:aspect-3/4 md:h-[20rem] w-full',
			},
			page: {
				wrapper: 'p-(--container-padding) gap-10 lg:gap-20 md:grid-cols-2',
			},
		},
	},
});

export type CTAImageBlockProps = {
	backgroundColor?: (typeof backgroundTypeValues)[number];
	primaryButton?: ComponentButtonProps;
	secondaryButton?: ComponentButtonProps;
	caption?: string;
	color?: Exclude<(typeof componentColorValues)[number], 'inverse'>;
	copy?: ReactNode;
	image?: any;
	showFullImage?: boolean;
	label?: string;
	mediaAlignment?: (typeof leftRightValues)[number];
	title: string;
	className?: string;
	layout?: 'page' | 'blog';
};

export function CTAImageBlock(props: CTAImageBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const color = props.color ?? 'red';
	const mediaAlignment = props.mediaAlignment ?? 'left';
	const layout = props.layout ?? 'page';

	const { base, wrapper, media, content, card } = styles({ backgroundColor, color, mediaAlignment, layout });

	const resolvedPrimaryStyle = resolveInverseButtonStyleType('primary', backgroundColor, color);
	const resolvedSecondaryStyle = resolveInverseButtonStyleType('secondary', backgroundColor, color);

	return (
		<article className={cn(base(), props.className)} data-component='CTAImageBlock'>
			<Container size={layout === 'blog' ? 'unset' : 'xl'}>
				<div className='group relative'>
					<div className={wrapper()}>
						<Media aspectRatio='4:3' className={media()} image={props.image} objectFit={props.showFullImage ? 'contain' : 'cover'} />
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
								{isValidRichText(props.copy) && <Text styleType='body-1'>{props.copy}</Text>}
							</div>
							<div className='flex flex-wrap gap-4 *:max-sm:w-full'>
								{props.primaryButton && <ComponentButton {...props.primaryButton} buttonProps={{ styleType: resolvedPrimaryStyle }} />}
								{props.secondaryButton && (
									<ComponentButton {...props.secondaryButton} buttonProps={{ styleType: resolvedSecondaryStyle }} />
								)}
							</div>
							{props.caption && (
								<Text as='span' styleType='caption'>
									{props.caption}
								</Text>
							)}
						</div>
					</div>
					<div className={card()}></div>
				</div>
			</Container>
		</article>
	);
}
