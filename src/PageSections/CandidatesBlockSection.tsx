import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';

import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';

import { CandidatesBlock } from '~/ui/CandidatesBlock';
import { RichData } from '~/ui/RichData';

export function CandidatesBlockSection(section: Extract<Sections, { _type: 'component_candidatesBlock' }>) {
	const backgroundColor = section.candidatesBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.candidatesBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	const hasFilters = stegaClean(section.candidatesBlockFilterSettings?.field_enableFilters) ?? false;

	// TODO: Replace with actual candidate data source
	// For now, using mock data - in production this would fetch from candidates API/database
	const mockCandidates = [
		{
			_key: '1',
			name: 'Firstname Lastname',
			partyAffiliation: 'Party Affiliation',
			href: '/candidates/firstname-lastname',
		},
		{
			_key: '2',
			name: 'Jane Smith',
			partyAffiliation: 'Independent',
			href: '/candidates/jane-smith',
		},
	];

	const buttons = transformButtons(section.candidatesBlockOptionalButton ? [section.candidatesBlockOptionalButton] : []);

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Candidates Block'>
			<CandidatesBlock
				backgroundColor={backgroundColor}
				header={{
					title: section.candidatesBlockHeader?.field_title,
					label: section.candidatesBlockHeader?.field_label,
					caption: section.candidatesBlockHeader?.field_caption,
					copy: <RichData value={section.candidatesBlockHeader?.block_summaryText} />,
					backgroundColor,
					buttons: transformButtons(section.candidatesBlockHeader?.list_buttons),
					textSize: resolveTextSize(section.candidatesBlockHeader?.field_textSize),
				}}
				candidates={mockCandidates}
				hasFilters={hasFilters}
				filters={hasFilters ? {} : undefined}
				pagination={hasFilters ? { currentPage: 1, totalPages: 1 } : undefined}
				optionalButton={!hasFilters && buttons.length > 0 ? buttons[0] : undefined}
			/>
		</section>
	);
}
