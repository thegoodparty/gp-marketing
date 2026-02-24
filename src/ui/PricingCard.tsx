import type { ReactNode } from 'react';

import { cn, tv } from './_lib/utils.ts';
import { backgroundTypeValues, type componentColorValues } from './_lib/designTypesStore.ts';
import { resolveInverseButtonStyleType } from './_lib/resolveButtonStyleType.ts';

import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { Text } from './Text.tsx';
import { IconResolver } from './IconResolver.tsx';
import { Logo } from '~/sanity/utils/Logo.tsx';

const styles = tv({
	slots: {
		base: 'flex flex-col gap-4 justify-between p-6 rounded-lg w-full lg:w-[400px]',
	},
	variants: {
		color: {
			red: 'bg-red-100',
			waxflower: 'bg-waxflower-100',
			'bright-yellow': 'bg-bright-yellow-200',
			'halo-green': 'bg-halo-green-100',
			blue: 'bg-blue-100',
			lavender: 'bg-lavender-100',
			midnight: 'bg-midnight-900 text-white border border-white/30',
			cream: {
				base: '',
			},
		},
	},
});

export type PricingCardProps = {
	backgroundColor?: (typeof backgroundTypeValues)[number];
	billingPeriod?: string;
	hideIcon: boolean;
	button?: ComponentButtonProps;
	className?: string;
	color?: Exclude<(typeof componentColorValues)[number], 'inverse'>;
	list?: ReactNode[];
	listTitle?: string;
	name?: string;
	price?: string;
};

export function PricingCard(props: PricingCardProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const color = props.color ?? 'red';
	const { base } = styles({ color });
	const resolvedStyle = resolveInverseButtonStyleType(props.button?.buttonProps?.styleType ?? 'primary', backgroundColor, color);

	return (
		<article className={cn(base(), props.className)} data-component='PricingCard'>
			<div className='flex flex-col gap-4 justify-between'>
				<div className='flex justify-between items-center'>
					{props.name && (
						<Text as='span' styleType='subtitle-1'>
							{props.name}
						</Text>
					)}

					{!props.hideIcon && <Logo width={36} height={30} />}
				</div>
				{props.price && (
					<div>
						{props.price && (
							<Text as='span' styleType='heading-lg'>
								{props.price}
							</Text>
						)}
						{props.billingPeriod && (
							<Text as='span' className='font-bold ml-2 font-secondary' styleType='text-md'>
								{props.billingPeriod}
							</Text>
						)}
					</div>
				)}
				<hr className='h-[1px] bg-black/10 border-none' />
				{props.list && props.list.length > 0 && (
					<div className='flex flex-col gap-4'>
						{props.listTitle && (
							<Text as='strong' className='font-bold font-secondary' styleType='text-md'>
								{props.listTitle}
							</Text>
						)}
						<ul className='flex flex-col gap-2'>
							{props.list.map((item, index) => (
								<Text as='li' className='flex gap-2 py-1' key={index} styleType='body-2'>
									<div className='h-6 w-6'>
										<IconResolver icon='check' />
									</div>
									{item}
								</Text>
							))}
						</ul>
					</div>
				)}
			</div>
			{props.button && (
				<ComponentButton
					{...props.button}
					className='w-full'
					buttonProps={{ ...(props.button.buttonProps ?? {}), styleType: resolvedStyle }}
				/>
			)}
		</article>
	);
}
