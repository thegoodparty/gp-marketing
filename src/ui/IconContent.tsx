import type { ReactNode } from 'react';
import type { backgroundTypeValues, iconColorValues } from '~/ui/_lib/designTypesStore';
import { cn, tv } from '~/ui/_lib/utils';
import { resolveButtonStyleType } from '~/ui/_lib/resolveButtonStyleType';
import { ComponentButton, type ComponentButtonProps } from '~/ui/Inputs/Button';
import { IconResolver } from '~/ui/IconResolver';
import { Text } from '~/ui/Text';

const styles = tv({
	slots: {
		base: 'flex flex-col gap-4 items-center text-center p-[1rem]',
		icon: 'rounded-full flex items-center justify-center size-[3rem]',
	},
	variants: {
		color: {
			red: {
				icon: 'bg-goodparty-red-light',
			},
			waxflower: {
				icon: 'bg-waxflower-200',
			},
			'bright-yellow': {
				icon: 'bg-bright-yellow-200',
			},
			'halo-green': {
				icon: 'bg-halo-green-200',
			},
			blue: {
				icon: 'bg-blue-200',
			},
			lavender: {
				icon: 'bg-lavender-200',
			},
			white: {
				icon: 'bg-white',
			},
		},
	},
});

export type IconContentProps = {
	button?: ComponentButtonProps;
	className?: string;
	color?: Exclude<(typeof iconColorValues)[number], 'mixed'>;
	copy?: ReactNode;
	icon?: string;
	title?: string;
	backgroundColor?: (typeof backgroundTypeValues)[number];
};

export function IconContent(props: IconContentProps) {
	const color = props.color ?? 'red';
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, icon } = styles({ color });

	return (
		<div className={cn(base(), props.className)} data-component='IconContent'>
			{props.icon && (
				<div className={icon()}>
					<IconResolver icon={props.icon} className='text-midnight-900' />
				</div>
			)}
			{props.title && (
				<Text as='h5' styleType='heading-sm'>
					{props.title}
				</Text>
			)}
			{props.copy && (
				<Text as='div' styleType='body-2'>
					{props.copy}
				</Text>
			)}
			{props.button && (
				<ComponentButton
					{...props.button}
					buttonProps={{
						...(props.button.buttonProps ?? {}),
						styleType: resolveButtonStyleType(props.button.buttonProps?.styleType ?? 'primary', backgroundColor),
					}}
					className='max-sm:w-full'
				/>
			)}
		</div>
	);
}
