import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';
import { LocationLandingPageHero } from '~/ui/LocationLandingPageHero';
import { resolveBg } from '~/ui/_lib/resolveBg';

// TODO: This component needs location data from the page context or URL
// The location data (level, state, county, city) should be passed from the parent page
// that knows the current location context based on the route (/elections/[state]/[county]/[city])
export function LocationLandingPageHeroSection(section: Extract<Sections, { _type: 'component_locationLandingPageHero' }>) {
	const backgroundColor = section.locationLandingPageHeroDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.locationLandingPageHeroDesignSettings.field_blockColorCreamMidnight))
		: 'midnight';

	// TODO: Get actual location data from page context/props
	// This is placeholder data - needs to be passed from parent page
	const locationData = {
		level: 'state' as const,
		state: 'State Name',
		county: undefined,
		city: undefined,
	};

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Location Landing Page Hero'>
			<LocationLandingPageHero
				backgroundColor={backgroundColor}
				locationLevel={locationData.level}
				stateName={locationData.state}
				countyName={locationData.county}
				cityName={locationData.city}
				bodyCopy={section.locationLandingPageHeroContent?.field_bodyCopy}
				searchPlaceholder={section.locationLandingPageHeroContent?.field_searchPlaceholder}
			/>
		</section>
	);
}
