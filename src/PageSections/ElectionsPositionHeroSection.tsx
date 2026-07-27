import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';
import type { TokenMap } from '~/lib/resolveTokens';
import { resolveSectionText } from '~/lib/resolveSectionText';

import { normalizeRawCtaToButton, type RawCtaInput, transformButton } from '~/lib/buttonTransformer';

import { primaryButtonStyleType } from '~/ui/_lib/designTypesStore';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { ElectionsPositionHero } from '~/ui/ElectionsPositionHero';

// Mock office data type - will be replaced with real data source
export type OfficeData = {
	officeName: string;
	stateName: string;
	countyName?: string;
	cityName?: string;
	electionDate: string;
	filingDate: string;
	ctaHref?: string;
	ctaLabel?: string;
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
	tokens?: TokenMap;
};

export function ElectionsPositionHeroSection(props: ElectionsPositionHeroSectionProps) {
	const { officeData, tokens, ...section } = props;
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
	const ctaData = rawCta
		? normalizeRawCtaToButton(rawCta as RawCtaInput, section._key ?? 'elections-position-hero-cta')
		: undefined;
	const fromSanity = ctaData ? transformButton(ctaData) : undefined;
	// `transformButton` returns the ComponentButtonProps union; `href` only exists on the
	// link-bearing variants, so read it defensively. On templated pages the CTA href/label
	// always arrive via `officeData`; the Sanity values are only a fallback.
	const sanityHref = fromSanity && 'href' in fromSanity ? fromSanity.href : undefined;
	const resolvedLabel = resolveSectionText(data.ctaLabel, tokens);
	const cta = fromSanity
		? {
				...fromSanity,
				href: data.ctaHref ?? sanityHref ?? '/run',
				label: resolvedLabel ?? fromSanity.label,
				buttonProps: {
					...fromSanity.buttonProps,
					styleType: primaryButtonStyleType,
				},
			}
		: {
				buttonType: 'internal' as const,
				href: data.ctaHref ?? '/run',
				label: resolvedLabel ?? 'Primary CTA',
				buttonProps: {
					styleType: primaryButtonStyleType,
				},
			};

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
				cta={cta}
			/>
		</section>
	);
}
