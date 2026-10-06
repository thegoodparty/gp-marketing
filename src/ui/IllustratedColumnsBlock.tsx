import type { ReactNode } from 'react';

import { cn, tv } from './_lib/utils.ts';
import type { SanityImage } from './types.ts';
import { Container } from './Container.tsx';
import { HeaderBlock, type HeaderBlockProps } from './HeaderBlock.tsx';
import { IconResolver } from './IconResolver.tsx';
import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { ResponsiveImage } from './ResponsiveImage.tsx';
import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		wrapper: 'flex flex-col gap-6 md:gap-20',
		// Figma draws the heading 48px on desktop and 32px on mobile; heading-lg ramps
		// 40 → 48, so the phone end is pulled down to heading-md the way the editorial block does.
		header: '[&_h2]:max-md:text-heading-md',
		// Stacked columns are centred with a hairline between them, 48px clear on either side
		// (the mobile frame: 24px column padding plus the 24px gap). Once they sit in a row the
		// hairline turns vertical and sits on every column that is not first in its row, so a
		// wrapped second row still divides correctly.
		grid: 'grid grid-cols-1 [&>*]:border-black/12',
		column: 'flex flex-col items-center gap-2 p-6 text-center',
		illustration: 'relative size-28 shrink-0',
		body: 'flex w-full flex-col gap-2',
		description: 'text-neutral-600',
		// mt-auto pins the link to the foot of the column, so every link in a row shares a
		// baseline however many lines the sentences above it take.
		link: 'mt-auto text-info-500 hover:text-info-600 hover:opacity-100 focus:ring-info-500/30 h-10! py-2.5',
	},
	variants: {
		backgroundColor: {
			cream: { base: 'bg-goodparty-cream text-midnight-900' },
			midnight: { base: 'bg-midnight-900 text-white', description: 'text-neutral-300' },
		},
		columns: {
			'2': {
				grid: 'max-md:[&>*+*]:mt-6 max-md:[&>*+*]:border-t max-md:[&>*+*]:pt-12 md:grid-cols-2 md:gap-y-4 md:[&>*:not(:nth-child(2n+1))]:border-l',
				column: 'md:items-start md:gap-6 md:text-left',
			},
			'3': {
				grid: 'max-lg:[&>*+*]:mt-6 max-lg:[&>*+*]:border-t max-lg:[&>*+*]:pt-12 lg:grid-cols-3 lg:gap-y-4 lg:[&>*:not(:nth-child(3n+1))]:border-l',
				column: 'lg:items-start lg:gap-6 lg:text-left',
			},
			'4': {
				grid: 'max-lg:[&>*+*]:mt-6 max-lg:[&>*+*]:border-t max-lg:[&>*+*]:pt-12 lg:grid-cols-4 lg:gap-y-4 lg:[&>*:not(:nth-child(4n+1))]:border-l',
				column: 'lg:items-start lg:gap-6 lg:text-left',
			},
		},
	},
	compoundVariants: [
		{
			backgroundColor: 'midnight',
			className: { grid: '[&>*]:border-white/20' },
		},
	],
});

export type IllustratedColumnProps = {
	key?: string;
	image?: SanityImage;
	imageAlt?: string;
	title?: string;
	description?: ReactNode;
	link?: ComponentButtonProps;
};

export type IllustratedColumnsBlockProps = {
	className?: string;
	backgroundColor?: 'cream' | 'midnight';
	/** How many columns sit in a row once the viewport is wide enough. Items beyond that wrap. */
	columns?: '2' | '3' | '4';
	header?: HeaderBlockProps;
	items: IllustratedColumnProps[];
};

// IconResolver's md size pins a 24px minimum, which would make the 40px link row taller than its text.
const ARROW_ICON_CLASS = 'min-w-4 min-h-4 w-4 h-4 max-w-4 max-h-4';

export function IllustratedColumnsBlock(props: IllustratedColumnsBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const columns = props.columns ?? '3';
	const s = styles({ backgroundColor, columns });

	const items = props.items.filter(item => Boolean(item.title) || Boolean(item.image) || item.description != null);
	if (items.length === 0) {
		return null;
	}

	return (
		<div className={cn(s.base(), props.className)} data-component='IllustratedColumnsBlock' data-columns={columns}>
			<Container size='xl'>
				<div className={s.wrapper()}>
					{props.header && <HeaderBlock {...props.header} backgroundColor={backgroundColor} layout='center' className={s.header()} />}
					<ul className={s.grid()}>
						{items.map((item, index) => (
							<li key={item.key ?? index} className={s.column()} data-component='IllustratedColumn'>
								{item.image && (
									<div className={s.illustration()}>
										<ResponsiveImage image={item.image} alt={item.imageAlt ?? ''} objectFit='contain' maxWidth={224} aspectRatio='1' />
									</div>
								)}
								<div className={s.body()}>
									{item.title && (
										<Text as='h3' styleType='subtitle-1'>
											{item.title}
										</Text>
									)}
									{item.description && (
										<Text as='div' styleType='body-2' className={s.description()}>
											{item.description}
										</Text>
									)}
								</div>
								{item.link && (
									<ComponentButton
										{...item.link}
										className={cn(s.link(), item.link.className)}
										buttonProps={{ ...(item.link.buttonProps ?? {}), styleType: 'min-ghost', styleSize: 'md' }}
										iconRight={<IconResolver icon='arrow-up-right' className={ARROW_ICON_CLASS} />}
									/>
								)}
							</li>
						))}
					</ul>
				</div>
			</Container>
		</div>
	);
}
