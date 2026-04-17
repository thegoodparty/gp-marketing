import type { ReactNode } from 'react';

import { cn, tv } from './_lib/utils.ts';
import { Container } from './Container.tsx';
import { Text } from './Text.tsx';
import { IconWrapper } from './IconResolver.tsx';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';

const styles = tv({
	slots: {
		base: 'py-6 md:py-20',
		content: 'flex flex-col gap-6',
		headline: '',
		bodyCopy: 'text-white/80 max-w-[50rem]',
		searchWrapper: 'w-full max-w-[28rem] mt-2',
		searchContainer: 'relative w-full',
		searchIcon: 'absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 pointer-events-none',
		searchInput:
			'w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all font-secondary text-[14px] font-normal leading-[20px] overflow-hidden text-ellipsis',
	},
	variants: {
		backgroundColor: {
			cream: {
				base: 'bg-goodparty-cream',
				bodyCopy: 'text-neutral-700',
				searchInput:
					'bg-neutral-100 border-neutral-300 text-neutral-900 placeholder:text-neutral-500 focus:ring-blue-500/30 focus:border-blue-500/40',
				searchIcon: 'text-neutral-500',
			},
			midnight: {
				base: 'bg-midnight-900 text-white',
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
	},
});

export type LocationLevel = 'state' | 'county' | 'city';

export type LocationLandingPageHeroProps = {
	className?: string;
	locationLevel: LocationLevel;
	stateName: string;
	countyName?: string;
	cityName?: string;
	bodyCopy?: ReactNode;
	backgroundColor?: (typeof backgroundTypeValues)[number];
	searchPlaceholder?: string;
	textAlign?: 'left' | 'center' | 'right';
	/** When provided with onChange, the search input is controlled. */
	value?: string;
	onChange?(value: string): void;
};

function buildHeadline(props: LocationLandingPageHeroProps): string {
	const { locationLevel, stateName, countyName, cityName } = props;

	switch (locationLevel) {
		case 'city':
			return cityName ? `${cityName}, ${stateName}` : stateName;
		case 'county':
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

	const levelText = locationLevel === 'state' ? 'state' : locationLevel === 'county' ? 'county' : 'city';
	return `Explore elections in this ${levelText}`;
}

export function LocationLandingPageHero(props: LocationLandingPageHeroProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const textAlign = props.textAlign ?? 'left';
	const headline = buildHeadline(props);
	const bodyCopyText = buildBodyCopy(props);
	const searchPlaceholder = props.searchPlaceholder ?? 'Search elections by county and city';

	const { base, content, headline: headlineStyle, bodyCopy, searchWrapper, searchContainer, searchIcon, searchInput } = styles({ backgroundColor, textAlign });

	return (
		<section className={cn(base(), props.className)} data-component='LocationLandingPageHero'>
			<Container size='xl'>
				<div className={content()}>
					<div className='flex flex-col gap-3 md:gap-4'>
						<Text as='h1' styleType='heading-xl' className={headlineStyle()}>
							{headline}
						</Text>
						{bodyCopyText && (
							<Text styleType='body-1' className={bodyCopy()}>
								{bodyCopyText}
							</Text>
						)}
					</div>
					<div className={searchWrapper()}>
						<div className={searchContainer()}>
							<IconWrapper code='search' className={searchIcon()} />
							<input
								type='search'
								placeholder={searchPlaceholder}
								className={searchInput()}
								aria-label='Search elections'
								{...(props.value !== undefined && props.onChange
									? { value: props.value, onChange: (e: React.ChangeEvent<HTMLInputElement>) => props.onChange?.(e.target.value) }
									: {})}
							/>
						</div>
					</div>
				</div>
			</Container>
		</section>
	);
}
