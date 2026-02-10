'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';

import { cn, tv } from './_lib/utils.ts';
import { Container } from './Container.tsx';
import { Text } from './Text.tsx';
import { Media } from './Media.tsx';
import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { IconResolver } from './IconResolver.tsx';
import { Logo } from '~/sanity/utils/Logo.tsx';
import type { SanityImage } from './types.ts';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';

const styles = tv({
	slots: {
		base: 'relative bg-midnight-900',
		wrapper: 'relative',
		media: 'absolute inset-0 [&>div]:h-full [&>div]:w-full after:absolute after:inset-0 after:z-0',
		content: 'relative z-1 flex flex-col gap-6 py-16 px-4 text-center text-white md:items-center lg:min-h-[36rem] lg:justify-center',
		logo: 'flex justify-center',
		logoImage: 'h-12 w-auto',
		textContainer: 'flex flex-col gap-3 md:gap-4 max-w-[50rem] mx-auto',
		searchContainer: 'flex flex-col gap-4 w-full max-w-md mx-auto sm:flex-row sm:items-center',
		selectWrapper: 'relative w-full',
		select: [
			'w-full appearance-none rounded-lg border border-black/30 bg-white px-4 py-3 pr-10',
			'text-black placeholder:text-black/70',
			'focus:border-black focus:outline-none focus:ring-2 focus:ring-black/30',
			'cursor-pointer font-secondary text-[0.875rem]',
		],
		selectIcon: 'absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-black',
		buttons: 'flex flex-wrap gap-4 justify-center',
	},
	variants: {
		backgroundColor: {
			cream: {
				base: 'bg-goodparty-cream',
				content: 'text-black',
				media: 'after:bg-white/20',
				select: 'border-black/30 bg-black/5 text-black placeholder:text-black/70 focus:border-black focus:ring-black/30',
				selectIcon: 'text-black',
			},
			midnight: {
				base: 'bg-midnight-900',
				content: 'text-white',
				media: 'after:bg-[#0A0A0A]/60',
			},
		},
	},
});

export type StateOption = {
	value: string;
	label: string;
};

export type ElectionsSearchHeroProps = {
	className?: string;
	showLogo?: boolean;
	logoImage?: SanityImage;
	headerText?: string;
	bodyCopy?: ReactNode;
	cta?: ComponentButtonProps;
	backgroundImage?: SanityImage | string;
	backgroundColor?: (typeof backgroundTypeValues)[number];
	states?: StateOption[];
	defaultStateValue?: string;
	onStateChange?: (stateValue: string) => void;
	onSearch?: (stateValue: string) => void;
};

export function ElectionsSearchHero(props: ElectionsSearchHeroProps) {
	const backgroundImage = props.backgroundImage ?? '/images/unites-states.svg';
	const hasBackgroundImage = true;
	const isStaticImage = typeof backgroundImage === 'string';
	const isDefaultImage = props.backgroundImage === undefined;

	const [selectedState, setSelectedState] = useState(props.defaultStateValue ?? '');

	const { base, wrapper, media, content, logo, textContainer, searchContainer, selectWrapper, select, selectIcon, buttons } =
		styles({ backgroundColor: undefined });

	const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value;
		setSelectedState(value);
		props.onStateChange?.(value);
	};

	const handleSearch = () => {
		if (selectedState) {
			props.onSearch?.(selectedState);
		}
	};

	return (
		<article className={cn(base(), props.className)} data-component='ElectionsSearchHero'>
			<Container size='unset'>
				<div className={wrapper()}>
					{hasBackgroundImage && (
						<div className={media()}>
							{isStaticImage ? (
								<img 
									src={backgroundImage} 
									alt="" 
									aria-hidden="true"
									className={cn("h-full w-full object-cover")} 
								/>
							) : (
								<Media image={backgroundImage} objectFit='cover' />
							)}
						</div>
					)}
					<div className={content()}>
						{props.showLogo && (
							<div className={logo()}>
								{props.logoImage ? (
									<Media image={props.logoImage} className='h-12 w-auto' />
								) : (
									<Logo width={96} height={72} />
								)}
							</div>
						)}
						<div className={textContainer()}>
							{props.headerText && (
								<Text as='h1' styleType='heading-lg'>
									{props.headerText}
								</Text>
							)}
							{props.bodyCopy && (
								<Text styleType='body-1' className='max-w-[40rem] mx-auto'>
									{props.bodyCopy}
								</Text>
							)}
						</div>
						<div className={searchContainer()}>
							<div className={selectWrapper()}>
								<select
									className={select()}
									value={selectedState}
									onChange={handleStateChange}
									aria-label='Select a state'
									style={{ color: 'black' }}
								>
									<option value=''>Select state</option>
									{props.states?.map(state => (
										<option key={state.value} value={state.value}>
											{state.label}
										</option>
									))}
								</select>
								<IconResolver icon='chevron-down' className={selectIcon()} />
							</div>
							{props.cta && (
								<ComponentButton
									{...props.cta}
									buttonType='button'
									onClick={handleSearch}
									className='w-full sm:w-auto'
								/>
							)}
						</div>
						{!props.cta && (
							<div className={buttons()}>
								<ComponentButton
									buttonType='button'
									label='Search Elections'
									buttonProps={{ styleType: 'primary' }}
									onClick={handleSearch}
								/>
							</div>
						)}
					</div>
				</div>
			</Container>
		</article>
	);
}
