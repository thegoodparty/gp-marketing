import type { ReactNode } from 'react';

import { cn, tv } from './_lib/utils.ts';
import { resolveButtonStyleType } from './_lib/resolveButtonStyleType.ts';
import { isValidRichText } from './_lib/isValidRichText.ts';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';

import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { Media } from './Media.tsx';
import { Text } from './Text.tsx';
import { Container } from './Container.tsx';
import { HeaderBlock, type HeaderBlockProps } from './HeaderBlock.tsx';

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		bg: 'bg-goodparty-cream',
		wrapper: 'flex flex-col gap-12 md:gap-20',
		container: 'grid md:grid-cols-2 bg-white rounded-lg overflow-hidden w-full md:sticky md:origin-top md:top-0',
		content: 'flex flex-col gap-6 p-(--container-padding) max-md:text-center md:self-center',
		media: 'md:[&>div]:h-full md:[&>div]:w-full',
		overline: 'text-neutral-500',
	},
	variants: {
		backgroundColor: {
			cream: 'bg-goodparty-cream',
			midnight: 'bg-midnight-900',
		},
		layout: {
			'media-left': {},
			'media-right': {
				media: 'md:order-2',
				content: 'md:order-1',
			},
		},
	},
});

type StepperItemProps = {
	_key?: string;
	showFullImage?: boolean;
	title?: string;
	caption?: string;
	layout?: 'media-left' | 'media-right';
	copy?: ReactNode;
	image?: any;
	label?: string;
	buttons?: ComponentButtonProps[];
};

export type StepperBlockProps = {
	backgroundColor?: (typeof backgroundTypeValues)[number];
	className?: string;
	header?: HeaderBlockProps;
	items?: StepperItemProps[];
};

export function StepperBlock(props: StepperBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, wrapper, overline } = styles({ backgroundColor });

	return (
		<article className={cn(base(), props.className)} data-component='StepperBlock'>
			<Container size='xl'>
				<div className={wrapper()}>
					<HeaderBlock {...props.header} backgroundColor={props.backgroundColor} />
					{props.items?.map((item, index) => {
						const layout = item.layout ?? 'media-left';
						const { container, media, content } = styles({ backgroundColor, layout });

						return (
							<div
								key={`cards-stack-${index}-${item._key}`}
								className={container({ layout })}
								style={{
									top: `calc(var(--header-offset) + ${1 * index}rem)`,
									zIndex: `calc(var(--bg-pattern-layer-image) + ${index + 1})`,
								}}
							>
								<div className={media()}>
									<Media aspectRatio='1:1' image={item.image} objectFit={item.showFullImage ? 'contain' : 'cover'} />
								</div>
								<div className={content()}>
									<div className='flex flex-col gap-3 md:gap-4'>
										{item.label && (
											<span className={overline()}>
												<Text as='span' styleType='overline'>
													{item.label}
												</Text>
											</span>
										)}
										{item.title && (
											<Text as='h2' styleType='heading-md'>
												{item.title}
											</Text>
										)}
										{isValidRichText(item.copy) && <Text styleType='body-2'>{item.copy}</Text>}
									</div>
									{item.buttons && item.buttons.length > 0 && (
										<div className={`flex flex-wrap gap-4 w-full max-md:justify-center`}>
											{item.buttons.map(item => {
												const resolvedStyle = resolveButtonStyleType(item?.buttonProps?.styleType ?? 'primary', backgroundColor);
												return (
													<ComponentButton
														key={item._key}
														className='max-sm:w-full w-fit'
														{...item}
														buttonProps={{ ...(item.buttonProps ?? {}), styleType: resolvedStyle }}
													/>
												);
											})}
										</div>
									)}
									{item.caption && <Text styleType='caption'>{item.caption}</Text>}
								</div>
							</div>
						);
					})}
				</div>
			</Container>
		</article>
	);
}
