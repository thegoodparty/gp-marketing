import type { ReactNode } from 'react';

import { cn, tv } from './_lib/utils.ts';
import { backgroundTypeValues, type componentColorValues } from './_lib/designTypesStore.ts';

import { Text } from './Text.tsx';
import { IconResolver } from '~/ui/IconResolver.tsx';

const styles = tv({
	slots: {
		base: 'bg-white relative flex flex-col gap-6 px-6 py-8 rounded-lg md:gap-12 md:p-12',
		icon: 'rounded-full bg-white h-12 w-12 min-w-12 flex items-center justify-center',
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
		},
	},
});

export type ComparisonTableCardProps = {
	backgroundColor?: (typeof backgroundTypeValues)[number];
	className?: string;
	color?: Exclude<(typeof componentColorValues)[number], 'inverse' | 'midnight' | 'cream'>;
	list?: { title?: ReactNode; icon?: string }[];
	title?: string;
};

export function ComparisonTableCard(props: ComparisonTableCardProps) {
	const color = props.color ?? 'red';
	const { base, icon } = styles({ color });

	return (
		<article className={cn(base(), props.className)} data-component='ComparisonTableCard'>
			{props.title && (
				<Text as='h3' styleType='heading-sm'>
					{props.title}
				</Text>
			)}
			{props.list && props.list.length > 0 && (
				<ul className='flex flex-col'>
					{props.list.map(
						(item, index) =>
							item.title && (
								<Text
									as='li'
									className='flex items-center py-6 gap-5 border-b border-neutral-200 first:pt-0 last:pb-0 last:border-none'
									key={index}
									styleType='body-2'
								>
									{item.icon && (
										<div className={icon()}>
											<IconResolver
												icon={item.icon}
												className={'min-w-[1.38rem] min-h-[1.38rem] w-[1.38rem] h-[1.38rem] max-w-[1.38rem] max-h-[1.38rem]'}
											/>
										</div>
									)}
									{item.title}
								</Text>
							),
					)}
				</ul>
			)}
		</article>
	);
}
