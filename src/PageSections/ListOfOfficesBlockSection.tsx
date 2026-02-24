import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';
import { ListOfOfficesBlock, type OfficeItem } from '~/ui/ListOfOfficesBlock';

type ListOfOfficesBlockSectionProps = Extract<Sections, { _type: 'component_listOfOfficesBlock' }>;

export function ListOfOfficesBlockSection(section: ListOfOfficesBlockSectionProps) {
	// Resolve background color
	const bgValue = section.listOfOfficesBlockDesignSettings?.field_blockColorCreamMidnight;
	const backgroundColor = bgValue
		? stegaClean(bgValue) === 'cream' || stegaClean(bgValue) === 'Cream'
			? 'cream'
			: 'midnight'
		: 'cream';

	// Transform offices from Sanity format to component format
	const offices: OfficeItem[] =
		section.list_offices?.map((office, index) => ({
			id: office._key || `office-${index}`,
			type: stegaClean(office.field_type) || 'STATE',
			position: stegaClean(office.field_position) || '',
			nextElectionDate: office.field_nextElectionDate
				? new Date(office.field_nextElectionDate).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric',
					})
				: '',
			href: stegaClean(office.field_href) || undefined,
		})) || [];

	// Get available years from Sanity or generate default
	const availableYears =
		section.field_availableYears && section.field_availableYears.length > 0
			? section.field_availableYears.map(year => stegaClean(year)).filter((year): year is number => typeof year === 'number')
			: undefined;

	// Get default year
	const defaultYear = section.field_defaultYear ? stegaClean(section.field_defaultYear) : undefined;

	return (
		<section
			id={stegaClean(section.componentSettings?.field_anchorId)}
			data-section="List of Offices Block"
		>
			<ListOfOfficesBlock
				backgroundColor={backgroundColor}
				heading={stegaClean(section.field_heading)}
				headline={stegaClean(section.field_headline)}
				defaultYear={defaultYear}
				availableYears={availableYears}
				offices={offices}
			/>
		</section>
	);
}
