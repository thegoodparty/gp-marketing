'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
	formatPromoCountdown,
	PROMO_BANNER_DISMISSED_STORAGE_KEY,
	promoBannerIsLive,
	promoBannerPrePaintScript,
	promoBannerShowsOn,
} from '~/lib/promoBanner';

import { cn, tv } from './_lib/utils';
import { Container } from './Container';
import { IconResolver } from './IconResolver';
import { ComponentButton, type ComponentButtonProps } from './Inputs/Button';
import { Text } from './Text';

const styles = tv({
	base: 'md:h-(--promo-banner-height) max-md:min-h-(--promo-banner-height) max-md:py-1.5',
	variants: {
		color: {
			red: 'bg-red-100 text-midnight-900',
			waxflower: 'bg-waxflower-100 text-midnight-900',
			'bright-yellow': 'bg-bright-yellow-100 text-midnight-900',
			'halo-green': 'bg-halo-green-100 text-midnight-900',
			blue: 'bg-blue-100 text-midnight-900',
			lavender: 'bg-lavender-100 text-midnight-900',
			midnight: 'bg-midnight-900 text-white',
		},
	},
});

export type PromoBannerColor = keyof typeof styles.variants.color;

export type PromoBannerProps = {
	text: string;
	color?: PromoBannerColor;
	button?: ComponentButtonProps;
	countdownTo?: string | null;
	countdownLabel?: string | null;
	startsAt?: string | null;
	endsAt?: string | null;
	includePaths?: string[];
	excludePaths?: string[];
	dismissKey: string;
};

/** Client-only: the time it shows depends on the visitor's clock, so the server renders nothing and nothing can mismatch. */
const PromoCountdown = (props: { to: string; label?: string | null }) => {
	const [remaining, setRemaining] = useState<string | null>(null);

	useEffect(() => {
		const tick = () => setRemaining(formatPromoCountdown(props.to, Date.now()));
		tick();
		const interval = setInterval(tick, 1000);
		return () => clearInterval(interval);
	}, [props.to]);

	if (remaining === null) return null;

	return (
		<Text as='p' styleType='body-2' className='shrink-0 whitespace-nowrap max-md:col-start-1 max-md:row-start-1' aria-live='off'>
			{props.label && <span className='max-sm:hidden'>{props.label} </span>}
			<span className='font-semibold tabular-nums'>{remaining}</span>
		</Text>
	);
};

export const PromoBanner = (props: PromoBannerProps) => {
	const pathname = usePathname();
	const [hidden, setHidden] = useState(false);
	const { dismissKey, startsAt, endsAt } = props;

	useEffect(() => {
		let dismissed: string | null = null;
		try {
			dismissed = localStorage.getItem(PROMO_BANNER_DISMISSED_STORAGE_KEY);
		} catch {
			dismissed = null;
		}
		setHidden(dismissed === dismissKey || !promoBannerIsLive({ startsAt, endsAt }, Date.now()));
	}, [dismissKey, startsAt, endsAt]);

	if (hidden || !promoBannerShowsOn(pathname ?? '/', { include: props.includePaths, exclude: props.excludePaths })) return null;

	const dismiss = () => {
		try {
			localStorage.setItem(PROMO_BANNER_DISMISSED_STORAGE_KEY, dismissKey);
		} catch {
			// Storage can be blocked in private browsing; the banner still closes for this page view.
		}
		setHidden(true);
	};

	return (
		<>
			<script dangerouslySetInnerHTML={{ __html: promoBannerPrePaintScript({ dismissKey, startsAt, endsAt }) }} />
			<div data-component='PromoBanner' data-promo-banner={dismissKey} className={styles({ color: props.color ?? 'bright-yellow' })}>
				<Container
					size='xl'
					className='flex h-full items-center gap-3 md:justify-center md:gap-4 max-md:grid max-md:grid-cols-[auto_minmax(0,1fr)_auto] max-md:gap-x-3 max-md:gap-y-1.5'
				>
					<span aria-hidden='true' className='hidden h-8 w-8 shrink-0 md:block' />
					{props.countdownTo && <PromoCountdown to={props.countdownTo} label={props.countdownLabel} />}
					<Text
						as='p'
						styleType='body-2'
						className={cn(
							'min-w-0 flex-1 md:flex-initial md:truncate md:text-center max-md:line-clamp-2 max-md:row-start-1',
							props.countdownTo ? 'max-md:col-start-2' : 'max-md:col-span-2',
						)}
					>
						{props.text}
					</Text>
					{props.button && (
						<ComponentButton
							{...props.button}
							className={cn(
								'shrink-0 max-md:row-start-2 max-md:justify-self-start',
								props.countdownTo ? 'max-md:col-start-2' : 'max-md:col-span-2',
							)}
							buttonProps={{ ...props.button.buttonProps, styleSize: 'sm' }}
						/>
					)}
					<button
						type='button'
						aria-label='Dismiss this message'
						onClick={dismiss}
						className='max-md:col-start-3 max-md:row-start-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition hover:bg-current/10 focus-visible:outline-2 focus-visible:outline-current'
					>
						<IconResolver icon='x' className='h-4 w-4 min-h-4 min-w-4' />
					</button>
				</Container>
			</div>
		</>
	);
};
