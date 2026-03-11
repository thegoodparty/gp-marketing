import type { ReactNode } from 'react';

import { cn, tv } from './_lib/utils.ts';
import type { backgroundTypeValues, colorTypeValues, leftRightValues } from './_lib/designTypesStore.ts';
import { isValidRichText } from './_lib/isValidRichText.ts';
import { resolveButtonStyleType } from './_lib/resolveButtonStyleType.ts';

import { Container } from './Container.tsx';
import { CircleIcon } from './CircleIcon.tsx';
import { FadeIn } from './FadeIn.tsx';
import type { IconType } from './IconResolver.tsx';
import { Text } from './Text.tsx';
import { Media } from './Media.tsx';
import { ComponentButton } from './Inputs/Button.tsx';
import { HeaderBlock, type HeaderBlockProps } from './HeaderBlock.tsx';

const styles = tv({
	slots: {
		base: 'py-[calc(var(--container-padding))]',
		wrapper: 'flex flex-col gap-12 md:gap-20',
		grid: 'grid gap-x-responsive-md gap-y-responsive-lg ',
		feature: 'flex flex-col lg:flex items-start ',
		stackGrid: 'grid gap-x-responsive-md gap-y-responsive-lg md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2',
		content: 'flex flex-col gap-8 p-6 w-full',
	},
	variants: {
		backgroundColor: {
			midnight: {
				base: 'bg-midnight-900',
				content: 'text-white',
			},
			cream: 'bg-goodparty-cream',
			white: { base: 'bg-white' },
		},
		isHighlighted: {
			true: {
				feature: 'h-fit gap-2 border border-black/16 rounded-xl overflow-hidden',
			},
			false: {},
		},
		highlightedFeatureAlignment: {
			left: {
				grid: 'lg:grid-cols-2 xl:grid-cols-[500px_auto]',
			},
			right: {
				grid: 'lg:grid-cols-2 xl:grid-cols-[auto_500px]',
				feature: 'order-last',
			},
		},
	},
	compoundVariants: [
		{
			isHighlighted: true,
			backgroundColor: 'midnight',
			className: {
				feature: 'border-white/30',
			},
		},
	],
});

export type FeaturesBlockItemProps = {
	description?: ReactNode;
	icon?: IconType;
	iconContent?: ReactNode;
	iconColor?: 'red' | 'blue' | 'gold';
	title?: string;
	isHighlighted?: boolean;
	image?: any;
	showFullImage?: boolean;
	button?: any;
	tag?: string;
	tagVariant?: 'free' | 'default';
};

export type FeaturesBlockProps = {
	backgroundColor: (typeof backgroundTypeValues)[number];
	className?: string;
	items: FeaturesBlockItemProps[];
	iconBg?: Exclude<(typeof colorTypeValues)[number], 'inverse'>;
	highlightedFeatureAlignment?: (typeof leftRightValues)[number];
	header: HeaderBlockProps;
};

export function FeaturesBlock(props: FeaturesBlockProps) {
	const alignment = props.highlightedFeatureAlignment ?? 'left';
	const iconBg = props.iconBg ?? 'blue';
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, wrapper, grid, feature, stackGrid, content } = styles({ backgroundColor });

	const resolvedStyle = resolveButtonStyleType('min-ghost', props.backgroundColor);

	const highlighted = props.items.find(i => i.isHighlighted);
	const normals = props.items.filter(i => !i.isHighlighted);

	const iconColorMap = {
		red: 'bg-[rgba(224,22,43,0.08)]',
		blue: 'bg-[rgba(0,82,165,0.08)]',
		gold: 'bg-[rgba(232,170,26,0.1)]',
	} as const;

	const tagColorMap = {
		free: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
		default: 'bg-white border-neutral-200 text-neutral-500',
	} as const;

	const renderFeatureIcon = (item: FeaturesBlockItemProps) => {
		if (item.iconContent) {
			const color = item.iconColor ?? 'red';
			return (
				<div
					className={cn(
						'w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 mb-5',
						iconColorMap[color],
					)}
				>
					{item.iconContent}
				</div>
			);
		}
		if (item.icon) {
			return <CircleIcon icon={item.icon} iconBg={iconBg} />;
		}
		return null;
	};

	if (!highlighted) {
		return (
			<article className={cn(base(), props.className)} data-component='FeaturesBlock'>
				<Container size='xl'>
					<div className={wrapper()}>
						<FadeIn delay={0}>
							<HeaderBlock {...props.header} backgroundColor={props.backgroundColor} layout='center' />
						</FadeIn>
						<ul className='grid gap-x-responsive-md gap-y-responsive-lg sm:grid-cols-2 lg:grid-cols-3'>
							{props.items.map((item, index) => (
								<li
									key={`feature-${index}`}
									className={cn(
										feature(),
										(item.iconContent || item.tag) &&
											cn(
												'rounded-2xl p-8 md:p-10 border border-transparent transition-all duration-300 hover:border-[#E8AA1A] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]',
												backgroundColor === 'white' ? 'bg-goodparty-cream' : 'bg-white',
											),
									)}
								>
									<FadeIn delay={index * 80}>
										<div className={content()}>
											<div className='flex flex-col gap-4'>
												{renderFeatureIcon(item)}
												{item.title && (
													<Text as='h3' styleType='subtitle-1'>
														{item.title}
													</Text>
												)}
												{isValidRichText(item.description) && <Text styleType='body-2'>{item.description}</Text>}
												{item.tag && (
													<span
														className={cn(
															'inline-block border rounded-full py-1 px-3 text-xs font-semibold mt-4',
															item.tagVariant ? tagColorMap[item.tagVariant] : tagColorMap.default,
														)}
													>
														{item.tag}
													</span>
												)}
											</div>
											{item.button && (
												<ComponentButton
													className='w-fit'
													{...item.button}
													buttonProps={{ ...(item.button.buttonProps ?? {}), styleType: resolvedStyle }}
												/>
											)}
										</div>
										{item.image && (
											<Media image={item.image} aspectRatio='1:1' objectFit={item.showFullImage ? 'contain' : 'cover'} className='w-full' />
										)}
									</FadeIn>
								</li>
							))}
						</ul>
					</div>
				</Container>
			</article>
		);
	}

	return (
		<article className={cn(base(), props.className)} data-component='FeaturesBlock'>
			<Container size='xl'>
				<div className={wrapper()}>
					<HeaderBlock {...props.header} backgroundColor={props.backgroundColor} layout='left' />
					<ul className={grid({ highlightedFeatureAlignment: alignment })}>
						<li className={cn(feature({ isHighlighted: true, highlightedFeatureAlignment: alignment }), 'md:grid md:grid-cols-2')}>
							<div className={content()}>
								<div className='flex flex-col gap-4'>
									{highlighted.icon && <CircleIcon icon={highlighted.icon} iconBg={iconBg} />}
									{highlighted.title && (
										<Text as='h3' styleType='subtitle-1'>
											{highlighted.title}
										</Text>
									)}
									{isValidRichText(highlighted.description) && <Text styleType='body-2'>{highlighted.description}</Text>}
								</div>
								{highlighted.button && (
									<ComponentButton
										{...highlighted.button}
										buttonProps={{ ...(highlighted.button.buttonProps ?? {}), styleType: resolvedStyle }}
									/>
								)}
							</div>
							{highlighted.image && (
								<Media
									aspectRatio='1:1'
									image={highlighted.image}
									objectFit={highlighted.showFullImage ? 'contain' : 'cover'}
									className='w-full'
								/>
							)}
						</li>
						<li>
							<ul className={stackGrid()}>
								{normals.map((item, index) => (
									<li key={`feature-${index}`} className={feature({ isHighlighted: false })}>
										<div className={content()}>
											<div className='flex flex-col gap-4'>
												{item.icon && <CircleIcon icon={item.icon} iconBg={iconBg} />}
												{item.title && (
													<Text as='h3' styleType='subtitle-1'>
														{item.title}
													</Text>
												)}
												{isValidRichText(item.description) && <Text styleType='body-2'>{item.description}</Text>}
											</div>
											{item.button && (
												<ComponentButton
													className='w-fit'
													{...item.button}
													buttonProps={{ ...(item.button.buttonProps ?? {}), styleType: resolvedStyle }}
												/>
											)}
										</div>
										{item.image && (
											<Media aspectRatio='1:1' image={item.image} objectFit={item.showFullImage ? 'contain' : 'cover'} className='w-full' />
										)}
									</li>
								))}
							</ul>
						</li>
					</ul>
				</div>
			</Container>
		</article>
	);
}
