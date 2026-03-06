import Link from 'next/link';
import type { RaceDetail } from '~/types/elections';
import { BreadcrumbBlock, type BreadcrumbItem } from '~/ui/BreadcrumbBlock';
import { ElectionsPositionHero } from '~/ui/ElectionsPositionHero';
import { ElectionsPositionContentBlock } from '~/ui/ElectionsPositionContentBlock';
import { Container } from '~/ui/Container';

export type PositionPageContentProps = {
	officeName: string;
	stateName: string;
	countyName?: string;
	cityName?: string;
	electionDate: string;
	filingDate: string;
	breadcrumbs: BreadcrumbItem[];
	backHref: string;
	backLabel: string;
	candidatesHref: string;
	race?: RaceDetail | null;
};

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
		backHref,
		backLabel,
		candidatesHref,
		race,
	} = props;

	const gridItems = race ? buildGridItems(race) : [];
	const bottomItems = race ? buildBottomItems(race) : [];

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
					label: 'Run for office',
					buttonProps: { styleType: 'primary' },
				}}
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
									buttonType: 'internal',
									href: candidatesHref,
									label: 'View candidates',
									buttonProps: { styleType: 'secondary' },
								},
							}
						: undefined
				}
				topHeadline="Position Details"
				gridItems={gridItems}
				bottomItems={bottomItems}
			/>
		</>
	);
}
