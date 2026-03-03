import { cn, tv } from './_lib/utils.ts';
import { backgroundTypeValues, type componentColorValues } from './_lib/designTypesStore.ts';
import { resolveInverseButtonStyleType } from './_lib/resolveButtonStyleType.ts';

import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { Text } from './Text.tsx';
import { IconResolver } from './IconResolver.tsx';
import type { ReactNode } from 'react';

const styles = tv({
	slots: {
		base: 'flex flex-col gap-6 p-6 rounded-lg md:gap-8 md:p-8 lg:p-12',
	},
	variants: {
		color: {
			red: {
				base: 'bg-goodparty-red-light',
			},
			waxflower: {
				base: 'bg-waxflower-200',
			},
			'bright-yellow': {
				base: 'bg-bright-yellow-200',
			},
			'halo-green': {
				base: 'bg-halo-green-200',
			},
			blue: {
				base: 'bg-blue-200',
			},
			lavender: {
				base: 'bg-lavender-200',
			},
			midnight: {
				base: 'bg-midnight-900 text-white',
			},
			cream: {
				base: 'bg-goodparty-cream',
			},
		},
	},
});

export type TwoUpCardProps = {
	backgroundColor?: (typeof backgroundTypeValues)[number];
	button?: ComponentButtonProps;
	className?: string;
	color?: Exclude<(typeof componentColorValues)[number], 'inverse'>;
	list?: { title: ReactNode; icon?: string }[];
	title: string;
};

export function TwoUpCard(props: TwoUpCardProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const color = props.color ?? 'red';
	const { base } = styles({ color });
	const resolvedStyle = resolveInverseButtonStyleType(
		props.button?.buttonProps?.styleType ?? 'primary',
		backgroundColor,
		color === 'midnight' || color === 'cream' ? 'inverse' : color,
	);

	return (
		<article className={cn(base(), props.className)} data-component='TwoUpCard'>
			{props.title && (
				<Text as='h3' styleType='heading-sm'>
					{props.title}
				</Text>
			)}
			{props.list && props.list.length > 0 && (
				<ul className='flex flex-col gap-4 h-full'>
					{props.list.map((item, index) => (
						<Text as='li' className='flex gap-4 md:items-center' key={index} styleType='body-2'>
							<div className='rounded-full bg-white min-w-12 h-12 flex items-center justify-center'>
								{item.icon && <IconResolver icon={item.icon} />}
							</div>
							{item.title}
						</Text>
					))}
				</ul>
			)}
			{props.button && (
				<ComponentButton
					{...props.button}
					className='mt-8 md:self-start max-sm:w-full w-fit'
					buttonProps={{ ...(props.button.buttonProps ?? {}), styleType: resolvedStyle }}
				/>
			)}
		</article>
	);
}
