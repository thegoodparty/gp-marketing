import Link from 'next/link';
import type { RaceDetail } from '~/types/elections';
import { BreadcrumbBlock, type BreadcrumbItem } from '~/ui/BreadcrumbBlock';
import { ElectionsPositionHero } from '~/ui/ElectionsPositionHero';
import { ElectionsSidebar, type SidebarLink } from '~/ui/ElectionsSidebar';
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

function buildSidebarLinks(race: RaceDetail): SidebarLink[] {
	const links: SidebarLink[] = [];
	if (race.filingOfficeAddress) {
		links.push({ label: 'Filing Office', href: `https://maps.google.com/?q=${encodeURIComponent(race.filingOfficeAddress)}`, icon: 'MapPin' });
	}
	if (race.filingPhoneNumber) {
		links.push({ label: 'Filing Phone', href: `tel:${race.filingPhoneNumber}`, icon: 'Phone' });
	}
	return links;
}

function buildGridItems(race: RaceDetail) {
	const items: { subhead: string; bodyCopy: string }[] = [];
	if (race.employmentType) items.push({ subhead: 'Employment Type', bodyCopy: race.employmentType });
	if (race.salary) items.push({ subhead: 'Salary', bodyCopy: race.salary });
	if (race.partisanType) items.push({ subhead: 'Partisan Type', bodyCopy: race.partisanType });
	if (race.frequency?.length) items.push({ subhead: 'Election Frequency', bodyCopy: race.frequency.join(', ') });
	return items;
}

function buildBottomItems(race: RaceDetail) {
	const items: { headline: string; bodyCopy: string }[] = [];
	if (race.eligibilityRequirements) items.push({ headline: 'Eligibility Requirements', bodyCopy: race.eligibilityRequirements });
	if (race.filingRequirements) items.push({ headline: 'Filing Requirements', bodyCopy: race.filingRequirements });
	if (race.paperworkInstructions) items.push({ headline: 'Paperwork Instructions', bodyCopy: race.paperworkInstructions });
	return items;
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

	const sidebarLinks = race ? buildSidebarLinks(race) : [];
	const aboutOffice = race?.positionDescription;
	const termLength = race?.frequency?.length ? race.frequency.join(', ') : undefined;

	const gridItems = race ? buildGridItems(race) : [];
	const bottomItems = race ? buildBottomItems(race) : [];
	const hasContentBlock = gridItems.length > 0 || bottomItems.length > 0;

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
					label: 'View candidates',
					buttonProps: { styleType: 'primary' },
				}}
			/>
			<Container size="xl" className="py-(--container-padding)">
				<div className="grid lg:grid-cols-[minmax(400px,auto)_1fr] gap-[80px]">
					<aside className="sticky top-4 self-start">
						<ElectionsSidebar
							links={sidebarLinks.length > 0 ? sidebarLinks : undefined}
							aboutOffice={aboutOffice}
							termLength={termLength}
							electionDate={electionDate !== 'TBD' ? electionDate : undefined}
							cta={{
								buttonType: 'internal',
								href: candidatesHref,
								label: 'View candidates',
								buttonProps: { styleType: 'secondary' },
							}}
						/>
					</aside>
					<div className="flex flex-col gap-8">
						<p className="font-secondary text-body-2 text-neutral-600">
							<Link href={backHref} className="text-goodparty-blue hover:underline">
								{backLabel}
							</Link>
						</p>
					</div>
				</div>
			</Container>
			{hasContentBlock && (
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
			)}
		</>
	);
}
