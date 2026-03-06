import Link from 'next/link';
import { BreadcrumbBlock, type BreadcrumbItem } from '~/ui/BreadcrumbBlock';
import { ElectionsPositionHero } from '~/ui/ElectionsPositionHero';
import { ElectionsSidebar } from '~/ui/ElectionsSidebar';
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
};

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
	} = props;

	return (
		<>
			<BreadcrumbBlock backgroundColor="cream" breadcrumbs={breadcrumbs} />
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
		</>
	);
}
