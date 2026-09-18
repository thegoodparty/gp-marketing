'use client';

import { stegaClean } from 'next-sanity';

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
	const backgroundColor = bgValue ? resolveBg(stegaClean(bgValue)) : 'cream';

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

	/**
	 * The editor's heading wins, with its location tokens resolved — the templates
	 * already carry one ("State Elections in [State]", "City Elections in [City]").
	 * The route's computed heading is the fallback, so a page still has a sensible
	 * heading if the field is ever cleared.
	 */
	const heading =
		resolveSectionText(stegaClean(section.field_heading), tokens) ||
		resolveSectionText(officesOverride?.headline, tokens);

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
				heading={heading}
				defaultYear={defaultYear}
				availableYears={availableYears}
				offices={offices}
				pageLevel={officesOverride?.pageLevel}
				searchQuery={search?.searchQuery}
				onYearChange={() => search?.setSearchQuery('')}
				onLevelChange={() => search?.setSearchQuery('')}
			/>
		</section>
	);
}
