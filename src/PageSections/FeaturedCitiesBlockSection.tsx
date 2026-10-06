import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';
import type { FeaturedCityCard } from '~/types/elections';
import type { LocationCardProps } from '~/ui/LocationCard';

import {
	COUNTY_MTFCC,
	FEATURED_CITIES_COUNT,
	getMostElections,
	getPlacesByState,
} from '~/lib/electionsApi';
import { transformButtons } from '~/lib/buttonTransformer';

import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';

import { FeaturedCitiesBlock } from '~/ui/FeaturedCitiesBlock';
import { RichData } from '~/ui/RichData';

async function resolveCityHref(slug: string): Promise<string> {
	const parts = slug.split('/');
	if (parts.length === 2 && parts[0]) {
		const counties = await getPlacesByState({
			state: parts[0].toUpperCase(),
			mtfcc: COUNTY_MTFCC,
		});
		if (counties.length === 1) {
			const countySegment = counties[0]?.slug.split('/').pop() ?? parts[0];
			return `/elections/${parts[0]}/${countySegment}/${parts[1]}`;
		}
	}
	return `/elections/${slug}`;
}

function featuredCityToLocationCard(
	city: { name: string; slug: string; race_count: number },
	href: string,
): LocationCardProps {
	const stateCode = city.slug.split('/')[0]?.toUpperCase() ?? '';
	return {
		cityName: city.name,
		stateAbbreviation: stateCode,
		openElectionsCount: city.race_count,
		href,
	};
}

/**
 * Cities for a page that hands none in: the national list, which is what
 * /elections and any landing page carrying this block have always shown. Location
 * pages never reach this — they pass their own scoped cities through the override.
 */
async function getNationalLocationCards(): Promise<LocationCardProps[]> {
	const apiCities = await getMostElections(FEATURED_CITIES_COUNT);
	if (apiCities.length === 0) return [];
	const hrefs = await Promise.all(apiCities.map(async c => resolveCityHref(c.slug)));
	return apiCities.map((city, i) => featuredCityToLocationCard(city, hrefs[i] ?? `/elections/${city.slug}`));
}

export async function FeaturedCitiesBlockSection(
	section: Extract<Sections, { _type: 'component_featuredCitiesBlock' }> & { citiesOverride?: FeaturedCityCard[] },
) {
	const backgroundColor = section.featuredCitiesBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.featuredCitiesBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	// An override of [] is a location page saying "this place has no cities to
	// feature", which must hide the block rather than fall back to national ones.
	const sanityCards: LocationCardProps[] =
		section.featuredCitiesBlockCards?.list_locationCards?.map(card => ({
			cityName: card.field_cityName ?? '',
			stateAbbreviation: card.field_stateAbbreviation ?? '',
			href: card.field_href ?? '#',
		})) ?? [];
	const nationalCards = section.citiesOverride ? [] : await getNationalLocationCards();
	const locationCards: LocationCardProps[] = section.citiesOverride
		? section.citiesOverride.map(city => ({
				cityName: city.name,
				stateAbbreviation: city.stateAbbreviation,
				openElectionsCount: city.openElectionsCount,
				href: city.href,
			}))
		: nationalCards.length > 0
			? nationalCards
			: sanityCards;

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Featured Cities Block'>
			<FeaturedCitiesBlock
				backgroundColor={backgroundColor}
				header={{
					title: section.featuredCitiesBlockHeader?.field_title,
					label: section.featuredCitiesBlockHeader?.field_label,
					caption: section.featuredCitiesBlockHeader?.field_caption,
					copy: <RichData value={section.featuredCitiesBlockHeader?.block_summaryText} />,
					backgroundColor,
					buttons: transformButtons(section.featuredCitiesBlockHeader?.list_buttons),
					textSize: resolveTextSize(section.featuredCitiesBlockHeader?.field_textSize),
				}}
				locationCards={locationCards}
			/>
		</section>
	);
}
