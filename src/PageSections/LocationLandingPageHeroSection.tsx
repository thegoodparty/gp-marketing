'use client';

import { stegaClean } from 'next-sanity';

import type { SectionOverrides, Sections } from '~/PageSections';
import { resolveSectionText } from '~/lib/resolveSectionText';
import type { TokenMap } from '~/lib/resolveTokens';
import { LocationLandingPageHero } from '~/ui/LocationLandingPageHero';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { useElectionsLandingSearch } from '~/ui/ElectionsLandingSearchContext';

type Props = Extract<Sections, { _type: 'component_locationLandingPageHero' }> & {
	locationOverride?: SectionOverrides['component_locationLandingPageHero'];
	tokens?: TokenMap;
};

export function LocationLandingPageHeroSection(props: Props) {
	const { locationOverride, tokens, ...section } = props;
	const search = useElectionsLandingSearch();
	const backgroundColor = section.locationLandingPageHeroDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.locationLandingPageHeroDesignSettings.field_blockColorCreamMidnight))
		: 'midnight';

	const locationLevel = locationOverride?.locationLevel ?? 'state';
	const stateName = locationOverride?.stateName ?? 'State Name';
	const countyName = locationOverride?.countyName;
	const cityName = locationOverride?.cityName;
	const bodyCopy =
		resolveSectionText(locationOverride?.bodyCopy, tokens) ??
		resolveSectionText(section.locationLandingPageHeroContent?.field_bodyCopy, tokens);
	const searchPlaceholder =
		locationOverride?.searchPlaceholder ??
		section.locationLandingPageHeroContent?.field_searchPlaceholder ??
		'Search positions';

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Location Landing Page Hero'>
			<LocationLandingPageHero
				backgroundColor={backgroundColor}
				locationLevel={locationLevel}
				stateName={stateName}
				countyName={countyName}
				cityName={cityName}
				bodyCopy={bodyCopy}
				searchPlaceholder={searchPlaceholder}
				value={search?.searchQuery}
				onChange={search?.setSearchQuery}
			/>
		</section>
	);
}
