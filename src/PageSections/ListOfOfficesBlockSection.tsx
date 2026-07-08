'use client';

import { stegaClean } from 'next-sanity';
import type { Field_blockColorCreamMidnight } from 'sanity.types';

import { formatElectionDateFromApi } from '~/lib/electionsHelpers';
import type { TokenMap } from '~/lib/resolveTokens';
import { resolveSectionText } from '~/lib/resolveSectionText';
import type { Sections, SectionOverrides } from '~/PageSections';
import { ListOfOfficesBlock, type OfficeItem } from '~/ui/ListOfOfficesBlock';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { useElectionsLandingSearch } from '~/ui/ElectionsLandingSearchContext';

type Props = Extract<Sections, { _type: 'component_listOfOfficesBlock' }> & {
	officesOverride?: SectionOverrides['component_listOfOfficesBlock'];
	tokens?: TokenMap;
};

export function ListOfOfficesBlockSection(props: Props) {
	const { officesOverride, tokens, ...section } = props;
	const search = useElectionsLandingSearch();
	const bgValue = section.listOfOfficesBlockDesignSettings?.field_blockColorCreamMidnight;
	const backgroundColor = bgValue ? resolveBg(stegaClean(bgValue) as Field_blockColorCreamMidnight) : 'cream';

	const offices: OfficeItem[] =
		officesOverride?.offices ??
		(section.list_offices?.map((office, index) => ({
			id: office._key || `office-${index}`,
			type: stegaClean(office.field_type) || 'STATE',
			position: stegaClean(office.field_position) || '',
			nextElectionDate: office.field_nextElectionDate
				? formatElectionDateFromApi(office.field_nextElectionDate)
				: '',
			href: stegaClean(office.field_href) || undefined,
		})) ?? []);

	const availableYears =
		officesOverride?.availableYears ??
		(section.field_availableYears && section.field_availableYears.length > 0
			? section.field_availableYears
					.map(year => stegaClean(year))
					.filter((year): year is number => typeof year === 'number')
			: undefined);

	const defaultYear =
		officesOverride?.defaultYear ??
		(section.field_defaultYear ? stegaClean(section.field_defaultYear) : undefined);

	return (
		<section
			id={stegaClean(section.componentSettings?.field_anchorId)}
			data-section='List of Offices Block'
		>
			<ListOfOfficesBlock
				backgroundColor={backgroundColor}
				heading={resolveSectionText(officesOverride?.heading ?? stegaClean(section.field_heading), tokens)}
				headline={resolveSectionText(officesOverride?.headline ?? stegaClean(section.field_headline), tokens)}
				defaultYear={defaultYear}
				availableYears={availableYears}
				offices={offices}
				searchQuery={search?.searchQuery}
				onYearChange={() => search?.setSearchQuery('')}
			/>
		</section>
	);
}
