import type { ReactNode } from 'react';

import { cn, tv } from './_lib/utils.ts';
import { Container } from './Container.tsx';
import { Text } from './Text.tsx';
import { Stat, type StatProps } from './Stat.tsx';

const styles = tv({
	slots: {
		base: 'py-6 md:py-20',
		layout: 'grid gap-8 lg:items-center lg:gap-20',
		content: 'flex flex-col gap-2 max-w-[39.5rem]',
		headline: '',
		bodyCopy: 'text-white/80',
		stats: 'grid gap-6 sm:grid-cols-2 lg:gap-5',
	},
	variants: {
		backgroundColor: {
			cream: {
				base: 'bg-goodparty-cream',
				bodyCopy: 'text-neutral-700',
			},
			midnight: {
				base: 'bg-midnight-900',
				content: 'text-white',
				bodyCopy: 'text-white/80',
			},
		},
		textAlign: {
			left: {
				content: 'text-left items-start',
			},
			center: {
				content: 'text-center justify-center md:items-center',
			},
			right: {
				content: 'text-right items-end',
			},
		},
		hasStats: {
			true: {
				layout: 'lg:grid-cols-[minmax(0,1fr)_32.75rem]',
			},
		},
	},
});

export type LocationLevel = 'state' | 'county' | 'city' | 'district';

export type LocationLandingPageHeroProps = {
	className?: string;
	locationLevel: LocationLevel;
	stateName: string;
	countyName?: string;
	cityName?: string;
	bodyCopy?: ReactNode;
	backgroundColor?: 'cream' | 'midnight';
	textAlign?: 'left' | 'center' | 'right';
	stats?: StatProps[];
};

function buildHeadline(props: LocationLandingPageHeroProps): string {
	const { locationLevel, stateName, countyName, cityName } = props;

	switch (locationLevel) {
		case 'city':
			return cityName ? `${cityName}, ${stateName}` : stateName;
		case 'county':
		case 'district':
			return countyName ? `${countyName}, ${stateName}` : stateName;
		case 'state':
		default:
			return stateName;
	}
}

function buildBodyCopy(props: LocationLandingPageHeroProps): string {
	const { locationLevel, bodyCopy } = props;

	if (bodyCopy && typeof bodyCopy === 'string') {
		return bodyCopy;
	}

	return `Explore elections in this ${locationLevel}`;
}

export function LocationLandingPageHero(props: LocationLandingPageHeroProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const textAlign = props.textAlign ?? 'left';
	const headline = buildHeadline(props);
	const bodyCopyText = buildBodyCopy(props);
	const stats = props.stats ?? [];

	const {
		base,
		layout,
		content,
		headline: headlineStyle,
		bodyCopy,
		stats: statsStyle,
	} = styles({ backgroundColor, textAlign, hasStats: stats.length > 0 });

	return (
		<section className={cn(base(), props.className)} data-component='LocationLandingPageHero'>
			<Container size='xl'>
				<div className={layout()}>
					<div className={content()}>
						<Text as='h1' styleType='heading-xl' className={headlineStyle()}>
							{headline}
						</Text>
						{bodyCopyText && (
							<Text styleType='body-2' className={bodyCopy()}>
								{bodyCopyText}
							</Text>
						)}
					</div>
					{stats.length > 0 && (
						<div className={statsStyle()}>
							{stats.map((stat, index) => (
								<Stat key={stat._key ?? `location-hero-stat-${index}`} {...stat} size='compact' />
							))}
						</div>
					)}
				</div>
			</Container>
		</section>
	);
}
