import type { ReactNode } from 'react';

import { cn, tv } from './_lib/utils.ts';
import type { backgroundTypeValues, colorTypeValues, leftRightValues } from './_lib/designTypesStore.ts';
import { isValidRichText } from './_lib/isValidRichText.ts';
import { resolveButtonStyleType } from './_lib/resolveButtonStyleType.ts';

import { Container } from './Container.tsx';
import { CircleIcon } from './CircleIcon.tsx';
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
	title?: string;
	isHighlighted?: boolean;
	image?: any;
	button?: any;
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

	if (!highlighted) {
		return (
			<article className={cn(base(), props.className)} data-component='FeaturesBlock'>
				<Container size='xl'>
					<div className={wrapper()}>
						<HeaderBlock {...props.header} backgroundColor={props.backgroundColor} layout='center' />
						<ul className='grid gap-x-responsive-md gap-y-responsive-lg sm:grid-cols-2 lg:grid-cols-3'>
							{props.items.map((item, index) => (
								<li key={`feature-${index}`} className={feature()}>
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
									{item.image && <Media image={item.image} aspectRatio='1:1' />}
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
							{highlighted.image && <Media aspectRatio='1:1' image={highlighted.image} />}
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
										{item.image && <Media aspectRatio='1:1' image={item.image} />}
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
