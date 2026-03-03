import type { ReactNode } from 'react';
import { cn, tv } from './_lib/utils.ts';
import { resolveInverseButtonStyleType } from './_lib/resolveButtonStyleType.ts';
import { isValidRichText } from './_lib/isValidRichText.ts';
import type { SanityImage } from './types.ts';
import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { Container } from './Container.tsx';
import { Media } from './Media.tsx';
import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		card: 'absolute inset-0 overflow-hidden rounded-2xl transition-transform duration-normal ease-smooth z-0 pointer-events-none',
		content: 'relative z-2 flex flex-col gap-6',
		media: 'relative rounded-xl overflow-hidden z-2',
	},
	variants: {
		backgroundColor: {
			cream: {
				base: 'bg-goodparty-cream',
			},
		},
		color: {
			midnight: {
				base: 'text-white',
				card: 'bg-midnight-900',
			},
		},
	},
});

export type FeaturedBlogBlockProps = {
	buttons?: ComponentButtonProps[];
	caption?: string;
	copy?: ReactNode;
	image?: SanityImage;
	label?: string;
	title: string;
	className?: string;
};

export function FeaturedBlogBlock(props: FeaturedBlogBlockProps) {
	const backgroundColor = 'cream';
	const color = 'midnight';
	const { base, media, content, card } = styles({ backgroundColor, color });

	return (
		<article className={cn(base(), props.className)} data-component='FeaturedBlogBlock'>
			<Container size='xl'>
				<div className='group relative'>
					<div className='grid gap-6 p-6 md:grid-cols-2 md:p-8 md:items-center md:gap-8 lg:grid-cols-[1fr_1.5fr]'>
						<div className={content()}>
							<div className='flex flex-col gap-3 md:gap-4'>
								{props.label && (
									<span className='text-neutral-400'>
										<Text as='span' styleType='overline'>
											{props.label}
										</Text>
									</span>
								)}
								{props.title && (
									<Text as='h2' className='font-semibold' styleType='text-4xl'>
										{props.title}
									</Text>
								)}
								{isValidRichText(props.copy) && <Text styleType='body-1'>{props.copy}</Text>}
							</div>
							{props.buttons && props.buttons.length > 0 && <CTAButtons buttons={props.buttons} className='hidden md:flex' />}
							{props.caption && (
								<Text as='span' styleType='caption'>
									{props.caption}
								</Text>
							)}
						</div>

						<div className={media()}>
							<Media aspectRatio='16:9' image={props.image} />
						</div>
						{props.buttons && props.buttons.length > 0 && (
							<div className={cn(content(), 'md:hidden')}>
								<CTAButtons buttons={props.buttons} />
							</div>
						)}
					</div>
					<div className={card()}></div>
				</div>
			</Container>
		</article>
	);
}

function CTAButtons(props: { buttons: ComponentButtonProps[]; className?: string }) {
	return (
		<div className={cn(`flex flex-wrap gap-4 max-md:w-full`, props.className)}>
			{props.buttons.map((item, index) => {
				const resolvedStyle = resolveInverseButtonStyleType(item?.buttonProps?.styleType ?? 'primary', 'midnight', 'midnight');
				return (
					<ComponentButton
						key={index}
						className='max-sm:w-full'
						{...item}
						buttonProps={{ ...(item.buttonProps ?? {}), styleType: resolvedStyle }}
					/>
				);
			})}
		</div>
	);
}
