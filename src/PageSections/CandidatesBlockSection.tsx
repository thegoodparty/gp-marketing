import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';
import type { CandidateCard } from '~/ui/CandidatesBlock';

import { transformButtons } from '~/lib/buttonTransformer';

import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';

import { CandidatesBlock } from '~/ui/CandidatesBlock';
import { RichData } from '~/ui/RichData';

const mockCandidates: CandidateCard[] = [
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

type CandidatesBlockSectionProps = Extract<Sections, { _type: 'component_candidatesBlock' }> & {
	candidatesOverride?: CandidateCard[];
};

export function CandidatesBlockSection(props: CandidatesBlockSectionProps) {
	const { candidatesOverride, ...section } = props;
	const backgroundColor = section.candidatesBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.candidatesBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	const enablePagination = stegaClean(section.candidatesBlockFilterSettings?.field_enableFilters) ?? false;
	const candidates =
		candidatesOverride ?? (process.env.NODE_ENV === 'development' ? mockCandidates : []);

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
				candidates={candidates}
				enablePagination={enablePagination}
				initialDisplayCount={6}
				optionalButton={buttons.length > 0 ? buttons[0] : undefined}
			/>
		</section>
	);
}
