'use client';

import { useState } from 'react';
import type { LocationLandingPageHeroProps } from './LocationLandingPageHero.tsx';
import type { ListOfOfficesBlockProps } from './ListOfOfficesBlock.tsx';
import { LocationLandingPageHero } from './LocationLandingPageHero.tsx';
import { ListOfOfficesBlock } from './ListOfOfficesBlock.tsx';

export type ElectionsLandingWithSearchProps = {
	heroProps: LocationLandingPageHeroProps;
	listProps: ListOfOfficesBlockProps;
};

export function ElectionsLandingWithSearch(props: ElectionsLandingWithSearchProps) {
	const [searchQuery, setSearchQuery] = useState('');

	return (
		<>
			<LocationLandingPageHero
				{...props.heroProps}
				searchPlaceholder="Search positions"
				value={searchQuery}
				onChange={setSearchQuery}
			/>
			<ListOfOfficesBlock
				{...props.listProps}
				searchQuery={searchQuery}
				onYearChange={year => {
					setSearchQuery('');
					props.listProps.onYearChange?.(year);
				}}
			/>
		</>
	);
}
