import Link from 'next/link';

import { cn, tv } from './_lib/utils.ts';
import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		base: 'group flex flex-col items-center gap-4 rounded-xl bg-midnight-900 p-6 text-center text-white transition-all hover:bg-midnight-800',
		iconWrapper: 'flex h-16 w-16 items-center justify-center rounded-full bg-lavender-200',
		stateIcon: 'h-8 w-8',
		content: 'flex flex-col items-center gap-2',
		cityText: '',
		electionsCount: 'text-text-7xl font-bold tracking-tight md:text-text-6xl',
		electionsLabel: 'text-neutral-400',
		viewLink: 'mt-2 flex items-center gap-1 text-sm text-white/80 transition-colors group-hover:text-white',
		arrow: 'h-4 w-4 transition-transform group-hover:translate-x-0.5',
	},
});

export type LocationCardProps = {
	cityName: string;
	stateAbbreviation: string;
	openElectionsCount?: number;
	href: string;
	className?: string;
};

export function LocationCard(props: LocationCardProps) {
	const { base, iconWrapper, stateIcon, content, cityText, electionsCount, electionsLabel, viewLink, arrow } =
		styles();
	const stateAbbr = props.stateAbbreviation?.toLowerCase() ?? '';

	return (
		<Link href={props.href} className={cn(base(), props.className)} data-component='LocationCard'>
			<div className={iconWrapper()}>
				{stateAbbr && (
					<img
						src={`/icons/states/${stateAbbr}.svg`}
						alt={`${props.stateAbbreviation} state`}
						className={stateIcon()}
						aria-hidden='true'
					/>
				)}
			</div>
			<div className={content()}>
				<Text as='span' styleType='subtitle-2' className={cityText()}>
					{props.cityName}, {props.stateAbbreviation}
				</Text>
				{typeof props.openElectionsCount === 'number' && (
					<>
						<span className={electionsCount()}>{props.openElectionsCount}</span>
						<span className={electionsLabel()}>Open Elections</span>
					</>
				)}
			</div>
			<span className={viewLink()}>
				View elections
				<svg
					className={arrow()}
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
				>
					<path d='M7 17L17 7' />
					<path d='M7 7h10v10' />
				</svg>
			</span>
		</Link>
	);
}
