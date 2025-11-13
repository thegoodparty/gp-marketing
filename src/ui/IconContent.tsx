import type { ReactNode } from 'react';
import type { iconColorValues } from '~/ui/_lib/designTypesStore';
import { cn, tv } from '~/ui/_lib/utils';
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
	className?: string;
	title?: string;
	copy?: ReactNode;
	icon?: string;
	color?: Exclude<(typeof iconColorValues)[number], 'mixed'>;
};

export function IconContent(props: IconContentProps) {
	const color = props.color ?? 'red';
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
		</div>
	);
}
