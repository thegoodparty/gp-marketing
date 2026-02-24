import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';

import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';

import { LocationFactsBlock } from '~/ui/LocationFactsBlock';
import { RichData } from '~/ui/RichData';

/**
 * Mapping of fact types to their display labels
 */
const factTypeLabels: Record<string, string> = {
	'largest-city': 'Largest City',
	population: 'Population',
	density: 'Density (per sq mi)',
	'median-income': 'Median Income',
	'unemployment-rate': 'Unemployment Rate',
	'average-home-value': 'Average Home Value',
};

/**
 * Placeholder values for fact types
 * In production, these would be fetched from an external data source based on location
 */
const getFactValue = (factType: string): string => {
	// This is a placeholder implementation
	// In production, this would fetch real data based on the location context
	const placeholders: Record<string, string> = {
		'largest-city': 'City Name',
		population: '0',
		density: '0',
		'median-income': '$0',
		'unemployment-rate': '0%',
		'average-home-value': '$0',
	};
	return placeholders[factType] ?? 'N/A';
};

export function LocationFactsBlockSection(section: Extract<Sections, { _type: 'component_locationFactsBlock' }>) {
	const backgroundColor = section.locationFactsBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.locationFactsBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	// Get fact types from schema and build cards
	const factTypes = section.locationFactsBlockCards?.list_factTypes ?? [];
	const factsCards = factTypes.map(factType => {
		const cleanFactType = stegaClean(factType) ?? '';
		return {
			factType: cleanFactType,
			label: factTypeLabels[cleanFactType] ?? cleanFactType,
			value: getFactValue(cleanFactType),
		};
	});

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Location Facts Block'>
			<LocationFactsBlock
				backgroundColor={backgroundColor}
				header={{
					title: section.locationFactsBlockHeader?.field_title,
					label: section.locationFactsBlockHeader?.field_label,
					caption: section.locationFactsBlockHeader?.field_caption,
					copy: <RichData value={section.locationFactsBlockHeader?.block_summaryText} />,
					backgroundColor,
					buttons: transformButtons(section.locationFactsBlockHeader?.list_buttons),
					textSize: resolveTextSize(section.locationFactsBlockHeader?.field_textSize),
				}}
				factsCards={factsCards}
			/>
		</section>
	);
}
