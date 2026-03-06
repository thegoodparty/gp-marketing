import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';
import type { LocationCardProps } from '~/ui/LocationCard';

import { getMostElections } from '~/lib/electionsApi';
import { transformButtons } from '~/lib/buttonTransformer';

import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';

import { FeaturedCitiesBlock } from '~/ui/FeaturedCitiesBlock';
import { RichData } from '~/ui/RichData';

function featuredCityToLocationCard(city: { name: string; slug: string; race_count: number }): LocationCardProps {
	const stateCode = city.slug.split('/')[0]?.toUpperCase() ?? '';
	return {
		cityName: city.name,
		stateAbbreviation: stateCode,
		openElectionsCount: city.race_count,
		href: `/elections/${city.slug}`,
	};
}

export async function FeaturedCitiesBlockSection(section: Extract<Sections, { _type: 'component_featuredCitiesBlock' }>) {
	const backgroundColor = section.featuredCitiesBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.featuredCitiesBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	const apiCities = await getMostElections(3);
	const locationCards: LocationCardProps[] =
		apiCities.length > 0
			? apiCities.map(featuredCityToLocationCard)
			: (section.featuredCitiesBlockCards?.list_locationCards?.map(card => ({
					cityName: card.field_cityName ?? '',
					stateAbbreviation: card.field_stateAbbreviation ?? '',
					href: card.field_href ?? '#',
					openElectionsCount: 0,
				})) ?? []);

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
