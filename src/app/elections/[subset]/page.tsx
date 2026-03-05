import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDistrictTypes, getDistrictNames } from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import { US_STATES } from '~/constants/usStates';
import { DEFAULT_YEAR_OFFSET } from '~/constants/display';
import { Container } from '~/ui/Container';
import { ListOfOfficesBlock } from '~/ui/ListOfOfficesBlock';
import { LocationLandingPageHero } from '~/ui/LocationLandingPageHero';

function formatElectionDate(year: number): string {
	const date = new Date(year, 10, 5);
	return date.toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
}

function getStateName(code: string): string {
	const upper = code.toUpperCase();
	const found = US_STATES.find(s => s.value === upper);
	return found?.label ?? code;
}

export default async function Page({
	params,
}: {
	params: Promise<{ subset: string }>;
}) {
	const { subset } = await params;
	const stateCode = subset.toUpperCase();

	if (!isValidStateCode(stateCode)) {
		notFound();
	}

	const electionYear = new Date().getFullYear() + DEFAULT_YEAR_OFFSET;
	const districtTypes = await getDistrictTypes({
		state: stateCode,
		electionYear,
	});

	if (districtTypes.length === 0) {
		return (
			<Container size="xl" className="py-(--container-padding)">
				<LocationLandingPageHero
					locationLevel="state"
					stateName={getStateName(stateCode)}
				/>
				<p className="mt-8 font-secondary text-body-2 text-neutral-600">
					No district data available for {getStateName(stateCode)} in {electionYear}.
				</p>
			</Container>
		);
	}

	const districtNamesByType = await Promise.all(
		districtTypes.map(async dt =>
			getDistrictNames({
				L2DistrictType: dt.L2DistrictType,
				state: stateCode,
				electionYear,
			}).then(names =>
				names.map(n => ({
					id: n.id,
					type: dt.L2DistrictType,
					position: n.L2DistrictName,
					nextElectionDate: formatElectionDate(electionYear),
					href: `/elections/${subset}/position?positionId=${encodeURIComponent(n.id)}&name=${encodeURIComponent(n.L2DistrictName)}`,
				})),
			),
		),
	);

	const offices = districtNamesByType.flat();

	return (
		<>
			<LocationLandingPageHero
				locationLevel="state"
				stateName={getStateName(stateCode)}
			/>
			<ListOfOfficesBlock
				heading={`Elections in ${getStateName(stateCode)}`}
				headline={`${offices.length} positions up for election in ${electionYear}`}
				defaultYear={electionYear}
				availableYears={[
					electionYear - 2,
					electionYear - 1,
					electionYear,
					electionYear + 1,
				]}
				offices={offices}
			/>
		</>
	);
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ subset: string }>;
}): Promise<Metadata> {
	const { subset } = await params;
	if (!isValidStateCode(subset)) return {};
	const stateName = getStateName(subset);
	return {
		title: `Elections in ${stateName} | Good Party`,
		description: `Browse elections and positions in ${stateName}.`,
	};
}
