import Link from 'next/link';

import { cn, tv } from './_lib/utils.ts';
import { IconResolver } from './IconResolver.tsx';
import { btnStyles } from './Inputs/Button.tsx';
import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		base: 'group flex h-full min-h-[23.375rem] flex-col rounded-3xl bg-midnight-900 py-6 text-white transition-all hover:bg-midnight-800',
		content: 'flex w-full flex-col items-center gap-4',
		iconWrapper: 'flex size-20 items-center justify-center rounded-full bg-lavender-200',
		stateIcon: 'size-12 object-contain',
		text: 'flex w-full flex-col gap-2 text-center',
		// The arrow renders at Figma's 16px rather than IconResolver's 24px default,
		// which needs the min/max pair overridden too.
		arrow: 'size-4 min-w-4 min-h-4 max-w-4 max-h-4',
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
	const { base, content, iconWrapper, stateIcon, text, arrow } = styles();
	const { base: button } = btnStyles({ type: 'ghost-inverse', size: 'lg', iconOnly: false });
	const stateAbbr = props.stateAbbreviation?.toLowerCase() ?? '';

	return (
		<Link href={props.href} className={cn(base(), props.className)} data-component='LocationCard'>
			<div className={content()}>
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
				<div className={text()}>
					<Text as='span' styleType='subtitle-1'>
						{props.cityName}, {props.stateAbbreviation}
					</Text>
					{typeof props.openElectionsCount === 'number' && (
						<>
							<Text as='span' styleType='text-7xl' className='font-semibold'>
								{props.openElectionsCount}
							</Text>
							<Text as='span' styleType='body-1'>
								Open Elections
							</Text>
						</>
					)}
				</div>
				{/* Looks like the Figma secondary button, but the whole card is the link,
				    so it must not be an interactive element of its own. */}
				<span className={cn(button(), 'font-secondary')}>
					View elections
					<IconResolver icon='arrow-up-right' className={arrow()} />
				</span>
			</div>
		</Link>
	);
}
