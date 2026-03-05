import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPositionById } from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import { US_STATES } from '~/constants/usStates';
import { ElectionsPositionHero } from '~/ui/ElectionsPositionHero';
import { ElectionsSidebar } from '~/ui/ElectionsSidebar';
import { Container } from '~/ui/Container';

function getStateName(code: string): string {
	const upper = code.toUpperCase();
	const found = US_STATES.find(s => s.value === upper);
	return found?.label ?? code;
}

function formatFilingPeriod(
	periods: Array<{ startOn: string; endOn: string }> | undefined,
): string {
	if (!periods?.length) return 'TBD';
	const first = periods[0];
	const start = new Date(first.startOn).toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
	const end = new Date(first.endOn).toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
	return `${start} - ${end}`;
}

function formatElectionDate(dateStr: string | undefined): string {
	if (!dateStr) return 'TBD';
	return new Date(dateStr).toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
}

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ subset: string }>;
	searchParams: Promise<{ positionId?: string; name?: string }>;
}) {
	const { subset } = await params;
	const { positionId, name: nameParam } = await searchParams;

	if (!isValidStateCode(subset) || !positionId) {
		notFound();
	}

	const stateName = getStateName(subset);
	const position = await getPositionById(positionId);

	const officeName =
		position?.position?.name ??
		position?.name ??
		(typeof nameParam === 'string' ? decodeURIComponent(nameParam) : 'Position');
	const electionDate = formatElectionDate(position?.election?.electionDay);
	const filingDate = formatFilingPeriod(position?.filingPeriods);

	const candidatesHref = `/elections/${subset}/position/candidates?positionId=${encodeURIComponent(positionId)}`;

	return (
		<>
			<ElectionsPositionHero
				backgroundColor="midnight"
				officeName={officeName}
				stateName={stateName}
				electionDate={electionDate || 'TBD'}
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
							<Link href={`/elections/${subset}`} className="text-goodparty-blue hover:underline">
								Back to {stateName} elections
							</Link>
						</p>
					</div>
				</div>
			</Container>
		</>
	);
}

export async function generateMetadata({
	params,
	searchParams,
}: {
	params: Promise<{ subset: string }>;
	searchParams: Promise<{ positionId?: string; name?: string }>;
}): Promise<Metadata> {
	const { subset } = await params;
	const { name } = await searchParams;
	if (!isValidStateCode(subset)) return {};
	const stateName = getStateName(subset);
	const positionName =
		typeof name === 'string' ? decodeURIComponent(name) : 'Position';
	return {
		title: `${positionName} in ${stateName} | Good Party`,
		description: `Election details and candidates for ${positionName} in ${stateName}.`,
	};
}
