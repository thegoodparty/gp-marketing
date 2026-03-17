import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';

import { isButtonType } from '~/lib/buttonTransformer';

import { primaryButtonStyleType } from '~/ui/_lib/designTypesStore';
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

type ElectionsPositionHeroSectionProps = Extract<
	Sections,
	{ _type: 'component_electionsPositionHero' }
> & {
	officeData?: OfficeData;
};

export function ElectionsPositionHeroSection(props: ElectionsPositionHeroSectionProps) {
	const { officeData, ...section } = props;
	const backgroundColor = section.electionsPositionHeroDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.electionsPositionHeroDesignSettings.field_blockColorCreamMidnight))
		: 'midnight';

	const data =
		officeData ??
		(process.env.NODE_ENV === 'development'
			? mockOfficeData
			: {
					officeName: '—',
					stateName: '',
					countyName: undefined,
					cityName: undefined,
					electionDate: 'TBD',
					filingDate: 'TBD',
				});

	const rawCta = section.ctaAction;
	const ctaData = rawCta && isButtonType(rawCta) ? rawCta : null;
	const ctaHref = ctaData ? resolveCTALink(ctaData) : undefined;

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
						styleType: primaryButtonStyleType,
					},
				}}
			/>
		</section>
	);
}
