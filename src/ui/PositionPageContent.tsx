import Link from 'next/link';
import type { RaceDetail } from '~/types/elections';
import { BreadcrumbBlock, type BreadcrumbItem } from '~/ui/BreadcrumbBlock';
import { CTABannerBlock } from '~/ui/CTABannerBlock';
import { CTABlock } from '~/ui/CTABlock';
import { ElectionsPositionHero } from '~/ui/ElectionsPositionHero';
import { ElectionsPositionContentBlock } from '~/ui/ElectionsPositionContentBlock';
import { FAQBlock } from '~/ui/FAQBlock';
import { TwoUpCardBlock } from '~/ui/TwoUpCardBlock';
import {
	POSITION_PAGE_CTA_BANNER,
	POSITION_PAGE_CTA_BLOCK,
	POSITION_PAGE_FAQ,
	POSITION_PAGE_TWO_UP_CARD,
} from '~/constants/positionPageStaticSections';
import { primaryButtonStyleType, secondaryButtonStyleType } from '~/ui/_lib/designTypesStore';
import { buildPositionPageSchema, buildBreadcrumbSchema, buildFAQSchema, buildDynamicFAQItems } from '~/lib/electionsHelpers';
import { toAbsoluteUrl } from '~/lib/url';
import { PageSchema } from '~/ui/PageSchema';

export type PositionPageContentProps = {
	officeName: string;
	stateName: string;
	countyName?: string;
	cityName?: string;
	electionDate: string;
	filingDate: string;
	breadcrumbs: BreadcrumbItem[];
	candidatesHref: string;
	race?: RaceDetail | null;
	pageUrl: string;
};

function replacePlaceholders(s: string, replacements: { officeName: string; stateName: string; locationName: string }): string {
	return s
		.replace(/\[office name\]/gi, replacements.officeName)
		.replace(/\[State\]/g, replacements.stateName)
		.replace(/\[County or City\]/g, replacements.locationName);
}

function buildGridItems(race: RaceDetail) {
	const items: { subhead: string; bodyCopy: React.ReactNode }[] = [];
	if (race.employmentType) items.push({ subhead: 'Employment Type', bodyCopy: race.employmentType });
	if (race.salary) items.push({ subhead: 'Salary', bodyCopy: race.salary });
	if (race.partisanType) items.push({ subhead: 'Partisan Type', bodyCopy: race.partisanType });
	if (race.frequency?.length) items.push({ subhead: 'Election Frequency', bodyCopy: formatFrequency(race.frequency) });
	return items;
}

function buildBottomItems(race: RaceDetail) {
	const items: { headline: string; bodyCopy: React.ReactNode }[] = [];
	if (race.eligibilityRequirements) items.push({ headline: 'Eligibility Requirements', bodyCopy: race.eligibilityRequirements });
	if (race.filingRequirements) items.push({ headline: 'Filing Requirements', bodyCopy: race.filingRequirements });
	if (race.paperworkInstructions) items.push({ headline: 'Paperwork Instructions', bodyCopy: race.paperworkInstructions });
	if (race.filingOfficeAddress) {
		items.push({
			headline: 'Filing Office',
			bodyCopy: (
				<Link href={`https://maps.google.com/?q=${encodeURIComponent(race.filingOfficeAddress)}`} target="_blank" rel="noopener noreferrer" className="text-goodparty-blue hover:underline">
					{race.filingOfficeAddress}
				</Link>
			),
		});
	}
	if (race.filingPhoneNumber) {
		items.push({
			headline: 'Filing Phone',
			bodyCopy: (
				<Link href={`tel:${race.filingPhoneNumber}`} className="text-goodparty-blue hover:underline">
					{race.filingPhoneNumber}
				</Link>
			),
		});
	}
	return items;
}

function formatFrequency(frequency: (string | number)[]): string {
	return frequency
		.map((v) => {
			const s = String(v ?? '').trim();
			if (/^\d+$/.test(s)) return `Every ${s} years`;
			return s;
		})
		.filter(Boolean)
		.join(', ');
}

export function PositionPageContent(props: PositionPageContentProps) {
	const {
		officeName,
		stateName,
		countyName,
		cityName,
		electionDate,
		filingDate,
		breadcrumbs,
		candidatesHref,
		race,
		pageUrl,
	} = props;

	const gridItems = race ? buildGridItems(race) : [];
	const bottomItems = race ? buildBottomItems(race) : [];

	const locationName = cityName ?? countyName ?? stateName;
	const replacements = { officeName, stateName, locationName };

	const positionPageSchema = race
		? buildPositionPageSchema({
				race,
				officeName,
				stateName,
				countyName,
				cityName,
				pageUrl,
			})
		: undefined;

	const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, toAbsoluteUrl);

	const faqItems = race
		? buildDynamicFAQItems(race, officeName, stateName)
		: POSITION_PAGE_FAQ.items.map(item => ({ title: item.title, copy: item.copy }));
	const faqSchema = buildFAQSchema(faqItems);

	return (
		<>
			<PageSchema schema={positionPageSchema} />
			<PageSchema schema={breadcrumbSchema} />
			<PageSchema schema={faqSchema} />
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
					label: 'Run for office',
					buttonProps: { styleType: primaryButtonStyleType },
				}}
			/>

			<CTABannerBlock
				backgroundColor={POSITION_PAGE_CTA_BANNER.backgroundColor}
				color={POSITION_PAGE_CTA_BANNER.color}
				title={replacePlaceholders(POSITION_PAGE_CTA_BANNER.title, replacements)}
				copy={POSITION_PAGE_CTA_BANNER.copy}
				button={POSITION_PAGE_CTA_BANNER.button}
			/>

			<ElectionsPositionContentBlock
				backgroundColor="cream"
				card={
					race?.positionDescription
						? {
								headline: officeName,
								subhead: 'About this position',
								bodyCopy: race.positionDescription,
								primaryCTA: {
									buttonType: 'external',
									href: '/get-a-demo',
									label: 'Book now',
									buttonProps: { styleType: secondaryButtonStyleType },
								},
							}
						: undefined
				}
				topHeadline="Position Details"
				gridItems={gridItems}
				bottomItems={bottomItems}
				rightColumnCTA={{
					buttonType: 'internal',
					href: candidatesHref,
					label: 'View candidates',
					buttonProps: { styleType: secondaryButtonStyleType },
				}}
			/>

			<FAQBlock
				backgroundColor={POSITION_PAGE_FAQ.backgroundColor}
				header={{
					title: POSITION_PAGE_FAQ.title,
					copy: POSITION_PAGE_FAQ.copy,
					buttons: [...POSITION_PAGE_FAQ.buttons],
				}}
				items={faqItems}
			/>

			<CTABlock
				backgroundColor={POSITION_PAGE_CTA_BLOCK.backgroundColor}
				color={POSITION_PAGE_CTA_BLOCK.color}
				label={POSITION_PAGE_CTA_BLOCK.label}
				title={replacePlaceholders(POSITION_PAGE_CTA_BLOCK.title, replacements)}
				copy={POSITION_PAGE_CTA_BLOCK.copy}
				buttons={[
					{
						buttonType: 'internal',
						href: candidatesHref,
						label: POSITION_PAGE_CTA_BLOCK.primaryButtonLabel,
						buttonProps: { styleType: primaryButtonStyleType },
					},
				]}
			/>

			<TwoUpCardBlock
				backgroundColor={POSITION_PAGE_TWO_UP_CARD.backgroundColor}
				card1={{
					...POSITION_PAGE_TWO_UP_CARD.card1,
					list: POSITION_PAGE_TWO_UP_CARD.card1.list.map((item) => ({ ...item })),
				}}
				card2={{
					...POSITION_PAGE_TWO_UP_CARD.card2,
					list: POSITION_PAGE_TWO_UP_CARD.card2.list.map((item) => ({ ...item })),
				}}
			/>
		</>
	);
}
