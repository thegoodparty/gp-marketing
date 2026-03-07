import type { RaceDetail } from '~/types/elections';
import { BreadcrumbBlock, type BreadcrumbItem } from '~/ui/BreadcrumbBlock';
import { CTABannerBlock } from '~/ui/CTABannerBlock';
import { CTAImageBlock } from '~/ui/CTAImageBlock';
import { CandidatesBlock, type CandidateCard } from '~/ui/CandidatesBlock';
import { ElectionsPositionHero } from '~/ui/ElectionsPositionHero';
import { TwoUpCardBlock } from '~/ui/TwoUpCardBlock';
import {
	CANDIDATES_PAGE_CTA_BANNER,
	CANDIDATES_PAGE_CTA_IMAGE,
	CANDIDATES_PAGE_TWO_UP_CARD,
} from '~/constants/candidatesPageStaticSections';

export type CandidatesPageContentProps = {
	officeName: string;
	stateName: string;
	countyName?: string;
	cityName?: string;
	electionDate: string;
	filingDate: string;
	breadcrumbs: BreadcrumbItem[];
	candidatesHref: string;
	locationHref: string;
	candidates: CandidateCard[];
	race?: RaceDetail | null;
};

function replacePlaceholders(s: string, replacements: { officeName: string; locationName: string }): string {
	return s
		.replace(/\[office\]/gi, replacements.officeName)
		.replace(/\[location\]/g, replacements.locationName);
}

export function CandidatesPageContent(props: CandidatesPageContentProps) {
	const {
		officeName,
		stateName,
		countyName,
		cityName,
		electionDate,
		filingDate,
		breadcrumbs,
		candidatesHref,
		locationHref,
		candidates,
	} = props;

	const locationParts = [cityName, countyName, stateName].filter(Boolean);
	const locationName = locationParts.join(', ');
	const replacements = { officeName, locationName };

	const ctaImageTitle = replacePlaceholders(CANDIDATES_PAGE_CTA_IMAGE.title, replacements);
	const ctaImageCopy = replacePlaceholders(CANDIDATES_PAGE_CTA_IMAGE.copy, replacements);

	return (
		<>
			<BreadcrumbBlock backgroundColor="midnight" breadcrumbs={breadcrumbs} />
			<ElectionsPositionHero
				backgroundColor="midnight"
				officeName={officeName}
				stateName={stateName}
				countyName={countyName}
				cityName={cityName}
				electionDate={electionDate}
				filingDate={filingDate}
				cta={{
					buttonType: 'internal',
					href: candidatesHref,
					label: 'Back to position',
					buttonProps: { styleType: 'primary' },
				}}
			/>
			<CandidatesBlock
				backgroundColor="cream"
				header={{
					title: `Candidates for ${officeName}`,
					copy: `Candidates running for ${officeName} in ${locationName}.`,
				}}
				candidates={candidates}
				enablePagination
				initialDisplayCount={6}
			/>
			<CTABannerBlock
				backgroundColor={CANDIDATES_PAGE_CTA_BANNER.backgroundColor}
				color={CANDIDATES_PAGE_CTA_BANNER.color}
				title={CANDIDATES_PAGE_CTA_BANNER.title}
				copy={CANDIDATES_PAGE_CTA_BANNER.copy}
				button={CANDIDATES_PAGE_CTA_BANNER.button}
			/>
			<CTAImageBlock
				backgroundColor={CANDIDATES_PAGE_CTA_IMAGE.backgroundColor}
				color={CANDIDATES_PAGE_CTA_IMAGE.color}
				title={ctaImageTitle}
				copy={ctaImageCopy}
				showFullImage={CANDIDATES_PAGE_CTA_IMAGE.showFullImage}
				primaryButton={{
					...CANDIDATES_PAGE_CTA_IMAGE.primaryButton,
					href: locationHref,
				}}
				image={{ asset: { _ref: CANDIDATES_PAGE_CTA_IMAGE.imageAssetRef } }}
			/>
			<TwoUpCardBlock
				backgroundColor={CANDIDATES_PAGE_TWO_UP_CARD.backgroundColor}
				card1={{
					...CANDIDATES_PAGE_TWO_UP_CARD.card1,
					list: CANDIDATES_PAGE_TWO_UP_CARD.card1.list.map((item) => ({ ...item })),
				}}
				card2={{
					...CANDIDATES_PAGE_TWO_UP_CARD.card2,
					list: CANDIDATES_PAGE_TWO_UP_CARD.card2.list.map((item) => ({ ...item })),
				}}
			/>
		</>
	);
}
