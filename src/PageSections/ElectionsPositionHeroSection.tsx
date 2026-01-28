import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';

import type { ButtonType } from '~/lib/buttonTransformer';

import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveCTALink } from '~/ui/_lib/resolveCTALink';
import { ElectionsPositionHero } from '~/ui/ElectionsPositionHero';

// Mock office data type - will be replaced with real data source
export type OfficeData = {
	officeName: string;
	stateName: string;
	countyName?: string;
	cityName?: string;
	electionDate: string;
	filingDate: string;
};

// Default mock data for development/preview
const mockOfficeData: OfficeData = {
	officeName: 'Mayor',
	stateName: 'Illinois',
	countyName: 'Cook County',
	cityName: 'Chicago',
	electionDate: 'November 5, 2024',
	filingDate: 'January 1, 2024 - March 15, 2024',
};

export function ElectionsPositionHeroSection(
	section: Extract<Sections, { _type: 'component_electionsPositionHero' }>,
	officeData?: OfficeData,
) {
	const backgroundColor = section.electionsPositionHeroDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.electionsPositionHeroDesignSettings.field_blockColorCreamMidnight))
		: 'midnight';

	// Use provided office data or fallback to mock data
	const data = officeData ?? mockOfficeData;

	// Transform CTA from Sanity ctaActionWithShared format
	const ctaData = section.ctaAction as unknown as ButtonType;
	const ctaHref = resolveCTALink(ctaData);

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Elections Position Hero'>
			<ElectionsPositionHero
				backgroundColor={backgroundColor}
				officeName={data.officeName}
				stateName={data.stateName}
				countyName={data.countyName}
				cityName={data.cityName}
				electionDate={data.electionDate}
				filingDate={data.filingDate}
				cta={{
					buttonType: 'internal',
					href: ctaHref ?? '/run',
					label: ctaData?.text ?? 'Primary CTA',
					buttonProps: {
						styleType: 'primary',
					},
				}}
			/>
		</section>
	);
}
