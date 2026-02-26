import type { ReactNode } from 'react';

import { cn, tv } from './_lib/utils.ts';
import { resolveButtonStyleType } from './_lib/resolveButtonStyleType.ts';
import { isValidRichText } from './_lib/isValidRichText.ts';
import type { FormProps } from './_lib/resolveForm.ts';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';
import { resolveTextSize, type ResolvedTextSize } from '~/ui/_lib/resolveTextSize.ts';

import { Container } from './Container.tsx';
import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { EmbedHtml } from './EmbedHtml.tsx';
import { Media } from './Media.tsx';
import { Newsletter } from './Form/Newsletter.tsx';
import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		base: '',
		wrapper: '',
		container: '',
		content: 'flex flex-col gap-6 md:py-[2rem]',
		media: '',
		overline: 'text-neutral-500',
		buttons: 'flex flex-wrap gap-4',
		text: 'max-w-[50rem]',
	},
	variants: {
		backgroundColor: {
			cream: {
				base: 'bg-goodparty-cream',
			},
			midnight: {
				base: 'bg-midnight-900 text-white',
				overline: 'text-white',
			},
		},
		layout: {
			'no-media': {
				base: 'py-8 md:py-40',
				content: 'text-center justify-center md:items-center',
			},
			'media-left': {
				base: 'py-(--container-padding)',
				container: 'grid max-md:gap-6 md:grid-cols-2 md:items-center',
				content: 'max-md:py-6 max-md:text-center md:px-12 xl:px-20',
			},
			'media-right': {
				base: 'py-(--container-padding)',
				container: 'grid gap-8 md:gap-20 lg:grid-cols-2 md:items-center',
				media: 'order-2',
				content: 'order-1',
			},
			'media-center': {
				base: 'py-(--container-padding)',
				wrapper: 'relative',
				media: 'absolute inset-0 [&>div]:h-full [&>div]:w-full after:absolute after:inset-0 after:z-0',
				content: 'text-center py-16 px-4 relative z-1 max-w-[50rem] mx-auto md:items-center lg:min-h-[36rem] lg:justify-center',
				buttons: 'max-md:justify-center',
			},
			'media-left-full': {
				container: 'grid gap-8 md:gap-20 md:grid-cols-2',
				media: '-ml-[var(--container-padding)] md:[&>div]:h-full md:[&>div]:w-full',
				content: 'max-md:text-center md:self-center',
				buttons: 'max-md:justify-center',
			},
			'media-right-full': {
				container: 'grid gap-8 md:gap-20 md:grid-cols-2',
				media: 'order-2 max-md:-ml-[var(--container-padding)] -mr-[var(--container-padding)] md:[&>div]:h-full md:[&>div]:w-full',
				content: 'order-1 max-md:text-center md:self-center max-md:pt-(--container-padding)',
				buttons: 'max-md:justify-center',
			},
			'media-center-full': {
				base: 'relative',
				media: 'absolute inset-0 [&>div]:h-full [&>div]:w-full after:absolute after:inset-0 after:z-0',
				content: 'text-center py-24 px-6 relative z-1 max-w-[50rem] mx-auto md:items-center lg:min-h-[38rem] lg:justify-center',
				buttons: 'max-md:justify-center',
			},
			'embed-right': {
				base: 'py-(--container-padding)',
				container: 'grid gap-8 md:gap-12 lg:grid-cols-[2fr_3fr] md:items-start',
				media: 'order-2',
				content: 'order-1',
			},
			'embed-left': {
				base: 'py-(--container-padding)',
				container: 'grid max-md:gap-6 md:grid-cols-[3fr_2fr] md:items-start',
				content: 'max-md:py-6 max-md:text-center md:px-12 xl:px-20',
			},
		},
	},
	compoundVariants: [
		{
			background: 'light',
			layout: 'media-center',
			className: {
				media: 'after:bg-white/20',
			},
		},
		{
			background: 'dark',
			layout: 'media-center',
			className: {
				media: 'after:bg-[#0A0A0A]/60',
				content: 'text-white',
				overline: 'text-white',
			},
		},
		{
			background: 'light',
			layout: 'media-center-full',
			className: {
				media: 'after:bg-white/20',
			},
		},
		{
			background: 'dark',
			layout: 'media-center-full',
			className: {
				media: 'after:bg-[#0A0A0A]/60',
				content: 'text-white',
				overline: 'text-white',
			},
		},
	],
});

export type HeroBlockProps = {
	backgroundColor?: (typeof backgroundTypeValues)[number];
	buttons?: ComponentButtonProps[];
	className?: string;
	copy?: ReactNode;
	image?: any;
	showFullImage?: boolean;
	label?: string;
	layout?: 'no-media' | 'media-left' | 'media-right' | 'media-center' | 'media-left-full' | 'media-right-full' | 'media-center-full' | 'embed-right' | 'embed-left';
	embedCode?: string;
	subscribe?: boolean;
	title?: string;
	form?: FormProps;
	textSize?: ResolvedTextSize;
};

export function HeroBlock(props: HeroBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const layout = props.layout ?? 'no-media';
	const textSize = props.textSize ?? resolveTextSize('Medium');

	const { base, wrapper, container, media, content, overline, buttons, text } = styles({ backgroundColor, layout });

	return (
		<article className={cn(base(), props.className)} data-component='HeroBlock'>
			<Container size={layout.includes('center-full') ? 'unset' : 'xl'}>
				<div className={wrapper()}>
					<div className={container()}>
					{layout !== 'no-media' && (
						<div className={media()}>
							{props.embedCode ? (
								<EmbedHtml html={props.embedCode} />
							) : (
								<Media aspectRatio='5:4' image={props.image} objectFit={props.showFullImage ? 'contain' : 'cover'} />
							)}
						</div>
					)}
						<div className={content()}>
							<div className='flex flex-col gap-3 md:gap-4'>
								{props.label && (
									<span className={overline()}>
										<Text as='span' styleType='overline'>
											{props.label}
										</Text>
									</span>
								)}
								{props.title && (
									<Text as='h1' styleType={textSize.heading}>
										{props.title}
									</Text>
								)}
								{isValidRichText(props.copy) && (
									<Text className={text()} styleType={textSize.body}>
										{props.copy}
									</Text>
								)}
							</div>
							{props.form?.provider === 'Hubspot' && props.form.formId && <Newsletter formId={props.form.formId} />}
							{props.buttons && props.buttons.length > 0 && (
								<div className={buttons()}>
									{props.buttons.map((item, index) => {
										const resolvedStyle = resolveButtonStyleType(item?.buttonProps?.styleType ?? 'primary', backgroundColor);

										return (
											<ComponentButton
												key={index}
												className='max-sm:w-full w-fit'
												{...item}
												buttonProps={{ ...(item.buttonProps ?? {}), styleType: resolvedStyle }}
											/>
										);
									})}
								</div>
							)}
						</div>
					</div>
				</div>
			</Container>
		</article>
	);
}
