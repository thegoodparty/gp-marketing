import type { ReactNode } from 'react';

import { cn, tv } from './_lib/utils.ts';
import { Container } from './Container.tsx';
import { Text } from './Text.tsx';
import { Stat, type StatProps } from './Stat.tsx';
import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { IconResolver } from './IconResolver.tsx';
import { resolveButtonStyleType } from './_lib/resolveButtonStyleType.ts';

const styles = tv({
	slots: {
		base: 'py-6 lg:py-16',
		layout: 'grid gap-6 lg:items-center lg:gap-4',
		content: 'flex flex-col',
		headline: '',
		bodyCopy: 'text-white/80 mt-2',
		buttons: 'flex flex-col sm:flex-row gap-4 mt-6 lg:mt-10 w-full sm:w-auto',
		stats: 'grid gap-2 lg:grid-cols-3 lg:gap-4',
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
				layout: 'lg:grid-cols-[minmax(0,1fr)_39.5rem]',
			},
		},
	},
});

export type LocationLevel = 'state' | 'county' | 'city' | 'district';

export type LocationLandingPageHeroProps = {
	className?: string;
	/** The whole headline, as the page phrases it. Falls back to the location name. */
	headline?: string;
	locationLevel: LocationLevel;
	stateName: string;
	countyName?: string;
	cityName?: string;
	bodyCopy?: ReactNode;
	backgroundColor?: 'cream' | 'midnight';
	textAlign?: 'left' | 'center' | 'right';
	stats?: StatProps[];
	buttons?: ComponentButtonProps[];
};

function buildHeadline(props: LocationLandingPageHeroProps): string {
	const { headline, locationLevel, stateName, countyName, cityName } = props;

	if (headline) {
		return headline;
	}

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
	const buttons = props.buttons ?? [];

	const {
		base,
		layout,
		content,
		headline: headlineStyle,
		bodyCopy,
		buttons: buttonsStyle,
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
						{buttons.length > 0 && (
							<div className={buttonsStyle()}>
								{buttons.map((button, index) => (
									<ComponentButton
										key={button._key ?? `location-hero-button-${index}`}
										{...button}
										buttonProps={{
											...button.buttonProps,
											styleType: resolveButtonStyleType(button.buttonProps?.styleType ?? 'secondary', backgroundColor),
											styleSize: button.buttonProps?.styleSize ?? 'md',
										}}
										iconRight={button.iconRight ?? <IconResolver icon='arrow-down' aria-hidden className='w-4 h-4' />}
										className={cn('max-sm:w-full', button.className)}
									/>
								))}
							</div>
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
